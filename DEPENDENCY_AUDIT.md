# Dependency Security Audit - CP Vault

This document details the security review of the third-party dependencies used in the Chrome Extension and Express backend.

## 1. Extension Dependency Audit Results
A run of `npm audit` against the extension project identified two key vulnerabilities:

- **esbuild (<= 0.24.2)**:
  - **Severity**: Moderate
  - **Vulnerability**: esbuild allows any website to send arbitrary requests to the local development server and read the responses.
  - **Impact**: Dev-time token intercept or local file disclosure.
  - **Remediation**: Upgrade `esbuild` to `>= 0.25.0` or run `npm audit fix --force` to upgrade the underlying build tool chain.

- **Vite (<= 6.4.2)**:
  - **Severity**: High
  - **Vulnerability**: Transitive dependency on the vulnerable version of `esbuild`.
  - **Impact**: Remote code execution or server side request manipulation on development boxes.
  - **Remediation**: Upgrade `vite` to version `>= 8.1.4` (or the latest stable release of Vite 6 with safe esbuild dependencies).

## 2. Backend Dependency Audit Results
The backend project has zero known CVE vulnerabilities in its production packages (`express`, `cors`, `dotenv`, `helmet`, `express-rate-limit`).

## 3. General Dependency Recommendations
- **Avoid Permissive Range Declarations**: Avoid using `^` or `*` ranges for high-impact devDependencies. Lock the exact versions in `package.json` to prevent malicious dependency updates (Supply Chain Attacks/Dependency Poisoning).
- **Run CI Scans**: Set up Github Dependabot alerts to monitor dependencies and push automatic security update pull requests.
