# Chrome Web Store Security Compliance - CP Vault

This document details the security properties analyzed for Chrome Web Store distribution.

## 1. Manifest V3 Enforcement
- **Execution Limit**: The extension is built strictly using Manifest V3.
- **Service Worker**: The background page runs as a stateless Service Worker (`background.js`) to limit background resource usage.
- **Strict Content Security Policy**: Dynamic JavaScript evaluations (e.g. `eval()`) are blocked by Chrome by default. CP Vault complies fully and does not use any dynamic script generation.

## 2. Least Privilege Host Permissions
To prevent excessive site access concerns during Chrome Web Store review:
- Host permissions are limited strictly to the target competitive programming platforms (`leetcode.com`, `codeforces.com`, `codechef.com`, `hackerrank.com`) and `github.com`.
- General wildcard host permissions like `<all_urls>` are avoided to minimize the security footprint and expedite reviews.

## 3. Remote Code Execution (RCE) Compliance
- All logic is fully compiled and packaged within the extension.
- The extension does not download or execute any remote scripts, complying with the Chrome Web Store policy against Remote Code Execution.
