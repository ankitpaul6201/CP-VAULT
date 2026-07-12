# Changelog

All notable changes to this project will be documented in this file.

---

## [1.0.0] - 2026-07-11

### Added
- Complete Chrome Extension Manifest V3 implementation with Vite + React + TS.
- Automatic sync engine for **LeetCode**, **Codeforces**, **CodeChef**, and **HackerRank**.
- Dynamic repository-level `README.md` statistics generator (streaks, platform count charts, language breakdowns, and latest solutions table).
- Dual Authentication support: secure **GitHub PAT** and **GitHub OAuth App** (via Node/Express proxy).
- Atomic Tree commits using Git Database API to push solution source files, individual problem readmes, and updated root stats in a single API call.
- persisted **Retry Queue** with exponential backoff and network reconnection triggers.
- Dark-mode default, glassmorphic UI dashboards for popup and configuration pages.
- Automated unit test suite validating adapters and readme templates.
