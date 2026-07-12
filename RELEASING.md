# Releasing CP Vault

This document explains the complete release process for maintainers.

---

## Quick Release (TL;DR)

```bash
# 1. Bump version
node scripts/bump-version.js 1.1.0

# 2. Edit CHANGELOG.md with actual release notes

# 3. Commit, tag, push
git add extension/package.json extension/manifest.json CHANGELOG.md
git commit -m "chore: bump version to v1.1.0"
git tag v1.1.0
git push origin main --tags
```

**That's it.** GitHub Actions handles everything else automatically.

---

## Detailed Process

### Step 1 — Decide the Version

We use [Semantic Versioning](https://semver.org/):

| Change | Version bump | Example |
|---|---|---|
| Bug fix | Patch `x.x.PATCH` | `1.0.0` → `1.0.1` |
| New feature (backward compatible) | Minor `x.MINOR.0` | `1.0.0` → `1.1.0` |
| Breaking change | Major `MAJOR.0.0` | `1.0.0` → `2.0.0` |
| Preview | Pre-release suffix | `1.1.0-beta.1` |

### Step 2 — Bump the Version

```bash
node scripts/bump-version.js <new-version>
# Example: node scripts/bump-version.js 1.1.0
```

This automatically updates:
- `extension/package.json` → version field
- `extension/manifest.json` → version field (without pre-release suffix)
- `CHANGELOG.md` → prepends a new blank section

### Step 3 — Fill in the Changelog

Edit `CHANGELOG.md` and fill in the auto-generated section:

```markdown
## [1.1.0] — 2024-08-01

### ✨ Added
- AtCoder platform adapter
- Export solutions as ZIP

### 🐛 Fixed
- LeetCode detection timeout on slow connections

### 🔄 Changed
- Improved retry queue backoff strategy
```

### Step 4 — Validate (Optional Local Check)

```bash
# Runs security scan + build validation
node scripts/validate-release.js
```

### Step 5 — Commit and Tag

```bash
git add extension/package.json extension/manifest.json CHANGELOG.md
git commit -m "chore: release v1.1.0"
git tag v1.1.0
git push origin main --tags
```

### Step 6 — Watch the Pipeline

Go to [GitHub Actions](https://github.com/ankitpaul6201/CP-VAULT/actions) and watch:

1. **🔒 Security Scan** — checks for secrets
2. **✅ Quality Gates** — TypeScript + build validation
3. **📦 Package** — creates `CP-Vault-v1.1.0.zip` + SHA256
4. **🚀 Publish** — creates GitHub Release with assets

---

## Pre-Releases

For alpha/beta/rc releases:

```bash
# Alpha
node scripts/bump-version.js 1.1.0-alpha.1
git tag v1.1.0-alpha.1
git push origin v1.1.0-alpha.1

# Beta
node scripts/bump-version.js 1.1.0-beta.1
git tag v1.1.0-beta.1
git push origin v1.1.0-beta.1

# Release Candidate
node scripts/bump-version.js 1.1.0-rc.1
git tag v1.1.0-rc.1
git push origin v1.1.0-rc.1
```

Pre-releases are automatically marked as such on GitHub Releases (not "Latest").

---

## Release Assets

Every release automatically includes:

| File | Description |
|---|---|
| `CP-Vault-v1.x.x.zip` | Clean extension ZIP (dist/ only) |
| `CP-Vault-v1.x.x.zip.sha256` | SHA256 integrity checksum |

### What's in the ZIP

```
CP-Vault-v1.x.x.zip
├── manifest.json
├── background.js
├── content.js
├── interceptor.js
├── index.html          ← Popup
├── settings.html
├── welcome.html
└── assets/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

No source files. No node_modules. No .env. Production-only.

---

## Hotfix Release

For urgent bug fixes:

```bash
# Branch from the release tag
git checkout -b hotfix/1.0.1 v1.0.0

# Make the fix...

# Bump patch version
node scripts/bump-version.js 1.0.1
git add -A
git commit -m "fix: critical sync bug on LeetCode"
git tag v1.0.1
git push origin v1.0.1

# Merge back to main
git checkout main
git merge hotfix/1.0.1
git push origin main
```

---

## Troubleshooting

### Release workflow failed at Security Scan
- Check for any `.env` files committed
- Review the Actions log for specific patterns found

### Release workflow failed at Quality Gates
- TypeScript errors: fix them locally with `node node_modules/typescript/bin/tsc --noEmit`
- Build errors: fix with `npm run build` in `extension/`

### ZIP is too large
- Run `node scripts/package-extension.js v1.x.x` locally and inspect contents
- Check if any large files were accidentally added to dist/

### GitHub Release not created
- Ensure the `GITHUB_TOKEN` has `contents: write` permission (set in release.yml)
- Check the workflow permissions in Settings → Actions → General
