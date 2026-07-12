import { Logger } from '../shared/utils/logger';
import { LeetCodeAdapter } from './adapters/leetcode';
import { CodeChefAdapter } from './adapters/codechef';
import { HackerRankAdapter } from './adapters/hackerrank';
import { CodeforcesAdapter } from './adapters/codeforces';

Logger.info('Content script running.');

// Check if we are on github.com to intercept the OAuth redirect code
if (window.location.host === 'github.com' || window.location.host.endsWith('.github.com')) {
  chrome.storage.local.get('pipe_cp_vault', (data) => {
    if (data && data.pipe_cp_vault) {
      const url = window.location.href;
      if (url.includes('access_token=')) {
        const token = url.match(/access_token=([^&]+)/)?.[1];
        if (token) {
          chrome.runtime.sendMessage({ action: 'COMPLETE_GITHUB_AUTH', token });
        }
      } else if (url.includes('code=')) {
        const code = url.match(/code=([^&]+)/)?.[1];
        if (code) {
          chrome.runtime.sendMessage({ action: 'COMPLETE_GITHUB_AUTH', code });
        }
      } else if (url.includes('error=')) {
        const errorDesc = url.match(/error_description=([^&]+)/)?.[1] || 'Authentication cancelled by user';
        chrome.runtime.sendMessage({ action: 'COMPLETE_GITHUB_AUTH', error: decodeURIComponent(errorDesc) });
      }
    }
  });
}

// 1. Inject interceptor.js script into the webpage DOM (main context)
if (shouldInjectInterceptor()) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('interceptor.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
  Logger.info('Interceptor script injected successfully.');
}

function shouldInjectInterceptor(): boolean {
  const host = window.location.hostname;
  return (
    host.includes('leetcode.com') ||
    host.includes('codechef.com') ||
    host.includes('hackerrank.com')
  );
}

// 2. Listen to postMessage from the injected interceptor (API fallback for CodeChef & HackerRank)
window.addEventListener('message', (event) => {
  if (!event.data || event.data.source !== 'cp-vault-interceptor') {
    return;
  }

  const { url, responseText } = event.data;
  const host = window.location.hostname;

  // LeetCode now uses DOM observer + webNavigation (not network interception)
  if (host.includes('codechef.com')) {
    CodeChefAdapter.parse(url, responseText);
  } else if (host.includes('hackerrank.com')) {
    HackerRankAdapter.parse(url, responseText);
  }
});

// 3. Initialize platform adapters (DOM MutationObserver-based)
if (window.location.hostname.includes('codeforces.com')) {
  CodeforcesAdapter.initialize();
}

if (window.location.hostname.includes('leetcode.com')) {
  LeetCodeAdapter.initialize();
}

if (window.location.hostname.includes('codechef.com')) {
  CodeChefAdapter.initialize();
}

if (window.location.hostname.includes('hackerrank.com')) {
  HackerRankAdapter.initialize();
}
