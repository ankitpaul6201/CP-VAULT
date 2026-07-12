import { SubmissionMetadata } from '../../shared/types';
import { Logger } from '../../shared/utils/logger';

export const CodeforcesAdapter = {
  initialize() {
    Logger.info('Codeforces Adapter initialized. Monitoring submissions...');
    this.observeSubmissionsTable();
    this.autoSyncLatestAccepted();
  },

  /**
   * Monitor submissions table for live verdict updates.
   */
  observeSubmissionsTable() {
    const table = document.querySelector('.status-frame-datatable');
    if (!table) return;

    Logger.info('Submissions table found. Setting up MutationObserver...');

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          const target = mutation.target as HTMLElement;
          const cell = target.closest('td[submissionverdict]');
          if (cell) {
            const verdict = cell.textContent?.trim() || '';
            if (this.isAcceptedVerdict(verdict)) {
              const row = cell.closest('tr');
              if (row) {
                this.handleCodeforcesRow(row);
              }
            }
          }
        }
      });
    });

    observer.observe(table, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  },

  /**
   * If user refreshes page and the latest submission is Accepted, sync it automatically.
   */
  async autoSyncLatestAccepted() {
    const table = document.querySelector('.status-frame-datatable');
    if (!table) return;

    // Check first few rows
    const rows = table.querySelectorAll('tr[data-submission-id]');
    if (rows.length === 0) return;

    const topRow = rows[0] as HTMLElement;
    const verdictCell = topRow.querySelector('td[submissionverdict]');
    const verdict = verdictCell?.textContent?.trim() || '';

    if (this.isAcceptedVerdict(verdict)) {
      Logger.info('Latest Codeforces submission is Accepted. Checking if already synced...');
      this.handleCodeforcesRow(topRow);
    }
  },

  isAcceptedVerdict(verdict: string): boolean {
    const v = verdict.toLowerCase();
    return (
      v.includes('accepted') ||
      v.includes('happy new year') ||
      v.includes('ok')
    );
  },

  async handleCodeforcesRow(row: HTMLElement) {
    try {
      const submissionId = row.getAttribute('data-submission-id') || row.querySelector('.id-cell')?.textContent?.trim();
      if (!submissionId) return;

      // Prevent duplicate processing in the same page session
      if (row.getAttribute('data-cp-vault-processed') === 'true') {
        return;
      }
      row.setAttribute('data-cp-vault-processed', 'true');

      Logger.info(`Processing Codeforces submission row: ${submissionId}`);

      // Extract details from columns
      // Columns: [ID, When, Who, Problem, Lang, Verdict, Time, Memory]
      const cells = row.querySelectorAll('td');
      if (cells.length < 6) return;

      const problemCell = cells[3];
      const langCell = cells[4];
      const timeCell = cells[6];
      const memoryCell = cells[7];

      const problemAnchor = problemCell.querySelector('a');
      const href = problemAnchor?.getAttribute('href') || ''; // e.g. /contest/123/problem/A
      const problemText = problemAnchor?.textContent?.trim() || ''; // e.g. 71A - Way Too Long Words or A - Way Too Long Words

      const language = langCell.textContent?.trim() || 'C++';
      const runtime = timeCell.textContent?.trim() || 'N/A';
      const memory = memoryCell.textContent?.trim() || 'N/A';

      // Parse contest/gym ID and problem index from href
      // e.g. /contest/71/problem/A or /gym/101000/problem/A or /problemset/problem/71/A
      const contestMatch = href.match(/\/(contest|gym|problemset)\/(\d+)/);
      const contestId = contestMatch ? contestMatch[2] : '';
      
      const isGym = href.includes('/gym/');

      // Separate problemId (e.g. 71A) and problemName (e.g. Way Too Long Words)
      let problemId = '';
      let problemName = '';

      if (problemText.includes(' - ')) {
        const parts = problemText.split(' - ');
        const indexPart = parts[0].trim(); // e.g. "71A" or "A"
        problemName = parts[1].trim();

        if (indexPart.includes(contestId)) {
          problemId = indexPart;
        } else {
          problemId = `${contestId}${indexPart}`;
        }
      } else {
        problemId = problemText;
        problemName = problemText;
      }

      // Fetch submission code
      const fetchUrl = isGym
        ? `https://codeforces.com/gym/${contestId}/submission/${submissionId}`
        : `https://codeforces.com/contest/${contestId}/submission/${submissionId}`;

      Logger.info(`Fetching Codeforces solution source from: ${fetchUrl}`);
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch solution page: ${response.statusText}`);
      }
      const htmlText = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      const sourceCodeElement = doc.querySelector('#program-source-text');
      if (!sourceCodeElement) {
        throw new Error('Could not find program-source-text element on submission page. Make sure you are logged in.');
      }
      const code = sourceCodeElement.textContent || '';

      const metadata: SubmissionMetadata = {
        platform: 'Codeforces',
        problemId,
        problemName,
        difficulty: 'Unknown', // Codeforces doesn't display difficulty in submission table. Will fall back.
        language,
        runtime,
        memory,
        submissionTime: new Date().toISOString().split('T')[0],
        status: 'Accepted',
        url: `https://codeforces.com/problemset/problem/${contestId}/${problemId.replace(contestId, '')}`,
        tags: [],
        code,
        problemStatement: 'Problem statement can be viewed on Codeforces.',
      };

      chrome.runtime.sendMessage({
        action: 'SUBMISSION_DETECTED',
        submission: metadata
      }, (res) => {
        if (chrome.runtime.lastError) {
          Logger.error('Failed to communicate with background service worker:', chrome.runtime.lastError);
        } else if (res?.success) {
          Logger.success('Codeforces solution sync completed.');
        } else {
          Logger.error('Sync failed:', res?.error);
        }
      });

    } catch (err) {
      Logger.error('Failed to process Codeforces row:', err);
      row.removeAttribute('data-cp-vault-processed'); // reset to retry on next event if needed
    }
  }
};
