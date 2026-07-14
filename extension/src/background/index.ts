import { SyncEngine } from './syncEngine';
import { StorageService } from './storageService';
import { GitHubService } from './gitHubService';
import { Logger } from '../shared/utils/logger';

// Track OAuth session state across standard browser tabs
let oauthResponseCallback: ((response: any) => void) | null = null;
let oauthTabId: number | null = null;

// Initialize SyncEngine on startup
SyncEngine.initialize();

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
    const { clientId, clientSecret, proxyUrl } = message;
    const redirectUri = 'https://github.com/';
    const isServerless = !!clientSecret;

    oauthResponseCallback = sendResponse;

    // Direct GitHub authorize URL in serverless mode, proxy login URL otherwise
const extensionRedirect = chrome.identity.getRedirectURL();

const authUrl =
`https://cp-vault-production.up.railway.app/api/auth/github/login` +
`?client_id=${encodeURIComponent(clientId)}` +
`&ext_redirect=${encodeURIComponent(extensionRedirect)}`;

    Logger.info(`Launching Tab-Based Auth Flow (isServerless=${isServerless})...`, authUrl);
    
    // Set a pipe flag in storage so our content script knows to intercept the code on redirect
   chrome.identity.launchWebAuthFlow(
  {
    url: authUrl,
    interactive: true,
  },
  async (redirectUrl) => {
    if (chrome.runtime.lastError) {
      sendResponse({
        success: false,
        error: chrome.runtime.lastError.message,
      });
      return;
    }

    if (!redirectUrl) {
      sendResponse({
        success: false,
        error: "No redirect URL received",
      });
      return;
    }

    const url = new URL(redirectUrl);

    const token = url.searchParams.get("access_token");

    if (!token) {
      sendResponse({
        success: false,
        error: "Access token missing",
      });
      return;
    }

    const user = await GitHubService.getUser(token);

    await StorageService.updateSettings({
      githubToken: token,
      authMethod: "oauth",
    });

    await StorageService.saveGitHubUser(user);

    sendResponse({
      success: true,
      user,
    });
  }
);

    return true; // Keep channel open for async callback
  }

  if (message.action === 'COMPLETE_GITHUB_AUTH') {
    const { code, token, error } = message;

    // Clear pipe storage flag
    chrome.storage.local.remove('pipe_cp_vault');

    // Close the OAuth tab
    if (oauthTabId !== null) {
      chrome.tabs.remove(oauthTabId, () => {
        oauthTabId = null;
      });
    }

    if (error) {
      Logger.error('OAuth Intercept Error:', error);
      if (oauthResponseCallback) {
        oauthResponseCallback({ success: false, error });
        oauthResponseCallback = null;
      }
      return false;
    }

    // Exchange code (Serverless) or use token directly (Proxy)
    StorageService.getSettings().then(async (settings) => {
      try {
        let finalToken = token;

        if (!finalToken && code) {
          Logger.info('Exchanging code for token serverless-style...');
          const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              client_id: settings.clientId,
              client_secret: settings.clientSecret,
              code,
              redirect_uri: 'https://github.com/',
            }),
          });

          const tokenData = await tokenResponse.json();
          if (tokenData.error) {
            throw new Error(`GitHub token exchange error: ${tokenData.error_description || tokenData.error}`);
          }
          finalToken = tokenData.access_token;
        }

        if (!finalToken) {
          throw new Error('Access token not found in parameters.');
        }

        // Fetch user and save details
        const user = await GitHubService.getUser(finalToken);
        await StorageService.updateSettings({
          githubToken: finalToken,
          authMethod: 'oauth',
        });
        await StorageService.saveGitHubUser(user);

        Logger.success('OAuth Login successful for user:', user.login);
        if (oauthResponseCallback) {
          oauthResponseCallback({ success: true, user });
          oauthResponseCallback = null;
        }
      } catch (err) {
        Logger.error('OAuth complete handling error:', err);
        if (oauthResponseCallback) {
          oauthResponseCallback({ success: false, error: err instanceof Error ? err.message : String(err) });
          oauthResponseCallback = null;
        }
      }
    });

    return true;
  }

  if (message.action === 'LOGIN_PAT') {
    const { token } = message;
    GitHubService.getUser(token)
      .then(async (user) => {
        await StorageService.updateSettings({
          githubToken: token,
          authMethod: 'pat',
        });
        await StorageService.saveGitHubUser(user);
        Logger.success('PAT Login successful for user:', user.login);
        sendResponse({ success: true, user });
      })
      .catch((err) => {
        Logger.error('PAT Login failed:', err);
        sendResponse({ success: false, error: err.message || String(err) });
      });
    return true;
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
    return true;
  }

  return false;
});
