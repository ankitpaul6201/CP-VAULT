# CP Vault

CP Vault is a production-grade Chrome extension that automatically detects accepted submissions on LeetCode, Codeforces, CodeChef, and HackerRank, extracts their code and metadata, and commits them to a designated GitHub repository with structured problem documentation and repo-wide statistics.

---

## Key Features

- 🔄 **Automatic Sync**: Syncs your solutions automatically to GitHub immediately after an "Accepted" verdict.
- 🚀 **Zero Manual Uploading**: Eliminates manual copy-pasting or file creations.
- 📊 **Dynamic Root Statistics**: Maintains a detailed overview in your repository's main `README.md` with streaks, languages, platform breakdowns, and recently solved problems.
- 🛡️ **Atomic commits**: Syncs both solution code and updated root stats in a single commit via the GitHub Git Database API, preventing partial uploads.
- ⚙️ **Customizable Settings**: Control folder naming, commit templates, platform filters, and auto-sync preferences.
- 🔒 **Secure Authorization**: Connect securely via Personal Access Token (PAT) or via our OAuth proxy (Docker-backed Node.js/Express service).

---

## Project Structure

```text
CP Vault/
├── extension/             # React + Vite + TypeScript Extension
│   ├── manifest.json      # Extension Manifest V3 configuration
│   ├── src/
│   │   ├── background/    # Sync engine, queue, notifications, and storage
│   │   ├── content/       # Page observers, network request interceptors, and adapters
│   │   ├── popup/         # Chrome Action popup dashboard UI
│   │   └── settings/      # Configuration manager page UI
│   └── tsconfig.json      # TypeScript options
│
└── backend/               # OAuth Proxy Server (Node.js + Express)
    ├── server.js          # Authorize code redirection and exchange
    ├── Dockerfile         # Docker packaging configuration
    └── docker-compose.yml # Local docker orchestrator
```

---

## Tech Stack

- **Extension Core**: Chrome Extension Manifest V3, Web Interception, DOM Mutation Observers.
- **Frontend UI**: React, TypeScript, Vite, Tailwind CSS, Lucide icons, Zustand state management.
- **Proxy Backend**: Node.js, Express, Docker.

---

## Getting Started

1. **Installation**: Refer to [INSTALLATION.md](file:///c:/Users/ankit/Downloads/PROJECTS/CP%20Vault/INSTALLATION.md) to load the extension in Chrome and configure your credentials.
2. **Architecture**: Read [ARCHITECTURE.md](file:///c:/Users/ankit/Downloads/PROJECTS/CP%20Vault/ARCHITECTURE.md) to understand the extension flow and sync architecture.
3. **Developer Guide**: Refer to [DEVELOPER.md](file:///c:/Users/ankit/Downloads/PROJECTS/CP%20Vault/DEVELOPER.md) to learn how to compile, run tests, and contribute.

---

*Created and maintained by [Antigravity AI Pair Programmer](https://github.com/ankit/CP-Vault).*
