import { SubmissionMetadata } from '../../shared/types';
import { Logger } from '../../shared/utils/logger';

export const CodeChefAdapter = {
  parse(url: string, responseText: string) {
    try {
      if (!url.includes('/api/submissions-detail/')) return;
      if (!responseText) return;

      const response = JSON.parse(responseText);
      const data = response?.result?.data || response?.data;
      if (!data) return;

      // Verdict: CodeChef uses 'AC' for Accepted solutions
      const isAccepted = data.result === 'AC' || data.status === 'Accepted' || data.verdict === 'Accepted' || data.result?.toLowerCase() === 'accepted';
      if (!isAccepted) {
        Logger.info(`CodeChef submission detected but status is ${data.result || data.status} (Not Accepted).`);
        return;
      }

      Logger.info('CodeChef Accepted submission detected! Parsing details...');

      const problemId = data.problemCode || 'Unknown';
      const problemName = data.problemTitle || problemId;

      const metadata: SubmissionMetadata = {
        platform: 'CodeChef',
        problemId,
        problemName,
        difficulty: 'Unknown', // CodeChef doesn't expose difficulty directly in submissions detail API
        language: data.language || 'C++',
        runtime: data.time ? `${data.time} s` : 'N/A',
        memory: data.memory ? `${data.memory}` : 'N/A',
        submissionTime: new Date().toISOString().split('T')[0],
        status: 'Accepted',
        url: `https://www.codechef.com/problems/${problemId}`,
        tags: [],
        code: data.code || '',
        problemStatement: 'Problem statement can be viewed on CodeChef.',
      };

      chrome.runtime.sendMessage({
        action: 'SUBMISSION_DETECTED',
        submission: metadata
      }, (response) => {
        if (chrome.runtime.lastError) {
          Logger.error('Failed to communicate with background service worker:', chrome.runtime.lastError);
        } else if (response?.success) {
          Logger.success('CodeChef solution sync request completed.');
        } else {
          Logger.error('Sync failed:', response?.error);
        }
      });
    } catch (err) {
      Logger.error('Failed to parse CodeChef submission response:', err);
    }
  }
};
