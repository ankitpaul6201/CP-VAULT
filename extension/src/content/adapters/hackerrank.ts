import { SubmissionMetadata } from '../../shared/types';
import { Logger } from '../../shared/utils/logger';

// =====================================================================
// HackerRank Adapter — DOM MutationObserver approach
//
// Flow:
//   1. MutationObserver watches for the submission result overlay/toast
//   2. When "You have passed" or score=100 appears, extracts metadata from DOM
//   3. Reads code from the CodeMirror editor
//   4. Sends SUBMISSION_DETECTED to background service worker
// =====================================================================

let lastProcessedProblem = '';

export const HackerRankAdapter = {
  parse(url: string, responseText: string) {
    // Network interception fallback — REST API path for HackerRank challenges
    try {
      if (!responseText) return;
      // HackerRank challenge submissions: /rest/contests/<contest>/challenges/<slug>/submissions
      const isSubmissionUrl =
        url.includes('/rest/contests/') && url.includes('/submissions') ||
        url.includes('/rest/challenges/') && url.includes('/submissions');
      if (!isSubmissionUrl) return;

      const data = JSON.parse(responseText);
      const submission = data?.model || data?.submission;
      if (!submission) return;

      // HackerRank: status === 'Accepted' or score >= 1 (full score = 1.0)
      const isAccepted =
        submission.status === 'Accepted' ||
        (typeof submission.score === 'number' && submission.score >= 1);
      if (!isAccepted) {
        Logger.info(`[CP Vault] HackerRank status: ${submission.status} score: ${submission.score} (Not Accepted).`);
        return;
      }

      Logger.info('[CP Vault] HackerRank Accepted submission via API detected!');
      this._buildAndSend(submission);
    } catch (err) {
      Logger.error('[CP Vault] HackerRank API parse error:', err);
    }
  },

  initialize() {
    Logger.info('[CP Vault] HackerRank adapter initialized. Watching for verdicts...');
    this._observeVerdict();
  },

  _observeVerdict() {
    const observer = new MutationObserver(() => {
      this._checkForAcceptedResult();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  },

  _checkForAcceptedResult() {
    // HackerRank shows a success message with text "You have passed..." or "Congratulations"
    const successBanners = document.querySelectorAll(
      '[class*="congratulations"], [class*="success-message"], [class*="passed"], ' +
      '.submissions-status-passed, [data-attr="status-passed"]'
    );

    for (const banner of Array.from(successBanners)) {
      const text = banner.textContent?.trim().toLowerCase() || '';
      if (
        text.includes('you have passed') ||
        text.includes('congratulations') ||
        text.includes('all test cases passed')
      ) {
        const slug = this._getProblemSlug();
        if (slug && slug !== lastProcessedProblem) {
          lastProcessedProblem = slug;
          this._extractFromDOM(slug);
        }
        return;
      }
    }

    // Also check score display: if score shows 100% or full marks
    const scoreEl = document.querySelector('[class*="score-value"], .score-display, [class*="final-score"]');
    if (scoreEl) {
      const scoreText = scoreEl.textContent?.trim() || '';
      const score = parseFloat(scoreText);
      if (!isNaN(score) && score >= 100) {
        const slug = this._getProblemSlug();
        if (slug && slug !== lastProcessedProblem) {
          lastProcessedProblem = slug;
          this._extractFromDOM(slug);
        }
      }
    }
  },

  _getProblemSlug(): string {
    // URL patterns:
    // hackerrank.com/challenges/<slug>/problem
    // hackerrank.com/domains/<domain>/challenges/<slug>
    const match =
      window.location.pathname.match(/\/challenges\/([^/]+)/) ||
      window.location.pathname.match(/\/problems\/([^/]+)/);
    return match ? match[1] : '';
  },

  _extractFromDOM(slug: string) {
    try {
      // Get problem name from page title or h1
      const titleEl = document.querySelector('h1.challenge-name, [class*="challenge-title"], h1');
      const problemName = titleEl?.textContent?.trim() || slug;

      // Get difficulty
      const diffEl = document.querySelector('[class*="difficulty-level"], [class*="challenge-difficulty"]');
      const diffText = diffEl?.textContent?.trim().toLowerCase() || '';
      const difficulty = diffText.includes('easy')
        ? 'Easy'
        : diffText.includes('medium')
        ? 'Medium'
        : diffText.includes('hard')
        ? 'Hard'
        : 'Unknown';

      // Get language from selector
      const langEl = document.querySelector(
        'select[name="language"] option:checked, [class*="language-picker"] [class*="selected"]'
      );
      const language = langEl?.textContent?.trim() || 'C++';

      // Get code from CodeMirror editor
      const editorLines = document.querySelectorAll('.CodeMirror-code .CodeMirror-line');
      const code = editorLines.length > 0
        ? Array.from(editorLines).map(l => l.textContent).join('\n')
        : '';

      const metadata: SubmissionMetadata = {
        platform: 'HackerRank',
        problemId: slug,
        problemName,
        difficulty: difficulty as any,
        language,
        runtime: 'N/A',
        memory: 'N/A',
        submissionTime: new Date().toISOString().split('T')[0],
        status: 'Accepted',
        url: `https://www.hackerrank.com/challenges/${slug}/problem`,
        tags: [],
        code,
        problemStatement: 'Problem statement can be viewed on HackerRank.',
      };

      this._send(metadata);
    } catch (err) {
      Logger.error('[CP Vault] HackerRank DOM extraction error:', err);
    }
  },

  _buildAndSend(submission: any) {
    const challenge = submission.challenge || {};
    const slug = challenge.slug || 'unknown';
    const difficulty = this._normalizeDifficulty(challenge.difficulty_name || '');

    const metadata: SubmissionMetadata = {
      platform: 'HackerRank',
      problemId: slug,
      problemName: challenge.name || slug,
      difficulty,
      language: submission.language || 'C++',
      runtime: 'N/A',
      memory: 'N/A',
      submissionTime: new Date().toISOString().split('T')[0],
      status: 'Accepted',
      url: `https://www.hackerrank.com/challenges/${slug}/problem`,
      tags: [],
      code: submission.code || '',
      problemStatement: 'Problem statement can be viewed on HackerRank.',
    };

    this._send(metadata);
  },

  _normalizeDifficulty(difficulty: string): 'Easy' | 'Medium' | 'Hard' | 'Unknown' {
    const d = difficulty.toLowerCase();
    if (d.includes('easy')) return 'Easy';
    if (d.includes('medium')) return 'Medium';
    if (d.includes('hard')) return 'Hard';
    return 'Unknown';
  },

  _send(metadata: SubmissionMetadata) {
    Logger.info(`[CP Vault] Sending HackerRank submission: ${metadata.problemId}`);
    chrome.runtime.sendMessage(
      { action: 'SUBMISSION_DETECTED', submission: metadata },
      (response) => {
        if (chrome.runtime.lastError) {
          Logger.error('[CP Vault] HackerRank sendMessage error:', chrome.runtime.lastError);
        } else if (response?.success) {
          Logger.success(`[CP Vault] ✅ HackerRank "${metadata.problemName}" synced to GitHub!`);
        } else {
          Logger.error('[CP Vault] HackerRank sync failed:', response?.error);
        }
      }
    );
  },
};
