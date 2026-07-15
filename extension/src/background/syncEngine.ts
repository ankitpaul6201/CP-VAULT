import { StorageService } from './storage';
import { GitHubService } from './github';
import { READMEGenerator } from '../shared/utils/readme';
import { NotificationService } from './notification';
import { Logger } from '../shared/utils/logger';
import { SubmissionMetadata, SyncLog, QueueItem } from '../shared/types';
import { RetryQueue } from './retryQueue';

let syncQueuePromise: Promise<void> = Promise.resolve();

export const SyncEngine = {
  initialize() {
    Logger.info('Sync Engine Initialized.');
    // Register processor for retry queue
    RetryQueue.registerProcessor(async (item: QueueItem) => {
      await this.processSync(item.metadata, false); // don't notify/enqueue again on direct retry success
    });
  },

  /**
   * Enqueues the syncing of an accepted solution to prevent GitHub API conflicts.
   */
  async processSync(meta: SubmissionMetadata, isAutoSync = true): Promise<void> {
    syncQueuePromise = syncQueuePromise.then(() => this._doProcessSync(meta, isAutoSync)).catch(err => {
      Logger.error('Sync queue caught error:', err);
    });
    return syncQueuePromise;
  },

  /**
   * Orchestrates the syncing of an accepted solution.
   */
  async _doProcessSync(meta: SubmissionMetadata, isAutoSync = true): Promise<void> {
    const settings = await StorageService.getSettings();

    // 1. Validation
    if (!settings.githubToken) {
      const errMsg = 'GitHub token is missing. Please log in first.';
      Logger.error(errMsg);
      if (isAutoSync) {
        await this.handleFailedSync(meta, errMsg);
      }
      throw new Error(errMsg);
    }

    if (isAutoSync && !settings.autoSync) {
      Logger.info('Auto sync is disabled in settings. Skipping.');
      return;
    }

    const platformEnabled = settings.platforms[meta.platform];
    if (isAutoSync && !platformEnabled) {
      Logger.info(`Sync disabled for platform: ${meta.platform}. Skipping.`);
      return;
    }

    if (!settings.repoOwner || !settings.repoName) {
      const errMsg = 'GitHub repository is not configured.';
      Logger.error(errMsg);
      if (isAutoSync) {
        await this.handleFailedSync(meta, errMsg);
      }
      throw new Error(errMsg);
    }

    try {
      Logger.info(`Starting sync for ${meta.problemId} - ${meta.problemName} on ${meta.platform}...`);

      // 2. Generate Paths and Names
      const folderName = settings.folderNamingStyle === 'number-name'
        ? `${meta.problemId} - ${meta.problemName}`
        : meta.problemName;

      // Platform specific path structure
      // LeetCode: LeetCode/Easy/0001 - Two Sum/
      // Others: Platform/Folder/
      const basePath = meta.platform === 'LeetCode'
        ? `${meta.platform}/${meta.difficulty}/${folderName}`
        : `${meta.platform}/${folderName}`;

      const ext = READMEGenerator.getFileExtension(meta.language);
      const codePath = `${basePath}/solution.${ext}`;
      const readmePath = `${basePath}/README.md`;

      // 3. Duplicate Checking
      Logger.info(`Checking duplicates on path: ${codePath}...`);
      const existingFile = await GitHubService.getFile(
        settings.githubToken,
        settings.repoOwner,
        settings.repoName,
        codePath
      );

      const codeHash = this.hashCode(meta.code);

      if (existingFile) {
        if (existingFile.content.trim() === meta.code.trim()) {
          Logger.info('Solution code is identical. Skipping upload.');
          if (isAutoSync) {
            NotificationService.show(
              'Sync Skipped',
              `${meta.problemName} is already up to date on GitHub.`
            );
          }
          return;
        }
        Logger.info('Newer code version detected. Solution will be updated.');
      }

      // 4. Update Sync History and Streaks locally
      const history = await StorageService.getHistory();
      
      // Update streak
      const todayStr = new Date().toISOString().split('T')[0];
      const lastSolved = history.streak.lastSolvedDate;
      let newStreak = history.streak.currentStreak;

      if (!lastSolved) {
        newStreak = 1;
      } else if (lastSolved === todayStr) {
        // Already solved today, streak remains same
      } else {
        const lastDate = new Date(lastSolved);
        const currentDate = new Date(todayStr);
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }

      const syncLogId = `${meta.platform}-${meta.problemId}-${Date.now()}`;
      const newLog: SyncLog = {
        id: syncLogId,
        platform: meta.platform,
        problemId: meta.problemId,
        problemName: meta.problemName,
        difficulty: meta.difficulty,
        language: meta.language,
        syncedAt: new Date().toISOString(),
        codeHash,
      };

      // Filter out older log for this problem to keep stats clean, then add new log
      const filteredLogs = history.logs.filter(
        log => !(log.platform === meta.platform && log.problemId === meta.problemId)
      );
      
      const updatedHistory = {
        logs: [...filteredLogs, newLog],
        streak: {
          currentStreak: newStreak,
          lastSolvedDate: todayStr,
        },
      };

      // 5. Generate Individual and Root READMEs
      const problemReadmeContent = READMEGenerator.generateProblemREADME(meta);
      const rootReadmeContent = READMEGenerator.generateRootREADME(updatedHistory, settings.repoName);

      // 6. Build Commit Message
      let commitMsg = settings.commitMessageTemplate
        .replace('{platform}', meta.platform)
        .replace('{problemId}', meta.problemId)
        .replace('{problemName}', meta.problemName);

      if (existingFile) {
        commitMsg = `Updated solution for ${meta.platform} ${meta.problemId} - ${meta.problemName}`;
      }

      // 7. Commit Files in one Atomic tree commit
      const filesToCommit = [
        { path: codePath, content: meta.code },
        { path: readmePath, content: problemReadmeContent },
        { path: 'README.md', content: rootReadmeContent },
      ];

      Logger.info(`Pushing commit: "${commitMsg}" to GitHub...`);
      await GitHubService.commitFiles(
        settings.githubToken,
        settings.repoOwner,
        settings.repoName,
        filesToCommit,
        commitMsg
      );

      // Save updated history locally
      await StorageService.updateHistory(updatedHistory);

      // Update last sync time in settings
      await StorageService.updateSettings({
        // we can store last sync directly or through settings
      });
      await chrome.storage.local.set({ lastSyncTime: new Date().toISOString() });

      Logger.success(`Successfully synced solution for ${meta.problemName}!`);
      if (isAutoSync) {
        NotificationService.showSuccess(meta.problemName, meta.platform);
      }
    } catch (error) {
      Logger.error(`Error in processSync for ${meta.problemName}:`, error);
      if (isAutoSync) {
        await this.handleFailedSync(meta, error instanceof Error ? error.message : String(error));
      }
      throw error;
    }
  },

  async handleFailedSync(meta: SubmissionMetadata, errorMsg: string) {
    NotificationService.showFailure(meta.problemName, errorMsg);
    
    // Add to retry queue
    const queueItem: QueueItem = {
      id: `${meta.platform}-${meta.problemId}-${Date.now()}`,
      metadata: meta,
      addedAt: new Date().toISOString(),
      attempts: 0,
      error: errorMsg
    };
    await RetryQueue.enqueue(queueItem);
  },

  hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash.toString(16);
  }
};
