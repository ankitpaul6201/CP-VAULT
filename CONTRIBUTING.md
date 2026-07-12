# Contributing to CP Vault

Thank you for your interest in contributing to CP Vault! 🎉  
Every contribution — big or small — is deeply appreciated.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Adding a New Platform Adapter](#adding-a-new-platform-adapter)
- [Reporting Bugs](#reporting-bugs)

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md). Please read it before contributing.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Create a branch** for your change
4. **Make changes**, test thoroughly
5. **Submit a Pull Request**

---

## Development Setup

### Prerequisites
- Node.js `>= 18.x`
- npm `>= 9.x`
- A Chromium browser (Chrome, Edge, Brave)

### Extension

```bash
cd extension
npm install
npm run build
```

Load `extension/dist/` as an unpacked extension in your browser.

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your GitHub OAuth App credentials
node server.js
```

---

## How to Contribute

### 🐛 Bug Fixes
- Check [existing issues](https://github.com/ankitpaul6201/CP-VAULT/issues) first
- Open a new issue using the [Bug Report template](./.github/ISSUE_TEMPLATE/bug_report.md)
- Reference the issue in your PR

### ✨ New Features
- Open a [Feature Request](./.github/ISSUE_TEMPLATE/feature_request.md) issue first to discuss
- Wait for maintainer feedback before starting large implementations

### 📝 Documentation
- Fix typos, improve explanations, add examples
- PRs for docs are always welcome without a prior issue

### 🌐 New Platform Adapters
See the [Adding a New Platform Adapter](#adding-a-new-platform-adapter) section below.

---

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description

[optional body]

[optional footer]
```

### Types

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `refactor` | Code restructuring (no behavior change) |
| `test` | Adding or fixing tests |
| `chore` | Build process, dependency updates |
| `ci` | CI/CD configuration |

### Examples

```
feat(adapter): add AtCoder platform support
fix(sync): handle empty code block edge case on LeetCode
docs(readme): add Firefox installation instructions
chore(deps): bump vite to 5.4.0
```

---

## Pull Request Process

1. **Ensure your branch is up to date** with `main`
2. **Run the build** and verify it succeeds: `npm run build`
3. **Test manually** in the browser with the extension loaded unpacked
4. **Fill out the PR template** completely
5. **Link any related issues** with `Closes #123`
6. **Request a review** — a maintainer will review within 48 hours

### PR Checklist
- [ ] Code compiles without errors (`npm run build`)
- [ ] No `console.log` left in production code (use `Logger` utility)
- [ ] No sensitive data (tokens, secrets) included
- [ ] TypeScript types are correct (no `any` without justification)
- [ ] PR description explains the why, not just the what

---

## Coding Standards

- **TypeScript strict mode** — no implicit `any`
- **Use the `Logger` utility** instead of `console.log/warn/error`
- **Use `StorageService`** for all Chrome storage reads/writes
- **Use `GitHubService`** for all GitHub API calls
- **React components** use functional components with hooks
- **Tailwind CSS** for styling — avoid inline styles

---

## Adding a New Platform Adapter

Platform adapters live in `extension/src/content/adapters/`. To add a new platform:

1. **Create** `extension/src/content/adapters/yourplatform.ts`
2. **Implement** the `PlatformAdapter` interface:

```typescript
export const YourPlatformAdapter = {
  isSupported(): boolean {
    return window.location.hostname.includes('yourplatform.com');
  },

  async detect(): Promise<SubmissionMetadata | null> {
    // Detect accepted verdict and extract metadata
    // Return null if not an accepted submission
    return {
      platform: 'YourPlatform',
      problemId: '123',
      problemName: 'Problem Name',
      difficulty: 'Medium',
      language: 'cpp',
      code: '// solution code',
      url: window.location.href,
    };
  }
};
```

3. **Register** your adapter in `extension/src/content/index.ts`
4. **Add host permissions** in `extension/manifest.json` under `host_permissions` and `content_scripts.matches`
5. **Document** the detection method in a comment and in `README.md`
6. **Test** on at least 3 different accepted submissions

---

## Reporting Bugs

Use the [Bug Report issue template](./.github/ISSUE_TEMPLATE/bug_report.md).

Please include:
- Browser version
- Extension version (from `manifest.json`)
- Platform where the bug occurred
- Steps to reproduce
- Expected vs actual behavior
- Console logs (F12 → Console, filter by "CP Vault")

---

Thank you for making CP Vault better! 🚀
