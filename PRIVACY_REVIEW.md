# Privacy Review - CP Vault

This document details the privacy review of the CP Vault browser extension and backend.

## 1. Data Collection & Telemetry Policy
- **Zero Telemetry**: CP Vault does not include any third-party analytics engines (such as Google Analytics or Mixpanel), session tracking, or diagnostic log transmitters.
- **Local Logs**: Extension operational logs are logged client-side only via standard browser developer console logs and are never shared.

## 2. Personal Identifiable Information (PII)
- **User Data Storage**: The only user profile details stored are:
  - GitHub Username (`githubUsername` / `login`)
  - Profile Avatar URL (`githubAvatar` / `avatarUrl`)
  - Target Repository Name (`repoName`)
- **Isolation**: These details are kept locally in `chrome.storage.local` to populate the options page and popup UI. They are never transmitted to the Railway backend proxy or any third-party analytics server.

## 3. Manifest Permissions Review
The extension operates under strict Chrome permissions constraints:
- **`storage`**: Necessary to keep user settings, streak logs, and the OAuth access token locally.
- **`notifications`**: Required to show success/failure feedback on sync attempts.
- **`identity`**: Necessary to securely call `launchWebAuthFlow` for GitHub OAuth.
- **`alarms`**: Used exclusively to run scheduled retry synchronization attempts for failed commits.
- **`webNavigation`**: Used to identify history transitions on LeetCode submission pages to capture submission IDs.
