# Security Checklist - CP Vault

This checklist must be reviewed and followed by developers when making updates to the CP Vault project.

## Development Checklist

### 1. Code & Secret Hygiene
- [ ] No API keys, OAuth secrets, or personal access tokens (PATs) are hardcoded in the codebase.
- [ ] Debug logs or print statements that print sensitive values like access tokens are removed before commit.
- [ ] All `.env` environment variables are properly documented in `.env.example`.

### 2. Message Passing Validation
- [ ] Background service worker message listeners validate the sender's origin.
- [ ] Message payloads are parsed with defensive type checks to prevent prototype pollution or JSON injection.
- [ ] Sensitive operations (like authentication and settings updates) are restricted to trusted internal extension UI modules.

### 3. DOM & Script Protection
- [ ] No usage of `innerHTML` or `dangerouslySetInnerHTML` with unsanitized user inputs. Prefer `textContent` or `innerText`.
- [ ] No usage of `eval()`, `new Function()`, or dynamic scripting commands in injected or content scripts.
- [ ] Dynamic values passed through `window.postMessage` are validated against strict structural schemas.
