# Developer Guide

Welcome to the CP Vault developer documentation. This document details how to compile the code, test modifications, and run the automated test suite.

---

## Development Setup

First, clone the workspace and make sure you have loaded the extension in Chrome.

To watch for file changes during extension development and compile automatically:

```bash
cd extension
npm run dev
```

*Note: Since Chrome manifest requires service workers to reside in static files, you will need to click the "Reload" icon on the `chrome://extensions` page to apply changes made to background scripts (`background.js`) or content scripts (`content.js`).*

---

## Running the Automated Test Suite

CP Vault comes with a preconfigured automated test suite that validates adapter cleaning mechanisms, difficulty normalization, and README template generation.

You can run the tests using Node.js directly:

```bash
cd extension
# Run the test bundle
node -e "import('./src/tests/runTests.ts')"
```

---

## Code Quality Standards

1. **Type Safety**: Avoid using `any` type definitions. Declare explicit interfaces in [types/index.ts](file:///c:/Users/ankit/Downloads/PROJECTS/CP%20Vault/extension/src/shared/types/index.ts).
2. **Platform Scrapers**: Keep adapters strictly decoupled. Add any new site scrapers under `src/content/adapters/` and register them in [src/content/index.ts](file:///c:/Users/ankit/Downloads/PROJECTS/CP%20Vault/extension/src/content/index.ts).
3. **Atomic Operations**: Always commit related files together using the tree-based `GitHubService.commitFiles` function to avoid messy commit streams.
