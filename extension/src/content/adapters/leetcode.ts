import { SubmissionMetadata } from '../../shared/types';
import { Logger } from '../../shared/utils/logger';

// =====================================================================
// LeetCode Adapter — LeetHub-style approach
//
// Flow:
//   1. MutationObserver watches for the v2 submit button to appear in DOM
//   2. On click, send LEETCODE_SUBMISSION to background
//   3. Background watches webNavigation for URL → /submissions/<id>/
//   4. Content script receives submission ID, then polls
//      getSuccessStateAndUpdate until the result element appears
//   5. Fetches submissionDetails via GraphQL (same query as LeetHub v2)
//   6. Builds SubmissionMetadata and sends SUBMISSION_DETECTED to background
// =====================================================================

let isObserving = false;

function startObserver() {
  if (isObserving) return;
  isObserving = true;

  Logger.info('[CP Vault] LeetCode submit button observer started.');

  const submitBtnObserver = new MutationObserver((_mutations, observer) => {
    // LeetCode v2 submit button
    const v2SubmitBtn = document.querySelector('[data-e2e-locator="console-submit-button"]');

    if (v2SubmitBtn) {
      observer.disconnect();
      Logger.info('[CP Vault] LeetCode v2 submit button found. Attaching click handler.');

      // Attach once; re-observe if button is re-rendered (SPA navigation)
      if (!(v2SubmitBtn as any)._cpVaultAttached) {
        (v2SubmitBtn as any)._cpVaultAttached = true;

        const handler = async (event: Event) => {
          const e = event as KeyboardEvent;
          // Accept both click and Ctrl/Cmd+Enter keyboard submit
          if (e.type === 'keydown') {
            const isMac = navigator.userAgent.includes('Mac');
            if (!(e.key === 'Enter' && (isMac ? e.metaKey : e.ctrlKey))) return;
          }
          Logger.info('[CP Vault] Submit button clicked. Listening for submission URL...');
          await handleSubmitClick();
        };

        v2SubmitBtn.addEventListener('click', handler);

        // Also listen for keyboard shortcut on the textarea
        const textareas = document.getElementsByTagName('textarea');
        const textarea = textareas.length >= 2 ? textareas[0] : textareas[0];
        if (textarea && !(textarea as any)._cpVaultAttached) {
          (textarea as any)._cpVaultAttached = true;
          textarea.addEventListener('keydown', handler);
        }
      }

      // Re-observe for SPA page changes
      isObserving = false;
      setTimeout(() => startObserver(), 2000);
    }
  });

  const observeTarget = document.body || document.documentElement;
  if (!observeTarget) {
    // Body not ready yet — defer until DOM is loaded
    document.addEventListener('DOMContentLoaded', () => { isObserving = false; startObserver(); }, { once: true });
    return;
  }
  submitBtnObserver.observe(observeTarget, { childList: true, subtree: true });
}

async function handleSubmitClick() {
  try {
    // Ask background to watch for the URL changing to /submissions/<id>/
    const { submissionId } = await new Promise<{ submissionId: string | null }>((resolve) => {
      const timeout = setTimeout(() => resolve({ submissionId: null }), 20000);
      chrome.runtime.sendMessage({ action: 'LEETCODE_SUBMISSION' }, (response) => {
        clearTimeout(timeout);
        if (chrome.runtime.lastError) {
          Logger.error('[CP Vault] Background message error:', chrome.runtime.lastError);
          resolve({ submissionId: null });
        } else {
          resolve(response || { submissionId: null });
        }
      });
    });

    if (!submissionId) {
      Logger.warn('[CP Vault] No submission ID received within timeout.');
      return;
    }

    Logger.info(`[CP Vault] Submission ID received: ${submissionId}. Polling for result...`);

    // Poll the DOM for the result element (max 15 seconds, like LeetHub)
    const accepted = await pollForAcceptedResult(15);
    if (!accepted) {
      Logger.info('[CP Vault] Submission was not Accepted. Skipping sync.');
      return;
    }

    Logger.info('[CP Vault] Accepted! Fetching submission details from GraphQL...');
    const submissionData = await fetchSubmissionDetails(submissionId);

    if (!submissionData) {
      Logger.error('[CP Vault] Could not fetch submission details.');
      return;
    }

    const question = submissionData.question;
    const frontendId = await fetchFrontendId(question.titleSlug);

    const tags = (question.topicTags || []).map((t: any) => t.name);

    const metadata: SubmissionMetadata = {
      platform: 'LeetCode',
      problemId: frontendId || question.questionId || '0000',
      problemName: question.title,
      difficulty: (question.difficulty || 'Unknown') as any,
      language: submissionData.lang?.verboseName || submissionData.lang?.name || 'Unknown',
      runtime: submissionData.runtimeDisplay || `${submissionData.runtime} ms`,
      memory: submissionData.memoryDisplay || `${submissionData.memory} MB`,
      submissionTime: new Date().toISOString().split('T')[0],
      status: 'Accepted',
      url: `https://leetcode.com/problems/${question.titleSlug}/`,
      tags,
      code: submissionData.code,
      problemStatement: cleanHtml(question.content || ''),
      examples: extractExamples(question.content || ''),
      constraints: extractConstraints(question.content || ''),
    };

    sendSubmission(metadata);
  } catch (err) {
    Logger.error('[CP Vault] Error in handleSubmitClick:', err);
  }
}

