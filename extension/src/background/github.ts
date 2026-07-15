import { GitHubUser, GitHubRepo } from '../shared/types';
import { Logger } from '../shared/utils/logger';

export class GitHubError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubError';
  }
}

export class TokenExpiredError extends GitHubError {
  constructor() {
    super('Token expired.');
    this.name = 'TokenExpiredError';
  }
}

export class TokenInvalidError extends GitHubError {
  constructor() {
    super('GitHub authentication failed.');
    this.name = 'TokenInvalidError';
  }
}

export class MissingRepoScopeError extends GitHubError {
  constructor() {
    super('Repository access denied.');
    this.name = 'MissingRepoScopeError';
  }
}

export class RateLimitExceededError extends GitHubError {
  constructor() {
    super('GitHub API rate limit exceeded.');
    this.name = 'RateLimitExceededError';
  }
}

export class NetworkError extends GitHubError {
  constructor() {
    super('Network connection failed.');
    this.name = 'NetworkError';
  }
}

export class RepositoryNotFoundError extends GitHubError {
  constructor() {
    super('Repository not found.');
    this.name = 'RepositoryNotFoundError';
  }
}

export class RepositoryAccessDeniedError extends GitHubError {
  constructor() {
    super('Repository access denied.');
    this.name = 'RepositoryAccessDeniedError';
  }
}

export class RepositoryIsPrivateError extends GitHubError {
  constructor() {
    super('Repository is private.');
    this.name = 'RepositoryIsPrivateError';
  }
}

export interface FileCommit {
  path: string;
  content: string;
}

