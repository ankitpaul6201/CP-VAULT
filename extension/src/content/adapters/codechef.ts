import { SubmissionMetadata } from '../../shared/types';
import { Logger } from '../../shared/utils/logger';

// =====================================================================
// CodeChef Adapter — DOM MutationObserver approach
//
// Flow:
//   1. MutationObserver watches for the result banner/verdict cell
//   2. When "Accepted" verdict appears, extracts problem details from DOM
//   3. Fetches solution code from the submission page
//   4. Sends SUBMISSION_DETECTED to background service worker
// =====================================================================

let isObserving = false;
let lastProcessedSubmissionId = '';

export const CodeChefAdapter = {
  parse(url: string, responseText: string) {
    // Network interception fallback — kept for compatibility
    try {
      if (!url.includes('/api/submissions-detail/') && !url.includes('/api/ide/submit')) return;
      if (!responseText) return;

      const response = JSON.parse(responseText);
      const data = response?.result?.data || response?.data || response;
      if (!data) return;

      // CodeChef uses 'AC' for Accepted
      const verdict = (data.result || data.status || data.verdict || '').toString().toUpperCase();
      const isAccepted = verdict === 'AC' || verdict === 'ACCEPTED';
      if (!isAccepted) {
        Logger.info(`[CP Vault] CodeChef submission status: ${verdict} (Not Accepted).`);
        return;
      }

      Logger.info('[CP Vault] CodeChef Accepted submission via API detected!');
      this._buildAndSend(data);
    } catch (err) {
      Logger.error('[CP Vault] CodeChef API parse error:', err);
    }
  },

  initialize() {
    if (isObserving) return;
    isObserving = true;
    Logger.info('[CP Vault] CodeChef adapter initialized. Watching for verdicts...');
    this._observeVerdict();
  },

  _observeVerdict() {
    const observer = new MutationObserver(() => {
      this._checkForAcceptedVerdict();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    // Also check immediately on load
    setTimeout(() => this._checkForAcceptedVerdict(), 2000);
  },

  _checkForAcceptedVerdict() {
    // CodeChef new UI: result shown in a div with class containing "AC" or "Accepted"
    const resultBanner = document.querySelector(
      '[class*="ac-status"], [class*="accepted"], .result-AC, .verdict-AC, ._AC__, [class*="compile-submit-result"], [class*="status"]'
    );

    if (resultBanner) {
      const text = resultBanner.textContent?.trim().toLowerCase() || '';
      if (text.includes('accepted') || text.includes(' ac') || text === 'ac' || text.includes('correct')) {
        this._extractFromDOM();
        return;
      }
    }

    // CodeChef old table-based UI: check verdict columns
    const verdictCells = document.querySelectorAll(
      'td.status-text, td[class*="verdict"], [data-content="AC"]'
    );
    for (const cell of Array.from(verdictCells)) {
      const txt = cell.textContent?.trim().toLowerCase() || '';
      if (txt === 'accepted' || txt === 'ac') {
        const row = cell.closest('tr');
        if (row && row.getAttribute('data-cp-vault-done') !== 'true') {
          row.setAttribute('data-cp-vault-done', 'true');
          this._extractFromTableRow(row as HTMLElement);
        }
        return;
      }
    }
  },

  async _extractFromDOM() {
    try {
      // Get problem slug from URL: codechef.com/problems/PROBLEMCODE or codechef.com/CONTEST/problems/PROBLEMCODE
      const urlMatch = window.location.pathname.match(/\/problems\/([A-Z0-9_]+)/i);
      const problemId = urlMatch ? urlMatch[1].toUpperCase() : 'UNKNOWN';

      // Avoid duplicate sends
      if (lastProcessedSubmissionId === `dom-${problemId}-${new Date().toISOString().split('T')[0]}`) return;
      lastProcessedSubmissionId = `dom-${problemId}-${new Date().toISOString().split('T')[0]}`;

      // Try to get language from the language selector button
      const langBtn = document.querySelector(
        '[class*="language-selector"] button, [class*="lang-select"] button, select[name="language"]'
      );
      const language = langBtn?.textContent?.trim() || 'C++';

      // Try to get code from editor
      const editorEl = document.querySelector('.CodeMirror-code, [class*="monaco-editor"] .view-lines');
      const lines = editorEl?.querySelectorAll('[class*="line"], .CodeMirror-line');
      const code = lines
        ? Array.from(lines).map(l => l.textContent).join('\n')
        : '';

      const metadata: SubmissionMetadata = {
        platform: 'CodeChef',
        problemId,
        problemName: document.title.replace('CodeChef', '').replace('|', '').trim() || problemId,
        difficulty: 'Unknown',
        language,
        runtime: 'N/A',
        memory: 'N/A',
        submissionTime: new Date().toISOString().split('T')[0],
        status: 'Accepted',
        url: `https://www.codechef.com/problems/${problemId}`,
        tags: [],
        code,
        problemStatement: 'Problem statement can be viewed on CodeChef.',
      };

      this._send(metadata);
    } catch (err) {
      Logger.error('[CP Vault] CodeChef DOM extraction error:', err);
    }
  },

  _extractFromTableRow(row: HTMLElement) {
    try {
      const cells = row.querySelectorAll('td');
      if (cells.length < 3) return;

      // Typical columns: ID | Time | Username | Problem | Language | Result | ...
      const submissionId = row.getAttribute('data-submission-id') || cells[0]?.textContent?.trim() || '';
      if (submissionId === lastProcessedSubmissionId) return;
      lastProcessedSubmissionId = submissionId;

      const problemCell = row.querySelector('td a[href*="problems"]');
      const problemId = problemCell?.getAttribute('href')?.split('/').pop()?.toUpperCase() || 'UNKNOWN';
      const problemName = problemCell?.textContent?.trim() || problemId;

      const langCell = Array.from(cells).find(c => c.textContent?.match(/C\+\+|Python|Java|Go|Rust/i));
      const language = langCell?.textContent?.trim() || 'C++';

      const metadata: SubmissionMetadata = {
        platform: 'CodeChef',
        problemId,
        problemName,
        difficulty: 'Unknown',
        language,
        runtime: 'N/A',
        memory: 'N/A',
        submissionTime: new Date().toISOString().split('T')[0],
        status: 'Accepted',
        url: `https://www.codechef.com/problems/${problemId}`,
        tags: [],
        code: '', // Code not accessible from table row
        problemStatement: 'Problem statement can be viewed on CodeChef.',
      };

      this._send(metadata);
    } catch (err) {
      Logger.error('[CP Vault] CodeChef table row extraction error:', err);
    }
  },

  _buildAndSend(data: any) {
    const problemId = (data.problemCode || data.problem_code || 'UNKNOWN').toUpperCase();
    const metadata: SubmissionMetadata = {
      platform: 'CodeChef',
      problemId,
      problemName: data.problemTitle || data.problem_title || problemId,
      difficulty: 'Unknown',
      language: data.language || data.lang || 'C++',
      runtime: data.time ? `${data.time} s` : 'N/A',
      memory: data.memory ? `${data.memory}` : 'N/A',
      submissionTime: new Date().toISOString().split('T')[0],
      status: 'Accepted',
      url: `https://www.codechef.com/problems/${problemId}`,
      tags: [],
      code: data.code || '',
      problemStatement: 'Problem statement can be viewed on CodeChef.',
    };
    this._send(metadata);
  },

  _send(metadata: SubmissionMetadata) {
    Logger.info(`[CP Vault] Sending CodeChef submission: ${metadata.problemId}`);
    chrome.runtime.sendMessage(
      { action: 'SUBMISSION_DETECTED', submission: metadata },
      (response) => {
        if (chrome.runtime.lastError) {
          Logger.error('[CP Vault] CodeChef sendMessage error:', chrome.runtime.lastError);
        } else if (response?.success) {
          Logger.success(`[CP Vault] ✅ CodeChef "${metadata.problemName}" synced to GitHub!`);
        } else {
          Logger.error('[CP Vault] CodeChef sync failed:', response?.error);
        }
      }
    );
  },
};
