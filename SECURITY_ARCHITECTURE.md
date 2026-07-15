# Security Architecture - CP Vault

This document explains the security architecture of the CP Vault extension and backend.

## 1. Context Isolation (Manifest V3)
Manifest V3 enforces a highly secure execution model:
- **Service Worker (Background)**: Runs in a highly privileged, isolated extension environment. Handles API communication, token storage, and repository synchronization. It cannot access the DOM of normal websites.
- **Content Scripts**: Run in isolated worlds. They can read and modify the DOM of competitive programming sites, but they do NOT share memory, variables, or functions with the host page scripts.
- **Injected Scripts**: Executed in the context of the webpage to capture dynamic state (such as LeetCode's graphql response payloads) and communicate back to content scripts using `window.postMessage`.

## 2. Secure Authentication Architecture
The authentication uses a stateless Railway Proxy to avoid storing the GitHub Client Secret in the extension:

```
[Extension background] -> [launchWebAuthFlow] -> [Railway Backend Proxy] -> [GitHub OAuth]
                                                                                |
[Extension background] <- [chrome.identity] <- [HMAC Signed Redirect] <- [Railway Backend]
```

- **Stateless HMAC State Signatures**: The backend signs state parameter payloads using a SHA-256 HMAC signature. This ensures that only login requests originating from the extension can be redirected back to the extension, entirely preventing OAuth CSRF and session hijacking.
- **Least Privilege Scopes**: The OAuth tokens request only `repo` and `user` scopes, limiting the permissions granted to only those required to push code solutions.

## 3. Storage Security
- **Local Enclave**: Secrets like the `githubToken` are stored locally using `chrome.storage.local`.
- **No Cloud Synchronization**: Token configurations are never synchronized via Chrome Sync or external servers, minimizing data exposure.
