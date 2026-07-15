import { SyncEngine } from './syncEngine';
import { AuthService } from './auth';
import { Logger } from '../shared/utils/logger';

// Initialize SyncEngine on startup
SyncEngine.initialize();

// Automatically validate token on startup
AuthService.validateTokenOnStartup().catch((err) => {
  Logger.error('Failed startup token validation:', err);
});

// Listen for messages from content scripts, popup, or options page
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  Logger.info('Message received in background:', message.action);

  if (message.action === 'SUBMISSION_DETECTED') {
    const { submission } = message;
    SyncEngine.processSync(submission)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((err) => {
        sendResponse({ success: false, error: err.message || String(err) });
      });
    return true; // Keep channel open for async response
  }

  // LeetHub-style: Watch for URL change to /submissions/<id>/ after a submit click
  if (message.action === 'LEETCODE_SUBMISSION') {
    const listener = (details: chrome.webNavigation.WebNavigationTransitionCallbackDetails) => {
      const match = details.url.match(/\/submissions\/(\d+)\//);
      if (match) {
        const submissionId = match[1];
        sendResponse({ submissionId });
        chrome.webNavigation.onHistoryStateUpdated.removeListener(listener);
      }
    };
    chrome.webNavigation.onHistoryStateUpdated.addListener(listener, {
      url: [{ hostContains: 'leetcode.com', pathContains: 'submissions' }],
    });
    return true; // Keep channel open
  }

  if (message.action === 'START_OAUTH') {
    const { clientId, proxyUrl } = message;
    AuthService.handleOAuth(clientId, proxyUrl)
      .then((result) => {
        sendResponse(result);
      })
      .catch((err) => {
        sendResponse({ success: false, error: err.message || String(err) });
      });
    return true; // Keep channel open
  }

  if (message.action === 'MANUAL_SYNC') {
    const { submission } = message;
    SyncEngine.processSync(submission, false)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((err) => {
        sendResponse({ success: false, error: err.message || String(err) });
      });
    return true; // Keep channel open
  }

  return false;
});