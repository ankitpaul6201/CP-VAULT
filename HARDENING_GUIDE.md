# Hardening Guide - CP Vault

Follow this guide to securely configure and deploy CP Vault in production.

## 1. Production Backend Configurations
- **Environment Variables**: Populate the following on Railway:
  - `GITHUB_CLIENT_ID`: Your GitHub OAuth App Client ID.
  - `GITHUB_CLIENT_SECRET`: Your GitHub OAuth App Client Secret (never expose this to the extension).
  - `STATE_SECRET`: A cryptographically secure random string (32+ bytes) used for signing the state payload.
  - `PORT`: Server port (e.g. 3000).

- **CORS Configurations**: Update the allowed origin regex inside `server.js` to strictly match your final Chrome Web Store Extension ID.
  ```js
  const allowedOriginRegex = /^chrome-extension:\/\/your_real_extension_id_here$/;
  ```

- **Enable HTTPS**: Railway automatically enforces SSL/TLS. Ensure all clients access the server exclusively via `https://`.

## 2. Chrome Extension Content Security Policy (CSP)
Ensure your `manifest.json` does not include permissive CSP configurations. Manifest V3 restricts CSP by default, preventing execution of remote scripts or arbitrary string evaluations like `eval()`.
- Never set `unsafe-eval` or allow loading third-party scripts.
- Only load static scripts packaged locally within the extension.

## 3. Storage Hardening
To prevent token leakage if the client system is compromised:
- Automatically validate credentials on startup using `AuthService.validateTokenOnStartup()`.
- Automatically clear local storage via `StorageService.clearAuth()` on authorization failure or token expiration.
