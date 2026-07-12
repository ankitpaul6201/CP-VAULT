import { SyncSettings, SyncHistory, QueueItem, GitHubUser } from '../shared/types';

const DEFAULT_SETTINGS: SyncSettings = {
  githubToken: null,
  authMethod: null,
  repoOwner: null,
  repoName: null,
  autoSync: true,
  platforms: {
    LeetCode: true,
    Codeforces: true,
    CodeChef: true,
    HackerRank: true,
    'Coding Ninjas': true,
    GeeksforGeeks: true,
    WorldQuant: true,
  },
  commitMessageTemplate: 'Solved {platform} {problemId} - {problemName}',
  folderNamingStyle: 'number-name',
  retryFailed: true,
  darkMode: true,
  clientId: 'YOUR_GITHUB_CLIENT_ID',
  clientSecret: 'YOUR_GITHUB_CLIENT_SECRET',
  proxyUrl: 'http://localhost:3000',
};

const DEFAULT_HISTORY: SyncHistory = {
  logs: [],
  streak: {
    currentStreak: 0,
    lastSolvedDate: null,
  },
};

export const StorageService = {
  async getSettings(): Promise<SyncSettings> {
    return new Promise((resolve) => {
      chrome.storage.local.get({ settings: DEFAULT_SETTINGS }, (result) => {
        resolve({ ...DEFAULT_SETTINGS, ...result.settings });
      });
    });
  },

  async updateSettings(updates: Partial<SyncSettings>): Promise<SyncSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...updates };
    return new Promise((resolve) => {
      chrome.storage.local.set({ settings: updated }, () => {
        resolve(updated);
      });
    });
  },

  async getHistory(): Promise<SyncHistory> {
    return new Promise((resolve) => {
      chrome.storage.local.get({ history: DEFAULT_HISTORY }, (result) => {
        resolve({ ...DEFAULT_HISTORY, ...result.history });
      });
    });
  },

  async updateHistory(updates: Partial<SyncHistory>): Promise<SyncHistory> {
    const current = await this.getHistory();
    const updated = { ...current, ...updates };
    return new Promise((resolve) => {
      chrome.storage.local.set({ history: updated }, () => {
        resolve(updated);
      });
    });
  },

  async getQueue(): Promise<QueueItem[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get({ queue: [] }, (result) => {
        resolve(result.queue || []);
      });
    });
  },

  async saveQueue(queue: QueueItem[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ queue }, () => {
        resolve();
      });
    });
  },

  async getGitHubUser(): Promise<GitHubUser | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get({ githubUser: null }, (result) => {
        resolve(result.githubUser || null);
      });
    });
  },

  async saveGitHubUser(user: GitHubUser | null): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ githubUser: user }, () => {
        resolve();
      });
    });
  },

  async clearAuth(): Promise<void> {
    await this.updateSettings({
      githubToken: null,
      authMethod: null,
      repoOwner: null,
      repoName: null,
    });
    await this.saveGitHubUser(null);
  }
};
