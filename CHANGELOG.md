# Changelog

All notable changes to CP Vault will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2024-07-12

### 🎉 Initial Release

This is the first public release of CP Vault — a Chrome extension that automatically syncs accepted competitive programming solutions to GitHub.

### ✨ Added

#### Platform Support
- **LeetCode** — GraphQL API intercept for real-time accepted verdict detection; extracts problem ID, name, difficulty, language, and code
- **Codeforces** — DOM polling-based verdict detection with full metadata extraction
- **CodeChef** — API intercept for submission results with language and code capture
- **HackerRank** — API intercept for accepted solutions with problem metadata

#### Core Engine
- **Sync Engine** — Orchestrates the end-to-end flow from detection to GitHub commit
- **Git Database API integration** — Atomic multi-file commits (solution + README + root README) in a single commit using GitHub's Git Trees API
- **Duplicate Detection** — Content-based hash comparison prevents re-uploading identical solutions
- **Retry Queue** — Failed syncs are enqueued and automatically retried; no solutions are lost on network failures
- **Storage Service** — Chrome `storage.local` abstraction for settings, history, and token management
- **Streak Tracking** — Daily solving streak calculated and stored locally

#### GitHub Integration
- **OAuth 2.0 Authentication** — Secure GitHub login via an OAuth proxy backend; token stored locally in Chrome storage only
- **Repository Selection** — Browse and select from existing repositories or create a new one
- **Folder Organization** — `Platform/Difficulty/ProblemID - Name/` structure (LeetCode), `Platform/ProblemName/` for others
- **Auto README Generation** — Per-problem `README.md` with title, difficulty, platform, language, and structure placeholders
- **Root README Auto-update** — Repository's root `README.md` updated with cumulative stats on every sync

#### Extension UI
- **Popup** — Dashboard showing connected account, streak, total problems, and recent syncs
- **Settings Page** — Full configuration: repository, folder naming style, platform toggles, commit message template, theme
- **Welcome / Onboarding Page** — Step-by-step first-run experience
- **Dark / Light Theme** — System-aware theme with manual override, persisted across sessions

#### Backend
- **OAuth Proxy Server** — Express.js server handling GitHub OAuth code exchange; stateless and containerized
- **Docker support** — `Dockerfile` + `docker-compose.yml` for one-command deployment
- **Health check endpoint** — `/health` for uptime monitoring

#### Developer Experience
- **TypeScript throughout** — Strict typing across all extension scripts
- **Vite build system** — Fast builds with multi-entry configuration for MV3
- **Tailwind CSS** — Utility-first styling with custom design tokens
- **GitHub Actions CI** — Automatic build validation on push and pull requests

### 🔒 Security
- GitHub OAuth token stored only in `chrome.storage.local` — never transmitted to CP Vault servers
- Backend is stateless — no tokens or user data are stored server-side
- `.env` excluded from version control; `.env.example` provided

### ⚠️ Known Limitations
- Extension requires the OAuth backend to be running locally or deployed for first-time GitHub login
- LeetCode detection requires the GraphQL submission response — may not work if LeetCode changes their API structure
- Dark/light theme requires a page reload to apply in some edge cases

---

## [Unreleased]

### 🔜 Planned
- AtCoder, CSES, SPOJ, GeeksForGeeks platform adapters
- Firefox extension support
- AI-generated approach notes in problem READMEs
- Statistics dashboard with visual charts
- Multi-repository support
