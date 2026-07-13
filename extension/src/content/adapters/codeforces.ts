import { SubmissionMetadata } from '../../shared/types';
import { Logger } from '../../shared/utils/logger';

export const CodeforcesAdapter = {
  username: '',

  initialize() {
    Logger.info('Codeforces Adapter initialized. Monitoring submissions...');
    
    // Try to find the username of the logged-in user to only sync their submissions
    const headerLinks = Array.from(document.querySelectorAll('.lang-chooser a, .personal-sidebar a[href^="/profile/"]'));
    for (const link of headerLinks) {
      const href = link.getAttribute('href');
      if (href && href.startsWith('/profile/')) {
        this.username = href.split('/').pop()?.trim() || '';
        break;
      }
    }

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

    const observer = new MutationObserver(() => {
      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        if (row.getAttribute('data-cp-vault-processed') === 'true') return;
        
        const verdictCell = row.querySelector('td[submissionverdict], td.status-verdict');
        const verdictAttr = verdictCell?.getAttribute('submissionverdict') || '';
        const verdict = verdictCell?.textContent?.trim() || '';
        
        if (this.isAcceptedVerdict(verdict, verdictAttr)) {
          this.handleCodeforcesRow(row as HTMLElement);
        }
      });
    });

    observer.observe(table, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['submissionverdict', 'class']
    });
  },

  /**
   * If user refreshes page and the latest submission is Accepted, sync it automatically.
   */
  async autoSyncLatestAccepted() {
    const table = document.querySelector('.status-frame-datatable');
    if (!table) {
      Logger.warn('No status table found on page.');
      return;
    }

    const rows = table.querySelectorAll('tr');
    Logger.info(`Found ${rows.length} rows in the table.`);
    
    // We only want to check rows that belong to the current user
    let rowsToCheck = Array.from(rows);
    if (this.username) {
      Logger.info(`Filtering rows for username: ${this.username}`);
      rowsToCheck = rowsToCheck.filter(row => {
        const authorLinks = Array.from(row.querySelectorAll('a[href^="/profile/"]'));
        if (authorLinks.length > 0) {
          return authorLinks.some(link => link.getAttribute('href')?.toLowerCase() === `/profile/${this.username.toLowerCase()}`);
        }
        return true; // If no author link, assume it's the user's (e.g. on certain views)
      });
      Logger.info(`Filtered down to ${rowsToCheck.length} rows belonging to the user.`);
    } else {
      Logger.info('No username detected in header, checking all rows.');
    }

    let foundAccepted = false;
    for (const row of rowsToCheck) {
      const verdictCell = row.querySelector('td[submissionverdict], td.status-verdict');
      const fallbackCell = row.querySelectorAll('td')[5]; // Fallback to 6th column if classes changed
      
      const verdict1 = verdictCell?.textContent?.trim() || '';
      const verdict2 = fallbackCell?.textContent?.trim() || '';
      const finalVerdict = verdict1 || verdict2;
      
      const subId = row.getAttribute('data-submission-id') || row.querySelector('.id-cell')?.textContent?.trim() || 'header-or-unknown';
      const verdictAttr = verdictCell?.getAttribute('submissionverdict') || '';

      Logger.info(`Row ID: ${subId} | VerdictText: "${finalVerdict}" | VerdictAttr: "${verdictAttr}" | HasVerdictCell: ${!!verdictCell} | HasFallback: ${!!fallbackCell}`);

      if (this.isAcceptedVerdict(finalVerdict, verdictAttr)) {
        foundAccepted = true;
        Logger.info(`Found Accepted Codeforces submission on page load. Verdict text: "${finalVerdict}". Checking if already synced...`);
        this.handleCodeforcesRow(row as HTMLElement);
      }
    }
    
    if (!foundAccepted) {
      Logger.info('No Accepted submissions found for the user on this page.');
    }
  },

  isAcceptedVerdict(verdictText: string, verdictAttr: string = ''): boolean {
    if (verdictAttr === 'OK') return true;
    
    const v = verdictText.toLowerCase();
    return (
      v.includes('accepted') ||
      v.includes('happy new year') ||
      v.includes('ok') ||
      v === 'ok'
    );
  },

  async handleCodeforcesRow(row: HTMLElement) {
    try {
      let submissionId = row.getAttribute('data-submission-id') || row.querySelector('.id-cell')?.textContent?.trim() || '';
      submissionId = submissionId.replace(/^#/, ''); // Remove # if present
      if (!submissionId) {
        Logger.warn('No submission ID found for row.');
        return;
      }

      // Prevent duplicate processing in the same page session
      if (row.getAttribute('data-cp-vault-processed') === 'true') {
        Logger.info(`Row ${submissionId} already processed in this session.`);
        return;
      }
      row.setAttribute('data-cp-vault-processed', 'true');

      Logger.info(`Processing Codeforces submission row: ${submissionId}`);

      if (this.username) {
        const authorLinks = Array.from(row.querySelectorAll('a[href^="/profile/"]'));
        if (authorLinks.length > 0) {
          const isUser = authorLinks.some(link => link.getAttribute('href')?.toLowerCase() === `/profile/${this.username.toLowerCase()}`);
          if (!isUser) {
            Logger.info(`Row ${submissionId} belongs to another user, skipping.`);
            return; // Not the current user's submission
          }
        }
      }

      const problemAnchor = row.querySelector('td a[href*="/problem/"]');
      if (!problemAnchor) {
        throw new Error('Could not find problem link in the row.');
      }

      const href = problemAnchor.getAttribute('href') || ''; // e.g. /contest/123/problem/A
      const problemText = problemAnchor.textContent?.trim() || ''; // e.g. 71A - Way Too Long Words or A - Way Too Long Words

      const problemCell = problemAnchor.closest('td');
      const langCell = problemCell?.nextElementSibling;
      const language = langCell?.textContent?.trim() || 'C++';

      const timeCell = row.querySelector('.time-consumed-cell');
      const memoryCell = row.querySelector('.memory-consumed-cell');
      const runtime = timeCell?.textContent?.trim() || 'N/A';
      const memory = memoryCell?.textContent?.trim() || 'N/A';

      // Parse contest/gym ID and problem index from href
      // e.g. /contest/71/problem/A or /gym/101000/problem/A or /problemset/problem/71/A
      const contestMatch = href.match(/\/(?:contest|gym|problem)\/(\d+)/);
      const contestId = contestMatch ? contestMatch[1] : '';
      
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

      // Try to fetch via /data/submitSource first, as this is Codeforces native AJAX approach
      let code = '';
      try {
        const csrfToken = document.querySelector('meta[name="X-Csrf-Token"]')?.getAttribute('content');
        if (csrfToken) {
          const formData = new URLSearchParams();
          formData.append('submissionId', submissionId);
          formData.append('csrf_token', csrfToken);
          
          Logger.info(`Fetching Codeforces solution source via AJAX for submission ${submissionId}`);
          const ajaxResponse = await fetch('/data/submitSource', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json, text/javascript, */*; q=0.01',
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: formData.toString()
          });
          
          if (ajaxResponse.ok) {
            const data = await ajaxResponse.json();
            if (data && data.source) {
              code = data.source;
              Logger.info('Successfully fetched source code via AJAX.');
            }
          }
        }
      } catch (e) {
        Logger.info('Failed to fetch via submitSource AJAX, falling back to full page fetch');
      }

      if (!code) {
        // Fetch submission code using relative URL to avoid cross-origin issues
        const fetchUrl = isGym
          ? `/gym/${contestId}/submission/${submissionId}`
          : `/contest/${contestId}/submission/${submissionId}`;

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
          const docTitle = doc.title || 'No Title';
          const isLogin = docTitle.toLowerCase().includes('login') || htmlText.includes('enter?back=');
          throw new Error(`Could not find program-source-text element on submission page. Title: "${docTitle}". IsLoginRedirect: ${isLogin}.`);
        }
        code = sourceCodeElement.textContent || '';
      }

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
