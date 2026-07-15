# Release Security Checklist - CP Vault

Follow this checklist before submitting a new build to the Chrome Web Store or deploying updates to the backend.

## Pre-Release Security Checklist

### 1. Build & Manifest Inspection
- [ ] Manifest version is strictly `3` (`"manifest_version": 3`).
- [ ] All declared `permissions` and `host_permissions` are verified as necessary under the principle of least privilege.
- [ ] No remote scripts are loaded in `web_accessible_resources` or referenced inside content scripts.
- [ ] The build script is executed cleanly and generates no lint or compiler warnings.

### 2. Dependency Review
- [ ] Dependency vulnerabilities are resolved via `npm audit`.
- [ ] Verify that no new packages were added that have known security issues or license compliance conflicts.
- [ ] Lockfile (`package-lock.json`) is checked in and matches the dependency tree.

### 3. Server Deployment Verification
- [ ] The Railway production server environment variables are audited to verify that no debug flags are set.
- [ ] The rate limiter is enabled and verified on all production endpoints.
- [ ] Strict SSL/TLS (HTTPS) is verified as active on `https://cp-vault-production.up.railway.app`.
