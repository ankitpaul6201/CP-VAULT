# Contributing to CP Vault

Thank you for your interest in contributing to CP Vault! We welcome contributions to add adapters for additional platforms (like AtCoder, GeeksforGeeks, CSES, and SPOJ), improve UI aesthetics, or optimize sync performance.

---

## Code Contribution Process

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-new-platform`.
3. Implement your changes following our directory layout. If you are adding a new platform:
   - Implement the parsing logic in `src/content/adapters/<platform>.ts`.
   - Update `src/content/index.ts` to route requests.
   - Add matching rules in `manifest.json`.
4. Ensure tests are passing by running:
   ```bash
   cd extension
   node -e "import('./src/tests/runTests.ts')"
   ```
5. Submit a Pull Request.

---

## Coding Standards

- Maintain strict TypeScript type safety. Avoid `any` types.
- Ensure all comments and docstrings remain clean and descriptive.
- Follow the existing folder structure (`types`, `background`, `content`, `shared`, `tests`).
