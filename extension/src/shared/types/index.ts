export interface SubmissionMetadata {
  platform: 'LeetCode' | 'Codeforces' | 'CodeChef' | 'HackerRank';
  problemId: string; // e.g. "0001", "71A"
  problemName: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Unknown';
  language: string;
  runtime?: string;
  memory?: string;
  submissionTime: string; // YYYY-MM-DD
  status: 'Accepted' | string;
  url: string;
  tags: string[];
  code: string;
  problemStatement?: string;
  constraints?: string;
  examples?: string;
  notes?: string;
  complexity?: string;
}

export type FolderNamingStyle = 'number-name' | 'name-only';

export interface SyncSettings {
  githubToken: string | null;
  authMethod: 'oauth' | 'pat' | null;
  repoOwner: string | null;
  repoName: string | null;
  autoSync: boolean;
  platforms: {
    LeetCode: boolean;
    Codeforces: boolean;
    CodeChef: boolean;
    HackerRank: boolean;
    [key: string]: boolean;
  };
  commitMessageTemplate: string; // e.g., "Solved {platform} {problemId} - {problemName}"
  folderNamingStyle: FolderNamingStyle;
  retryFailed: boolean;
  darkMode: boolean;
  clientId: string | null;
  clientSecret: string | null;
  proxyUrl: string | null;
}

export interface SyncLog {
  id: string; // unique hash or submission time + platform + problemId
  platform: string;
  problemId: string;
  problemName: string;
  difficulty: string;
  language: string;
  syncedAt: string; // ISO String
  codeHash: string; // SHA256 or simple hash to compare duplicates
}

export interface SyncHistory {
  logs: SyncLog[];
  streak: {
    currentStreak: number;
    lastSolvedDate: string | null; // YYYY-MM-DD
  };
}

export interface QueueItem {
  id: string;
  metadata: SubmissionMetadata;
  addedAt: string; // ISO
  attempts: number;
  error?: string;
}

export interface GitHubRepo {
  name: string;
  fullName: string;
  private: boolean;
  htmlUrl: string;
}

export interface GitHubUser {
  login: string;
  avatarUrl: string;
  htmlUrl: string;
}
