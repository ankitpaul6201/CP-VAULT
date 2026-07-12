import { StorageService } from './storageService';
import { QueueItem } from '../shared/types';
import { Logger } from '../shared/utils/logger';
import { NotificationService } from './notification';

const MAX_ATTEMPTS = 5;

// We will export a class or singleton instance that coordinates retries
export const RetryQueue = {
  isRetrying: false,
  processCallback: null as ((item: QueueItem) => Promise<void>) | null,

  registerProcessor(callback: (item: QueueItem) => Promise<void>) {
    this.processCallback = callback;
    this.setupListeners();
  },

  setupListeners() {
    // Listen for reconnection
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        Logger.info('Connection is online. Processing retry queue.');
        this.processQueue();
      });
    }

    // Periodically run checking every 5 minutes as a fallback
    if (chrome.alarms) {
      chrome.alarms.create('cp-vault-retry-check', { periodInMinutes: 5 });
      chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === 'cp-vault-retry-check') {
          Logger.info('Scheduled check for retry queue.');
          this.processQueue();
        }
      });
    } else {
      Logger.warn('chrome.alarms API is not available. Scheduled retries disabled.');
    }
  },

  async enqueue(item: QueueItem) {
    const queue = await StorageService.getQueue();
    // Check if problem already exists in queue
    const existsIndex = queue.findIndex(q => 
      q.metadata.platform === item.metadata.platform && 
      q.metadata.problemId === item.metadata.problemId
    );

    if (existsIndex >= 0) {
      queue[existsIndex] = {
        ...queue[existsIndex],
        metadata: item.metadata,
        addedAt: new Date().toISOString(),
        attempts: 0,
      };
    } else {
      queue.push(item);
    }

    await StorageService.saveQueue(queue);
    Logger.info(`Enqueued submission for ${item.metadata.problemName} into retry queue.`);
  },

  async processQueue() {
    if (this.isRetrying) return;
    if (!navigator.onLine) {
      Logger.warn('Cannot process queue: Offline.');
      return;
    }

    const queue = await StorageService.getQueue();
    if (queue.length === 0) return;

    const settings = await StorageService.getSettings();
    if (!settings.retryFailed) {
      Logger.warn('Retry queue is disabled in settings.');
      return;
    }

    this.isRetrying = true;
    Logger.info(`Processing retry queue containing ${queue.length} items.`);

    const remainingQueue: QueueItem[] = [];

    for (const item of queue) {
      if (item.attempts >= MAX_ATTEMPTS) {
        Logger.error(`Max retry attempts reached for ${item.metadata.problemName}. Removing from queue.`);
        NotificationService.show(
          'Sync Discarded',
          `Could not sync ${item.metadata.problemName} after ${MAX_ATTEMPTS} attempts.`
        );
        continue;
      }

      try {
        Logger.info(`Retrying ${item.metadata.problemName} (Attempt ${item.attempts + 1}/${MAX_ATTEMPTS})...`);
        if (this.processCallback) {
          item.attempts += 1;
          await this.processCallback(item);
          Logger.success(`Successfully retried and synced ${item.metadata.problemName}!`);
        } else {
          remainingQueue.push(item);
        }
      } catch (err) {
        Logger.error(`Retry attempt failed for ${item.metadata.problemName}:`, err);
        item.error = err instanceof Error ? err.message : String(err);
        remainingQueue.push(item);
      }
    }

    await StorageService.saveQueue(remainingQueue);
    this.isRetrying = false;
  }
};
