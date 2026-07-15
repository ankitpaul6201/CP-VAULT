import { GitHubUser, GitHubRepo } from '../shared/types';
import { FileCommit } from '../background/github';

export const mockGitHubUser: GitHubUser = {
  login: 'mock-user',
  avatarUrl: 'https://github.com/mock-user.png',
  htmlUrl: 'https://github.com/mock-user',
};

export const mockRepos: GitHubRepo[] = [
  { name: 'Coding-Solutions', fullName: 'mock-user/Coding-Solutions', private: true, htmlUrl: 'https://github.com/mock-user/Coding-Solutions' },
  { name: 'competitive-programming', fullName: 'mock-user/competitive-programming', private: false, htmlUrl: 'https://github.com/mock-user/competitive-programming' },
];

export class GitHubMockAPI {
  private files: Map<string, string> = new Map();
  private commits: string[] = [];

  constructor() {
    this.files.set('README.md', '# CP Solutions');
  }

  async getFile(path: string): Promise<{ content: string; sha: string } | null> {
    const content = this.files.get(path);
    if (!content) return null;
    return {
      content,
      sha: `mock-sha-${path}`,
    };
  }

  async commitFiles(files: FileCommit[], _message: string): Promise<string> {
    const commitSha = `mock-commit-${Date.now()}`;
    for (const file of files) {
      this.files.set(file.path, file.content);
    }
    this.commits.push(commitSha);
    return commitSha;
  }

  getFiles() {
    return this.files;
  }

  getCommits() {
    return this.commits;
  }
}
