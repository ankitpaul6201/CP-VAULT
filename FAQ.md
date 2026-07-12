# Frequently Asked Questions (FAQ)

---

## General

### What is CP Vault?
CP Vault is a Chrome extension that automatically detects when you solve a competitive programming problem (get "Accepted") and syncs your solution to a GitHub repository — with auto-generated documentation.

### Is CP Vault free?
Yes. CP Vault is completely free and open source under the MIT license.

### Does CP Vault work on Firefox?
Not yet. Firefox support is planned for v2.0.0. Currently, CP Vault supports Chrome, Edge, Brave, and Opera (all Chromium-based browsers).

---

## Setup

### What do I need to get started?
- A GitHub account
- A Chromium browser
- Node.js (to build the extension)
- The OAuth backend running locally or deployed

### Do I need to run the backend server myself?
Yes, for the initial GitHub login. The backend handles the OAuth code exchange. You can run it locally with `node server.js` or deploy it to any Node.js host (Railway, Render, Vercel, etc.).

### Can I use CP Vault without the backend?
Only if you already have a GitHub Personal Access Token. You can manually paste it into `chrome.storage.local` via DevTools, but this is not the recommended flow.

### Where is my GitHub token stored?
Your token is stored in `chrome.storage.local` — which is encrypted by Chrome and accessible only to the CP Vault extension. It is never sent to any CP Vault server.

---

## Platforms

### Why isn't my LeetCode solution being synced?
- Make sure the submission shows "Accepted" (not "Wrong Answer" or "Time Limit Exceeded")
- Check that LeetCode is enabled in Settings
- Open the background service worker DevTools: `chrome://extensions/` → CP Vault → "Service Worker" → Console
- LeetCode may have changed their GraphQL API — please [open an issue](https://github.com/ankitpaul6201/CP-VAULT/issues)

### Does CP Vault work for premium LeetCode problems?
Yes, as long as you have access to the problem and submit an accepted solution.

### Why does Codeforces sync take a few seconds longer?
Codeforces detection uses DOM polling (checking the verdict on the page). It may take 3–10 seconds after the verdict appears before CP Vault detects it.

### Will CP Vault sync all my existing solutions?
No. CP Vault only syncs new accepted solutions from the moment it is installed and connected. There is no retroactive batch sync currently — this is planned for a future release.

---

## GitHub Repository

### Can I choose an existing repository?
Yes. In the Settings page, you can select any existing repository from your GitHub account.

### Can I use a private repository?
Yes. The `repo` OAuth scope grants access to both public and private repositories.

### What happens if I already have a solution for the same problem?
CP Vault compares the content hash. If the code is identical, the sync is skipped with a notification. If the code is different (e.g., a better solution), it uploads the updated version with a different commit message.

### Can I customize the folder structure?
Partially. In Settings, you can toggle between `ProblemID - Name` and `ProblemName` folder naming styles. Full custom path templates are planned for v1.1.0.

---

## Errors

### I see "GitHub token is missing" in the popup
Click "Connect with GitHub" to authenticate. Make sure the backend server is running.

### Sync failed and I got a notification — what happened?
The solution is added to the retry queue automatically. CP Vault will retry it. Check the popup for queue status. If it keeps failing, check your internet connection and GitHub token validity.

### The extension shows no activity on a supported platform
1. Check that the platform is enabled in Settings
2. Verify the content script is injected: F12 → Console on the platform page, look for CP Vault logs
3. Try reloading the extension from `chrome://extensions/`

---

## Contributing

### How do I add support for a new platform?
See [CONTRIBUTING.md](./CONTRIBUTING.md#adding-a-new-platform-adapter) for detailed instructions.

### I found a security issue — what do I do?
Please read [SECURITY.md](./SECURITY.md) and report it via email, **not** as a public issue.
