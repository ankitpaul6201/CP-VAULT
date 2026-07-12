# Installation Guide

Follow these steps to install and set up CP Vault.

---

## 1. Prerequisites
- **Google Chrome** (or any Chromium-based browser like Brave, Edge, Opera)
- **Node.js** (v18 or higher) and `npm` installed
- A **GitHub Account**

---

## 2. Compile the Extension

Open your terminal, navigate to the `extension/` directory, install dependencies, and build:

```bash
cd extension
npm install
npm run build
```

This compiles all React components and packages them into the `dist/` directory.

---

## 3. Load the Extension into Chrome

1. Open Google Chrome.
2. In the URL bar, go to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click on **Load unpacked** (top-left button).
5. Select the `dist/` folder inside the `extension/` directory.

The CP Vault icon will now appear in your extension toolbar.

---

## 4. Setting up GitHub Authentication

You can authenticate using one of the following two methods:

### Method A: GitHub Personal Access Token (PAT) [Recommended for quick setup]
1. Go to your GitHub account settings.
2. Navigate to **Developer Settings** > **Personal Access Tokens** > **Tokens (classic)**.
3. Click **Generate new token (classic)**.
4. Name the token and select the `repo` and `read:user` scopes.
5. Copy the generated token.
6. Open CP Vault Settings page (click the gear icon in the extension popup).
7. Paste your token under the **GitHub Connection** tab and click **Connect PAT**.

### Method B: GitHub OAuth App (Via Docker Proxy)
If you want to use the standard OAuth login flow:
1. Run the local OAuth Proxy server:
   ```bash
   cd backend
   # Create a .env file containing GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET
   docker-compose up --build
   ```
2. Open CP Vault Settings, choose the **OAuth App Flow**, enter your GitHub App's **Client ID**, and click **Connect via GitHub OAuth**.

---

## 5. Connecting a Repository
1. Navigate to the **Repository Target** tab in CP Vault Settings.
2. Select one of your existing repositories from the list, or enter a name under **Create New Repository** and click **Create & Connect Repo**.
3. Now, whenever you get an Accepted verdict on any of the supported platforms, CP Vault will automatically sync your solution!
