#!/usr/bin/env node
/**
 * CP Vault — Extension Packager
 * ─────────────────────────────
 * Creates a clean, distributable ZIP of the built extension.
 * Only includes files required for browser installation.
 * Never includes: node_modules, .env, secrets, source files, tests.
 *
 * Usage:
 *   node scripts/package-extension.js v1.0.0
 */

import { createWriteStream, existsSync, readdirSync, statSync } from 'fs';
import { resolve, join, relative } from 'path';
import archiver from 'archiver';

const ROOT = resolve(import.meta.dirname || process.cwd(), '..');

// ─────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────
const DIST_DIR = join(ROOT, 'extension', 'dist');

// Files/patterns to EXCLUDE from the ZIP even if present in dist/
const EXCLUDE_PATTERNS = [
  /\.map$/,          // Source maps (not needed for unpacked load)
  /\.DS_Store$/,     // macOS metadata
  /Thumbs\.db$/,     // Windows metadata
  /\.gitkeep$/,
  /\.gitignore$/,
  /node_modules/,
  /\.env/,
];

// ─────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────
async function packageExtension() {
  const version = process.argv[2];
  if (!version) {
    console.error('Usage: node scripts/package-extension.js <version>');
    console.error('Example: node scripts/package-extension.js v1.0.0');
    process.exit(1);
  }

  // Validate dist exists
  if (!existsSync(DIST_DIR)) {
    console.error(`❌ dist/ directory not found at: ${DIST_DIR}`);
    console.error('   Run `npm run build` in the extension/ directory first.');
    process.exit(1);
  }

  const zipName = `CP-Vault-${version}.zip`;
  const zipPath = join(ROOT, zipName);

  console.log(`\n📦 Packaging CP Vault ${version}...`);
  console.log(`   Source: ${DIST_DIR}`);
  console.log(`   Output: ${zipPath}\n`);

  const output = createWriteStream(zipPath);
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Maximum compression
  });

  // Collect statistics
  let fileCount = 0;

  archive.on('entry', (entry) => {
    fileCount++;
    console.log(`  + ${entry.name}`);
  });

  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn('⚠️  Warning:', err.message);
    } else {
      throw err;
    }
  });

  archive.on('error', (err) => {
    console.error('❌ Archiver error:', err.message);
    process.exit(1);
  });

  const closePromise = new Promise((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
  });

  archive.pipe(output);

  // Add all files from dist/ with filtering
  addDirectory(archive, DIST_DIR, '');

  await archive.finalize();
  await closePromise;

  const bytes = archive.pointer();
  const kb = (bytes / 1024).toFixed(1);

  console.log(`\n✅ Package created successfully!`);
  console.log(`   Files: ${fileCount}`);
  console.log(`   Size:  ${kb} KB (${bytes.toLocaleString()} bytes)`);
  console.log(`   Path:  ${zipPath}`);
}

/**
 * Recursively add a directory to the archive, excluding unwanted files.
 */
function addDirectory(archive, dirPath, archivePath) {
  const entries = readdirSync(dirPath);

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const archiveEntry = archivePath ? `${archivePath}/${entry}` : entry;

    // Check exclusion patterns
    if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(fullPath))) {
      console.log(`  ✗ Excluded: ${archiveEntry}`);
      continue;
    }

    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      addDirectory(archive, fullPath, archiveEntry);
    } else {
      archive.file(fullPath, { name: archiveEntry });
    }
  }
}

packageExtension().catch((err) => {
  console.error('❌ Packaging failed:', err.message);
  process.exit(1);
});
