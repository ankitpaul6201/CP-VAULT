import { create } from 'zustand';
import { SyncSettings, SyncHistory, QueueItem, GitHubUser, GitHubRepo } from './types';
import { StorageService } from '../background/storageService';
import { GitHubService } from '../background/gitHubService';

interface AppState {
  settings: SyncSettings | null;
  history: SyncHistory | null;
  queue: QueueItem[];
  githubUser: GitHubUser | null;
  repositories: GitHubRepo[];
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  updateSettings: (updates: Partial<SyncSettings>) => Promise<void>;
  loginPAT: (token: string) => Promise<boolean>;
  loginOAuth: (clientId: string, clientSecret: string | null | undefined, proxyUrl: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchRepositories: () => Promise<void>;
  createRepository: (name: string, isPrivate: boolean) => Promise<boolean>;
  clearQueue: () => Promise<void>;
  syncSubmissionManually: (meta: any) => Promise<boolean>;
}

export const useAppStore = create<AppState>((set, get) => {
  // Listen for changes in chrome storage to keep store in sync across components/pages
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.onChanged.addListener(async (changes, namespace) => {
      if (namespace === 'local') {
        const updatedState: Partial<AppState> = {};
        if (changes.settings) {
          updatedState.settings = changes.settings.newValue;
        }
        if (changes.history) {
          updatedState.history = changes.history.newValue;
        }
        if (changes.queue) {
          updatedState.queue = changes.queue.newValue;
        }
        if (changes.githubUser) {
          updatedState.githubUser = changes.githubUser.newValue;
        }
        set(updatedState);
      }
    });
  }

  return {
    settings: null,
    history: null,
    queue: [],
    githubUser: null,
    repositories: [],
    isLoading: false,
    error: null,

    initialize: async () => {
      set({ isLoading: true });
      try {
        const settings = await StorageService.getSettings();
        const history = await StorageService.getHistory();
        const queue = await StorageService.getQueue();
        const githubUser = await StorageService.getGitHubUser();

        set({
          settings,
          history,
          queue,
          githubUser,
          isLoading: false,
        });

        // Automatically fetch repositories if logged in
        if (settings.githubToken) {
          get().fetchRepositories().catch(() => {});
        }
      } catch (err) {
        set({ error: 'Failed to initialize CP Vault state', isLoading: false });
      }
    },

    updateSettings: async (updates) => {
      set({ isLoading: true });
      try {
        const updated = await StorageService.updateSettings(updates);
        set({ settings: updated, isLoading: false });
      } catch (err) {
        set({ error: 'Failed to update settings', isLoading: false });
      }
    },

    loginPAT: async (token) => {
      set({ isLoading: true, error: null });
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'LOGIN_PAT', token }, (response) => {
          set({ isLoading: false });
          if (response?.success) {
            set({ githubUser: response.user });
            get().fetchRepositories().catch(() => {});
            resolve(true);
          } else {
            set({ error: response?.error || 'Failed to authenticate via PAT' });
            resolve(false);
          }
        });
      });
    },

    loginOAuth: async (clientId, clientSecret, proxyUrl) => {
      set({ isLoading: true, error: null });
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'START_OAUTH', clientId, clientSecret, proxyUrl }, (response) => {
          set({ isLoading: false });
          if (response?.success) {
            set({ githubUser: response.user });
            get().fetchRepositories().catch(() => {});
            resolve(true);
          } else {
            set({ error: response?.error || 'OAuth authentication failed' });
            resolve(false);
          }
        });
      });
    },

    logout: async () => {
      set({ isLoading: true });
      try {
        await StorageService.clearAuth();
        set({
          githubUser: null,
          repositories: [],
          isLoading: false,
        });
      } catch (err) {
        set({ error: 'Failed to log out', isLoading: false });
      }
    },

    fetchRepositories: async () => {
      const state = get();
      if (!state.settings?.githubToken) return;

      set({ isLoading: true, error: null });
      try {
        const repos = await GitHubService.listRepositories(state.settings.githubToken);
        set({ repositories: repos, isLoading: false });
      } catch (err) {
        set({ error: 'Failed to fetch repositories from GitHub', isLoading: false });
      }
    },

    createRepository: async (name, isPrivate) => {
      const state = get();
      if (!state.settings?.githubToken) return false;

      set({ isLoading: true, error: null });
      try {
        const newRepo = await GitHubService.createRepository(
          state.settings.githubToken,
          name,
          isPrivate
        );
        await get().updateSettings({
          repoOwner: state.githubUser?.login || null,
          repoName: newRepo.name,
        });
        
        // Prepend the new repo to local list to bypass GitHub API indexing delay
        const currentRepos = get().repositories;
        const alreadyExists = currentRepos.some(r => r.name.toLowerCase() === newRepo.name.toLowerCase());
        if (!alreadyExists) {
          set({ repositories: [newRepo, ...currentRepos] });
        }

        await get().fetchRepositories();
        set({ isLoading: false });
        return true;
      } catch (err) {
        set({ error: err instanceof Error ? err.message : 'Failed to create repository', isLoading: false });
        set({ isLoading: false });
        return false;
      }
    },

    clearQueue: async () => {
      set({ isLoading: true });
      try {
        await StorageService.saveQueue([]);
        set({ queue: [], isLoading: false });
      } catch (err) {
        set({ error: 'Failed to clear sync queue', isLoading: false });
      }
    },

    syncSubmissionManually: async (meta) => {
      set({ isLoading: true, error: null });
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'MANUAL_SYNC', submission: meta }, (response) => {
          set({ isLoading: false });
          if (response?.success) {
            resolve(true);
          } else {
            set({ error: response?.error || 'Manual sync failed' });
            resolve(false);
          }
        });
      });
    }
  };
});
