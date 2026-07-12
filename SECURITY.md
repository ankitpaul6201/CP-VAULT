# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 1.0.x | ✅ Active |

---

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in CP Vault, please disclose it responsibly:

### How to Report

1. **Email**: Send details to `ankitpaul6201@gmail.com` with the subject line:  
   `[SECURITY] CP Vault Vulnerability Report`

2. **Include in your report**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested mitigations (optional)

### What to Expect

| Timeline | Action |
|---|---|
| **24 hours** | Acknowledgement of your report |
| **72 hours** | Initial assessment and severity rating |
| **7 days** | Fix plan or workaround communicated |
| **30 days** | Fix released (for critical/high severity) |

You will be credited in the release notes for responsible disclosure (unless you prefer to remain anonymous).

---

## Security Architecture

### Token Handling
- GitHub OAuth tokens are stored **only** in `chrome.storage.local` — encrypted by the browser
- Tokens are **never** sent to CP Vault servers or logged anywhere
- The OAuth backend (server.js) is **stateless** — it exchanges the code for a token and immediately redirects it to the extension. It never stores tokens.

### Data Flow
```
GitHub OAuth → CP Vault Backend (stateless) → Chrome Extension → chrome.storage.local
                                                                  (browser-encrypted)
```

### What CP Vault Does NOT Do
- Does not collect or store user data on any server
- Does not transmit your code or solutions to any CP Vault service
- Does not use third-party analytics
- Does not access any data outside the declared host permissions

### Permissions Justification

| Permission | Reason |
|---|---|
| `storage` | Store settings, token, and sync history locally |
| `notifications` | Show sync success/failure desktop notifications |
| `identity` | Required for Chrome OAuth flow |
| `scripting` | Inject content scripts dynamically |
| `alarms` | Schedule periodic sync retry checks |
| `webNavigation` | Detect page navigation on supported platforms |

---

## Known Security Considerations

1. **OAuth backend must be self-hosted**: The backend server handles GitHub OAuth. If you deploy it publicly, ensure it is secured with HTTPS and rate limiting.
2. **Token scope**: CP Vault requests `repo` and `user` scopes. The `repo` scope allows full repository access. Future versions will explore narrower scopes.