export const GitHubService = {
  async getHeaders(token: string): Promise<HeadersInit> {
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    };
  },

  async handleResponse(response: Response): Promise<void> {
    const scopesHeader = response.headers.get('X-OAuth-Scopes');
    if (scopesHeader !== null) {
      const scopes = scopesHeader.split(',').map(s => s.trim());
      if (!scopes.includes('repo')) {
        throw new MissingRepoScopeError();
      }
    }

    if (response.status === 401) {
      throw new TokenExpiredError();
    }

    if (response.status === 403 || response.status === 429) {
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
      if (rateLimitRemaining === '0') {
        throw new RateLimitExceededError();
      }
      throw new RepositoryAccessDeniedError();
    }

    if (response.status === 404) {
      throw new RepositoryNotFoundError();
    }

    if (!response.ok) {
      throw new GitHubError(`GitHub API error: ${response.statusText}`);
    }
  },

  async getUser(token: string): Promise<GitHubUser> {
    try {
      const headers = await this.getHeaders(token);
      const response = await fetch('https://api.github.com/user', { headers });
      if (response.status === 401) {
        throw new TokenExpiredError();
      }
      await this.handleResponse(response);
      const data = await response.json();
      return {
        login: data.login,
        avatarUrl: data.avatar_url,
        htmlUrl: data.html_url,
      };
    } catch (err) {
      if (err instanceof GitHubError) throw err;
      throw new NetworkError();
    }
  },

  async listRepositories(token: string): Promise<GitHubRepo[]> {
    try {
      const headers = await this.getHeaders(token);
      const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', { headers });
      if (response.status === 401) {
        throw new TokenExpiredError();
      }
      await this.handleResponse(response);
      const data = await response.json();
      return data.map((repo: any) => ({
        name: repo.name,
        fullName: repo.full_name,
        private: repo.private,
        htmlUrl: repo.html_url,
      }));
    } catch (err) {
      if (err instanceof GitHubError) throw err;
      throw new NetworkError();
    }
  },

  async createRepository(token: string, name: string, isPrivate: boolean): Promise<GitHubRepo> {
    try {
      const headers = await this.getHeaders(token);
      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name,
          private: isPrivate,
          description: 'My Competitive Programming Solutions synced automatically using CP Vault',
          auto_init: true,
        }),
      });
      if (response.status === 401) {
        throw new TokenExpiredError();
      }
      await this.handleResponse(response);
      const data = await response.json();
      return {
        name: data.name,
        fullName: data.full_name,
        private: data.private,
        htmlUrl: data.html_url,
      };
    } catch (err) {
      if (err instanceof GitHubError) throw err;
      throw new NetworkError();
    }
  },

  async checkRepositoryExists(token: string, owner: string, repo: string): Promise<boolean> {
    try {
      const headers = await this.getHeaders(token);
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (response.status === 404) return false;
      await this.handleResponse(response);
      return response.ok;
    } catch (err) {
      if (err instanceof RepositoryNotFoundError) return false;
      if (err instanceof GitHubError) throw err;
      throw new NetworkError();
    }
  },

  async getFile(token: string, owner: string, repo: string, path: string, branch = 'main'): Promise<{ content: string; sha: string } | null> {
    try {
      const headers = await this.getHeaders(token);
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, { headers });
      if (response.status === 404) return null;
      await this.handleResponse(response);
      const data = await response.json();
      const content = atob(data.content.replace(/\s/g, ''));
      return { content, sha: data.sha };
    } catch (err) {
      Logger.warn(`File ${path} checking caught error:`, err);
      return null;
    }
  },

  async commitFiles(
    token: string,
    owner: string,
    repo: string,
    files: FileCommit[],
    commitMessage: string,
    branch = 'main'
  ): Promise<string> {
    const headers = await this.getHeaders(token);

    // 1. Get the current commit SHA of the branch
    let refSha: string;
    let baseTreeSha: string;
    try {
      const refResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`, { headers });
      if (!refResponse.ok) {
        // If branch main doesn't exist, check master
        const altResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/master`, { headers });
        if (!altResponse.ok) {
          throw new Error(`Branch ${branch} does not exist and cannot get ref`);
        }
        const altData = await altResponse.json();
        refSha = altData.object.sha;
        branch = 'master';
      } else {
        const refData = await refResponse.json();
        refSha = refData.object.sha;
      }

      // Get commit tree SHA
      const commitResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${refSha}`, { headers });
      const commitData = await commitResponse.json();
      baseTreeSha = commitData.tree.sha;
    } catch (err) {
      throw new Error(`Failed to get base reference commit: ${err instanceof Error ? err.message : String(err)}`);
    }

    // 2. Create blobs for each file
    const treeItems = [];
    for (const file of files) {
      const blobResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: btoa(unescape(encodeURIComponent(file.content))),
          encoding: 'base64',
        }),
      });
      if (!blobResponse.ok) {
        throw new Error(`Failed to create blob for ${file.path}: ${blobResponse.statusText}`);
      }
      const blobData = await blobResponse.json();
      treeItems.push({
        path: file.path,
        mode: '100644', // normal file
        type: 'blob',
        sha: blobData.sha,
      });
    }

    // 3. Create a new Tree
    const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treeItems,
      }),
    });
    if (!treeResponse.ok) {
      throw new Error(`Failed to create tree: ${treeResponse.statusText}`);
    }
    const treeData = await treeResponse.json();
    const newTreeSha = treeData.sha;

    // 4. Create Commit
    const commitCreateResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: commitMessage,
        tree: newTreeSha,
        parents: [refSha],
      }),
    });
    if (!commitCreateResponse.ok) {
      throw new Error(`Failed to create commit: ${commitCreateResponse.statusText}`);
    }
    const newCommitData = await commitCreateResponse.json();
    const newCommitSha = newCommitData.sha;

    // 5. Update reference
    const refUpdateResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        sha: newCommitSha,
        force: false,
      }),
    });
    if (!refUpdateResponse.ok) {
      throw new Error(`Failed to update branch reference: ${refUpdateResponse.statusText}`);
    }

    return newCommitSha;
  },

  async rebuildHistoryFromTree(token: string, owner: string, repo: string, branch = 'main'): Promise<{ logs: any[] }> {
    const headers = await this.getHeaders(token);
    
    let refBranch = branch;
    try {
      const refResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`, { headers });
      if (!refResponse.ok) {
        refBranch = 'master';
      }
    } catch(e) {
      refBranch = 'master';
    }

    const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${refBranch}?recursive=1`, { headers });
    if (!treeResponse.ok) {
      throw new Error(`Failed to fetch repository tree: ${treeResponse.statusText}`);
    }

    const treeData = await treeResponse.json();
    if (!treeData.tree || !Array.isArray(treeData.tree)) {
      return { logs: [] };
    }

    const logs: any[] = [];
    const now = new Date().toISOString();

    for (const item of treeData.tree) {
      if (item.type === 'blob' && item.path.includes('solution.')) {
        const parts = item.path.split('/');
        if (parts.length >= 3) {
          const platform = parts[0];
          let difficulty = 'Unknown';
          let folderName = '';

          if (parts.length === 4) {
            difficulty = parts[1];
            folderName = parts[2];
          } else if (parts.length === 3) {
            folderName = parts[1];
          }

          let problemId = folderName;
          let problemName = folderName;
          const separatorIdx = folderName.indexOf(' - ');
          if (separatorIdx !== -1) {
            problemId = folderName.substring(0, separatorIdx);
            problemName = folderName.substring(separatorIdx + 3);
          }

          const ext = item.path.split('.').pop()?.toLowerCase();
          let language = 'Unknown';
          if (ext === 'cpp' || ext === 'cc') language = 'C++';
          else if (ext === 'py') language = 'Python';
          else if (ext === 'js') language = 'JavaScript';
          else if (ext === 'ts') language = 'TypeScript';
          else if (ext === 'java') language = 'Java';
          else if (ext === 'cs') language = 'C#';
          else if (ext === 'go') language = 'Go';

          logs.push({
            id: `${platform}-${problemId}-rebuild`,
            platform,
            problemId,
            problemName,
            difficulty,
            language,
            syncedAt: now,
            codeHash: item.sha
          });
        }
      }
    }

    return { logs };
  }
};
