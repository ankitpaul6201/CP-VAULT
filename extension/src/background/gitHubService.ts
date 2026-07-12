import { GitHubUser, GitHubRepo } from '../shared/types';
import { Logger } from '../shared/utils/logger';

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

  async getUser(token: string): Promise<GitHubUser> {
    const headers = await this.getHeaders(token);
    const response = await fetch('https://api.github.com/user', { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      login: data.login,
      avatarUrl: data.avatar_url,
      htmlUrl: data.html_url,
    };
  },

  async listRepositories(token: string): Promise<GitHubRepo[]> {
    const headers = await this.getHeaders(token);
    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch repositories: ${response.statusText}`);
    }
    const data = await response.json();
    return data.map((repo: any) => ({
      name: repo.name,
      fullName: repo.full_name,
      private: repo.private,
      htmlUrl: repo.html_url,
    }));
  },

  async createRepository(token: string, name: string, isPrivate: boolean): Promise<GitHubRepo> {
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
    if (!response.ok) {
      throw new Error(`Failed to create repository: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      name: data.name,
      fullName: data.full_name,
      private: data.private,
      htmlUrl: data.html_url,
    };
  },

  async checkRepositoryExists(token: string, owner: string, repo: string): Promise<boolean> {
    const headers = await this.getHeaders(token);
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (response.status === 404) return false;
      return response.ok;
    } catch (err) {
      Logger.warn(`Check repository exists caught error:`, err);
      return true; // default to true on network errors to avoid false disconnects
    }
  },

  async getFile(token: string, owner: string, repo: string, path: string, branch = 'main'): Promise<{ content: string; sha: string } | null> {
    const headers = await this.getHeaders(token);
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, { headers });
      if (response.status === 404) return null;
      if (!response.ok) {
        throw new Error(`Failed to get file: ${response.statusText}`);
      }
      const data = await response.json();
      const content = atob(data.content.replace(/\s/g, ''));
      return { content, sha: data.sha };
    } catch (err) {
      Logger.warn(`File ${path} checking caught error:`, err);
      return null;
    }
  },

  /**
   * Commit multiple files in a single, atomic operation using Git Database API.
   * This prevents multiple commits for a single problem sync.
   */
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
  }
};