/** Polls DOM every 1s for up to `maxSeconds` for the submission result element. */
function pollForAcceptedResult(maxSeconds: number): Promise<boolean> {
  return new Promise((resolve) => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      // LeetHub: looks for [data-e2e-locator="submission-result"]
      const resultEl = document.querySelector('[data-e2e-locator="submission-result"]');
      if (resultEl) {
        clearInterval(interval);
        const text = resultEl.textContent?.trim().toLowerCase() || '';
        Logger.info(`[CP Vault] Result element found: "${text}"`);
        resolve(text.includes('accepted'));
        return;
      }
      if (attempts >= maxSeconds) {
        clearInterval(interval);
        Logger.warn('[CP Vault] Timed out waiting for submission result element.');
        resolve(false);
      }
    }, 1000);
  });
}

/** Fetches submissionDetails via LeetCode GraphQL — same query as LeetHub v2 */
async function fetchSubmissionDetails(submissionId: string): Promise<any> {
  try {
    const csrfToken = getCsrfToken();
    const response = await fetch('https://leetcode.com/graphql/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrftoken': csrfToken,
        cookie: document.cookie,
      },
      body: JSON.stringify({
        operationName: 'submissionDetails',
        variables: { submissionId: parseInt(submissionId, 10) },
        query: `
          query submissionDetails($submissionId: Int!) {
            submissionDetails(submissionId: $submissionId) {
              runtime
              runtimeDisplay
              runtimePercentile
              memory
              memoryDisplay
              memoryPercentile
              code
              timestamp
              statusCode
              lang {
                name
                verboseName
              }
              question {
                questionId
                title
                titleSlug
                content
                difficulty
                topicTags {
                  name
                  slug
                }
              }
              notes
              runtimeError
            }
          }
        `,
      }),
    });

    if (!response.ok) {
      Logger.error(`[CP Vault] GraphQL response not OK: ${response.status}`);
      return null;
    }

    const json = await response.json();
    const data = json?.data?.submissionDetails;
    if (!data) {
      Logger.error('[CP Vault] submissionDetails missing from GraphQL response:', json);
    }
    return data || null;
  } catch (err) {
    Logger.error('[CP Vault] fetchSubmissionDetails error:', err);
    return null;
  }
}

/** Fetches questionFrontendId separately (same approach as LeetHub v2) */
async function fetchFrontendId(titleSlug: string): Promise<string> {
  try {
    const csrfToken = getCsrfToken();
    const response = await fetch('https://leetcode.com/graphql/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrftoken': csrfToken,
        cookie: document.cookie,
      },
      body: JSON.stringify({
        operationName: 'questionDetail',
        variables: { titleSlug },
        query: `
          query questionDetail($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
              questionFrontendId
            }
          }
        `,
      }),
    });

    const json = await response.json();
    return json?.data?.question?.questionFrontendId || '0000';
  } catch {
    return '0000';
  }
}

function getCsrfToken(): string {
  return (document.cookie.match(/csrftoken=([^;]+)/) || [])[1] || '';
}

function sendSubmission(metadata: SubmissionMetadata) {
  Logger.info('[CP Vault] Sending submission to background for sync:', metadata.problemName);
  chrome.runtime.sendMessage(
    { action: 'SUBMISSION_DETECTED', submission: metadata },
    (response) => {
      if (chrome.runtime.lastError) {
        Logger.error('[CP Vault] sendMessage error:', chrome.runtime.lastError);
      } else if (response?.success) {
        Logger.success(`[CP Vault] ✅ Synced "${metadata.problemName}" to GitHub!`);
      } else {
        Logger.error('[CP Vault] Sync failed:', response?.error);
      }
    }
  );
}

// ── HTML helpers (preserved from previous version) ─────────────────

function cleanHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<div[^>]*>/g, '')
    .replace(/<\/div>/g, '')
    .replace(/<p[^>]*>/g, '')
    .replace(/<\/p>/g, '\n')
    .replace(/<strong[^>]*>/g, '**')
    .replace(/<\/strong>/g, '**')
    .replace(/<em[^>]*>/g, '*')
    .replace(/<\/em>/g, '*')
    .replace(/<code[^>]*>/g, '`')
    .replace(/<\/code>/g, '`')
    .replace(/<pre[^>]*>/g, '\n```\n')
    .replace(/<\/pre>/g, '\n```\n')
    .replace(/<ul[^>]*>/g, '\n')
    .replace(/<\/ul>/g, '\n')
    .replace(/<li[^>]*>/g, '- ')
    .replace(/<\/li>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/<span[^>]*>/g, '')
    .replace(/<\/span>/g, '')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

function extractExamples(html: string): string {
  if (!html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const preTags = tempDiv.querySelectorAll('pre');
  let examples = '';
  preTags.forEach((pre, index) => {
    examples += `**Example ${index + 1}:**\n\`\`\`\n${pre.innerText.trim()}\n\`\`\`\n\n`;
  });
  return examples;
}

function extractConstraints(html: string): string {
  if (!html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const constraintLists = tempDiv.querySelectorAll('ul');
  let constraints = '';
  constraintLists.forEach(ul => {
    if (ul.previousElementSibling?.textContent?.toLowerCase().includes('constraints')) {
      ul.querySelectorAll('li').forEach(li => {
        constraints += `- ${li.innerText.trim()}\n`;
      });
    }
  });
  if (!constraints) {
    const match = html.match(/<strong>Constraints:<\/strong>[\s\S]*?<\/ul>/);
    if (match) {
      const clean = match[0].replace(/<[^>]*>/g, '').trim();
      constraints = clean.replace('Constraints:', '').trim();
    }
  }
  return constraints;
}

// ── Legacy parse() kept for backward-compat (no-op now) ────────────
export const LeetCodeAdapter = {
  parse(_url: string, _responseText: string) {
    // Network interception approach replaced by DOM observer + webNavigation.
    // This method is intentionally left empty.
  },
  initialize() {
    startObserver();
  },
};
