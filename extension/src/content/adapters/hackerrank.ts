import { SubmissionMetadata } from '../../shared/types';
import { Logger } from '../../shared/utils/logger';

export const HackerRankAdapter = {
  parse(url: string, responseText: string) {
    try {
      if (!url.includes('/submissions/')) return;
      if (!responseText) return;

      const data = JSON.parse(responseText);
      const submission = data?.model;
      if (!submission) return;

      const isAccepted = submission.status === 'Accepted' || submission.score >= 1;
      if (!isAccepted) {
        Logger.info(`HackerRank submission detected but status is ${submission.status} (Not Accepted).`);
        return;
      }

      Logger.info('HackerRank Accepted submission detected! Parsing details...');

      const challenge = submission.challenge;
      const problemId = challenge?.slug || 'unknown';
      const problemName = challenge?.name || problemId;
      const difficulty = challenge?.difficulty_name || 'Unknown';

      const metadata: SubmissionMetadata = {
        platform: 'HackerRank',
        problemId,
        problemName,
        difficulty: this.normalizeDifficulty(difficulty),
        language: submission.language || 'C++',
        runtime: 'N/A', // HackerRank API doesn't always expose runtime directly in submission response
        memory: 'N/A',
        submissionTime: new Date().toISOString().split('T')[0],
        status: 'Accepted',
        url: `https://www.hackerrank.com/challenges/${problemId}/problem`,
        tags: [],
        code: submission.code || '',
        problemStatement: 'Problem statement can be viewed on HackerRank.',
      };

      chrome.runtime.sendMessage({
        action: 'SUBMISSION_DETECTED',
        submission: metadata
      }, (response) => {
        if (chrome.runtime.lastError) {
          Logger.error('Failed to communicate with background service worker:', chrome.runtime.lastError);
        } else if (response?.success) {
          Logger.success('HackerRank solution sync request completed.');
        } else {
          Logger.error('Sync failed:', response?.error);
        }
      });
    } catch (err) {
      Logger.error('Failed to parse HackerRank submission response:', err);
    }
  },

  normalizeDifficulty(difficulty: string): 'Easy' | 'Medium' | 'Hard' | 'Unknown' {
    const d = difficulty.toLowerCase();
    if (d.includes('easy')) return 'Easy';
    if (d.includes('medium')) return 'Medium';
    if (d.includes('hard')) return 'Hard';
    return 'Unknown';
  }
};
