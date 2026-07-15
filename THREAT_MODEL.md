# Threat Modeling - CP Vault

This document outlines the threat model for the CP Vault browser extension and its companion Railway backend.

## 1. System Assets
- **GitHub Access Token (`githubToken`)**: Highest value asset. Grated access to user repositories (private and public).
- **User Code Submissions**: Source code accepted on platforms like LeetCode, Codeforces, HackerRank, and CodeChef.
- **Extension Local Storage**: Stores settings, sync history, queued tasks, and the OAuth token.
- **GitHub Client Secret**: Stored exclusively on the Railway Express backend.
- **User PII**: GitHub Username and Profile Avatar URL.

## 2. Trust Boundaries & Attack Surfaces
- **Content Scripts & Injected Scripts**: Executed within the DOM of competitive programming sites. High threat from DOM XSS or malicious scripts on the host sites.
- **Message Passing Channel**: Communication between content scripts, options page, and background service worker. Vulnerable to message spoofing.
- **Express Backend API**: Exposes endpoints to start login and receive callback redirections. Vulnerable to DoS, OAuth CSRF, and Open Redirection.
- **Local Storage API (`chrome.storage.local`)**: Subject to side-channel read attacks if other extensions possess broad permissions or if the system is compromised.

## 3. STRIDE Analysis & Mitigations

| Threat Category | Potential Threat | Mitigation in CP Vault |
| :--- | :--- | :--- |
| **Spoofing** | Attackers forge message requests to sync arbitrary files. | Background service worker verifies sender properties and restricts message acceptance to internal extension context. |
| **Tampering** | Malicious injection in DOM altering submitted code before syncing. | Extension reads directly from verified page source elements and avoids using `eval()` or `innerHTML`. |
| **Repudiation** | Actions taken via leaked OAuth credentials cannot be traced. | Tokens are restricted in scope (`repo`, `user`) and logged client-side only under strict user control. |
| **Information Disclosure** | Leakage of access tokens through URL parameters or logging. | Backend uses state-signature validations and only forwards the token to the extension redirect URL via HTTPS. |
| **Denial of Service** | Flooding Railway login endpoints or GitHub API to lock out users. | Rate limiting via `express-rate-limit` on the Express proxy server. |
| **Elevation of Privilege** | Content script gaining direct access to the background context. | Manifest V3 isolates content scripts from the extension’s background worker context. |
