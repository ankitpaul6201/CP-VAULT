# CP Vault v1.0.0 — Release Notes

**Release Date**: July 12, 2024  
**Extension Version**: 1.0.0  
**Manifest Version**: 3  
**Compatibility**: Chrome 114+, Edge 114+, Brave, Opera (all Chromium-based)

---

## 🎉 Highlights

CP Vault v1.0.0 is the **first public release** — a fully functional Chrome extension that automatically detects accepted competitive programming solutions and syncs them to GitHub with beautiful auto-generated documentation. No manual copying, no forgetting to push. Your solutions are always archived and documented.

---

## ✨ New Features

### Platform Support
| Platform | Detection Method | Status |
|---|---|---|
| LeetCode | GraphQL submission intercept | ✅ |
| Codeforces | DOM verdict polling | ✅ |
| CodeChef | API response intercept | ✅ |
| HackerRank | API response intercept | ✅ |

### GitHub Integration
- **OAuth 2.0 authentication** via a self-hosted OAuth proxy backend (Express.js)
- **Repository browser** — select an existing repo or create a new one from the extension
- **Atomic commits** using GitHub's Git Database API — solution code, per-problem README, and root README are committed in a single operation (no noisy multiple-commit history)
- **Duplicate detection** — content hashing prevents re-uploading identical solutions

### Auto-Generated Documentation
- **Per-problem README.md** — includes platform, problem ID, difficulty, language, title, and structure placeholders for approach notes and complexity
- **Root repository README.md** — automatically updated with total problems solved, platform breakdown, language stats, and streak data

### Smart Sync Engine
- **Retry Queue** — failed syncs are queued and retried automatically; no solutions lost on network failures
- **Streak tracking** — daily solving streak tracked locally
- **Desktop notifications** — real-time sync success/failure alerts via Chrome notifications API

### Extension UI
- **Popup dashboard** — connected account info, current streak, total problems, platform counts, and recent sync activity
- **Settings page** — full configuration: repository selection, folder naming style (`ProblemID - Name` or `ProblemName`), per-platform toggles, commit message template, theme
- **Welcome / onboarding page** — step-by-step first-run experience for new users
- **Dark / Light theme** — system-aware with manual override, persisted across sessions

### Backend & Infrastructure
- **Express.js OAuth proxy** — stateless server for GitHub OAuth code exchange
- **Docker + Docker Compose** — one-command backend deployment
- **GitHub Actions CI** — automatic build validation on push and pull requests

---

## 📁 Folder Structure Generated in Your Repository

```
your-solutions-repo/
├── README.md                        ← Auto-updated stats dashboard
├── LeetCode/
│   ├── Easy/
│   │   └── 0001 - Two Sum/
│   │       ├── solution.cpp
│   │       └── README.md
│   └── Medium/
│       └── ...
├── Codeforces/
│   └── 1A - Theatre Square/
│       ├── solution.cpp
│       └── README.md
├── CodeChef/
│   └── ...
└── HackerRank/
    └── ...
```

---

## ⚡ Performance

- **Single atomic commit** per accepted solution (no multiple commits per sync)
- **Content hashing** prevents redundant API calls for duplicate solutions
- **Background service worker** architecture — zero impact on page load performance
- **Local Chrome storage** for all settings and history — no external database

---

## 🔒 Security

- GitHub OAuth token is stored **only** in `chrome.storage.local` (browser-encrypted)
- The OAuth backend is **stateless** — no user data or tokens are ever stored server-side
- All communications with GitHub use HTTPS and the official GitHub REST API
- No analytics, no telemetry, no third-party data collection

---

## 🐛 Known Limitations

- **Requires local backend for first-time OAuth login** — the OAuth proxy must be running for initial GitHub authentication
- **LeetCode API dependency** — detection relies on LeetCode's GraphQL submission endpoint; may break if LeetCode changes their API
- **Codeforces detection latency** — DOM polling may take 3–10 seconds to detect the verdict
- **No retroactive batch sync** — only new solutions (post-installation) are synced
- **Dark/light theme** may require a page reload to apply in some edge cases

---

## 🔜 Coming in v1.1.0

- AtCoder, CSES, SPOJ, GeeksForGeeks platform adapters
- Custom commit message templates (full UI)
- Export solutions as ZIP
- Improved error diagnostics

---

## 📦 Installation

See [INSTALLATION.md](./INSTALLATION.md) for full setup instructions.

**Quick Start:**
```bash
git clone https://github.com/ankitpaul6201/CP-VAULT.git
cd CP-VAULT/extension && npm install && npm run build
# Load extension/dist/ as unpacked in chrome://extensions/
```

---

## 🙏 Acknowledgements

Thank you to everyone in the competitive programming and open-source communities who inspired this project.

Special thanks to LeetCode, Codeforces, CodeChef, and HackerRank for their platforms.

---

**Full Changelog**: https://github.com/ankitpaul6201/CP-VAULT/blob/main/CHANGELOG.md
