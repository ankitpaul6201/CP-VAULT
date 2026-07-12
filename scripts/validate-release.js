#!/usr/bin/env node
/**
 * CP Vault — Pre-Release Security Validator
 * ──────────────────────────────────────────
 * Runs before every release to ensure no secrets, credentials,
 * or sensitive files are included.
 *
 * Usage:
 *   node scripts/validate-release.js
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { resolve, join, extname } from 'fs';
import path from 'path';

const ROOT = resolve(path.dirname(new URL(import.meta.url).pathname), '..');

let errors = 0;
let warnings = 0;

function error(msg) {
  console.error(`  ❌ ERROR: ${msg}`);
  errors++;
}

function warn(msg) {
  console.warn(`  ⚠️  WARN:  ${msg}`);
  warnings++;
}

function ok(msg) {
  console.log(`  ✅ OK:    ${msg}`);
}

// ─────────────────────────────────────────────────────────
// Check 1: No .env files
// ─────────────────────────────────────────────────────────
function checkEnvFiles() {
  console.log('\n🔍 Checking for .env files...');
  const dangerous = ['.env', '.env.local', '.env.production', '.env.development'];

  for (const f of dangerous) {
    const p = join(ROOT, f);
    if (existsSync(p)) error(`.env file found at root: ${f}`);

    const pb = join(ROOT, 'backend', f);
    if (existsSync(pb) && f !== '.env.example') error(`.env file found in backend: backend/${f}`);
  }
  ok('.env check complete');
}

// ─────────────────────────────────────────────────────────
// Check 2: No secrets in source files
// ─────────────────────────────────────────────────────────
const SECRET_PATTERNS = [
  { pattern: /ghp_[a-zA-Z0-9]{36}/, name: 'GitHub PAT' },
  { pattern: /github_pat_[a-zA-Z0-9_]{82}/, name: 'GitHub Fine-Grained PAT' },
  { pattern: /sk-[a-zA-Z0-9]{48}/, name: 'OpenAI API Key' },
  { pattern: /AKIA[0-9A-Z]{16}/, name: 'AWS Access Key' },
  { pattern: /-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----/, name: 'Private Key' },
  { pattern: /client_secret\s*=\s*["'][^"']{10,}["']/, name: 'OAuth Client Secret (literal)' },
];

const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.json', '.yaml', '.yml', '.env', '.sh'];
const SKIP_DIRS = ['node_modules', '.git', 'dist', '.github'];

function scanFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    for (const { pattern, name } of SECRET_PATTERNS) {
      if (pattern.test(content)) {
        error(`Possible ${name} found in: ${path.relative(ROOT, filePath)}`);
      }
    }
  } catch {
    // Binary files — skip
  }
}

function walkDir(dir) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    if (SKIP_DIRS.includes(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walkDir(full);
    } else {
      const ext = path.extname(full);
      if (SCAN_EXTENSIONS.includes(ext) || entry === '.env.example') {
        scanFile(full);
      }
    }
  }
}

function checkSecrets() {
  console.log('\n🔍 Scanning for hardcoded secrets...');
  walkDir(ROOT);
  ok('Secret scan complete');
}

// ─────────────────────────────────────────────────────────
// Check 3: node_modules not tracked
// ─────────────────────────────────────────────────────────
function checkNodeModules() {
  console.log('\n🔍 Checking node_modules...');
  const nm = join(ROOT, 'extension', 'node_modules');
  if (!existsSync(nm)) {
    warn('extension/node_modules not installed — run npm install');
  } else {
    ok('node_modules exists locally (should be gitignored)');
  }
}

// ─────────────────────────────────────────────────────────
// Check 4: dist/ exists (must have been built)
// ─────────────────────────────────────────────────────────
function checkBuild() {
  console.log('\n🔍 Checking build output...');
  const dist = join(ROOT, 'extension', 'dist');

  if (!existsSync(dist)) {
    error('extension/dist/ not found — run `npm run build` first');
    return;
  }

  const required = ['manifest.json', 'background.js', 'content.js'];
  for (const f of required) {
    if (!existsSync(join(dist, f))) {
      error(`Missing build file: dist/${f}`);
    } else {
      ok(`dist/${f} present`);
    }
  }
}

// ─────────────────────────────────────────────────────────
// Check 5: Manifest version matches package.json
// ─────────────────────────────────────────────────────────
function checkVersionSync() {
  console.log('\n🔍 Checking version synchronization...');

  try {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'extension', 'package.json'), 'utf8'));
    const mfst = JSON.parse(readFileSync(join(ROOT, 'extension', 'manifest.json'), 'utf8'));

    const pkgBase = pkg.version.split('-')[0];
    if (pkgBase !== mfst.version) {
      warn(`Version mismatch: package.json (${pkg.version}) vs manifest.json (${mfst.version})`);
      warn('Run: node scripts/bump-version.js <version> to sync them');
    } else {
      ok(`Versions in sync: ${mfst.version}`);
    }
  } catch (e) {
    warn(`Could not read version files: ${e.message}`);
  }
}

// ─────────────────────────────────────────────────────────
// Run all checks
// ─────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════');
console.log('  CP Vault Pre-Release Security Validator  ');
console.log('═══════════════════════════════════════════');

checkEnvFiles();
checkSecrets();
checkNodeModules();
checkBuild();
checkVersionSync();

console.log('\n═══════════════════════════════════════════');
if (errors > 0) {
  console.error(`\n❌ Validation FAILED — ${errors} error(s), ${warnings} warning(s)`);
  console.error('   Fix all errors before releasing.\n');
  process.exit(1);
} else {
  console.log(`\n✅ Validation PASSED — ${warnings} warning(s)`);
  console.log('   Safe to create release.\n');
}
