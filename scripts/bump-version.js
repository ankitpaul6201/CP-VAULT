#!/usr/bin/env node
/**
 * CP Vault — Version Bumper
 * ─────────────────────────
 * Bumps the version in:
 *   - extension/package.json
 *   - extension/manifest.json
 *   - CHANGELOG.md (adds new section)
 *
 * Usage:
 *   node scripts/bump-version.js <new-version>
 *   node scripts/bump-version.js 1.1.0
 *   node scripts/bump-version.js 1.1.0-beta.1
 *
 * Then:
 *   git add -A
 *   git commit -m "chore: bump version to v1.1.0"
 *   git tag v1.1.0
 *   git push origin main --tags
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';

const ROOT = resolve(import.meta.dirname || process.cwd(), '..');

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
function readJSON(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJSON(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function readFile(path) {
  return readFileSync(path, 'utf8');
}

function writeFile(path, content) {
  writeFileSync(path, content, 'utf8');
}

function validateSemver(version) {
  const semverRe = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/;
  if (!semverRe.test(version)) {
    console.error(`❌ Invalid version: "${version}"`);
    console.error('   Expected format: 1.0.0 or 1.0.0-beta.1');
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────
function bumpVersion() {
  const newVersion = process.argv[2];

  if (!newVersion) {
    console.error('Usage: node scripts/bump-version.js <version>');
    console.error('Example: node scripts/bump-version.js 1.1.0');
    process.exit(1);
  }

  validateSemver(newVersion);

  const pkgPath   = join(ROOT, 'extension', 'package.json');
  const mfstPath  = join(ROOT, 'extension', 'manifest.json');
  const chngPath  = join(ROOT, 'CHANGELOG.md');

  const pkg  = readJSON(pkgPath);
  const mfst = readJSON(mfstPath);

  const oldVersion = pkg.version;

  console.log(`\n🔖 Bumping CP Vault: ${oldVersion} → ${newVersion}\n`);

  // ── 1. Update extension/package.json ──
  pkg.version = newVersion;
  writeJSON(pkgPath, pkg);
  console.log(`✅ extension/package.json → ${newVersion}`);

  // ── 2. Update extension/manifest.json ──
  // Manifest version must be plain semver without pre-release suffix
  const manifestVersion = newVersion.split('-')[0];
  mfst.version = manifestVersion;
  writeJSON(mfstPath, mfst);
  console.log(`✅ extension/manifest.json → ${manifestVersion} (no pre-release suffix)`);

  // ── 3. Prepend to CHANGELOG.md ──
  const today = new Date().toISOString().split('T')[0];
  const changelog = readFile(chngPath);

  const newSection = `## [${newVersion}] — ${today}

### ✨ Added

- <!-- Describe new features -->

### 🐛 Fixed

- <!-- Describe bug fixes -->

### 🔄 Changed

- <!-- Describe changes -->

### 🗑️ Removed

- <!-- Describe removals -->

---

`;

  // Insert after the first H1 line (# Changelog)
  const updatedChangelog = changelog.replace(
    /^(# Changelog\n\n[\s\S]*?)(^## )/m,
    `$1${newSection}$2`
  );

  if (updatedChangelog === changelog) {
    // Fallback: prepend after first line
    const lines = changelog.split('\n');
    const firstH2 = lines.findIndex(l => l.startsWith('## '));
    if (firstH2 >= 0) {
      lines.splice(firstH2, 0, newSection);
      writeFile(chngPath, lines.join('\n'));
    } else {
      writeFile(chngPath, newSection + '\n' + changelog);
    }
  } else {
    writeFile(chngPath, updatedChangelog);
  }

  console.log(`✅ CHANGELOG.md → new section for ${newVersion}`);

  // ── Summary ──
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Version bumped to v${newVersion}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next steps:
  1. Edit CHANGELOG.md to fill in the release notes
  2. Commit the changes:
       git add extension/package.json extension/manifest.json CHANGELOG.md
       git commit -m "chore: bump version to v${newVersion}"
  3. Tag and push:
       git tag v${newVersion}
       git push origin main --tags

The release pipeline will automatically:
  ✅ Build the extension
  ✅ Create CP-Vault-v${newVersion}.zip
  ✅ Generate SHA256 checksum
  ✅ Publish GitHub Release
  ✅ Upload release assets
`);
}

bumpVersion();
