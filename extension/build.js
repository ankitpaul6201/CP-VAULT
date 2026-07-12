import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

const __dirname = resolve();

async function runBuilds() {
  console.log('Building popup and settings UI...');
  await build({
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'index.html'),
          settings: resolve(__dirname, 'settings.html'),
          welcome: resolve(__dirname, 'welcome.html'),
        },
      },
    },
  });

  console.log('Building background service worker (self-contained)...');
  await build({
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      rollupOptions: {
        input: resolve(__dirname, 'src/background/index.ts'),
        output: {
          entryFileNames: 'background.js',
          format: 'es',
        },
      },
    },
  });

  console.log('Building content script (self-contained)...');
  await build({
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      rollupOptions: {
        input: resolve(__dirname, 'src/content/index.ts'),
        output: {
          entryFileNames: 'content.js',
          format: 'es',
        },
      },
    },
  });

  console.log('Building interceptor script (self-contained)...');
  await build({
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      rollupOptions: {
        input: resolve(__dirname, 'src/content/interceptor.ts'),
        output: {
          entryFileNames: 'interceptor.js',
          format: 'iife',
        },
      },
    },
  });

  console.log('Copying manifest and assets to dist...');
  fs.copyFileSync('manifest.json', 'dist/manifest.json');
  
  const distAssetsDir = resolve(__dirname, 'dist/assets');
  if (!fs.existsSync(distAssetsDir)) {
    fs.mkdirSync(distAssetsDir, { recursive: true });
  }

  const srcAssetsDir = resolve(__dirname, 'src/assets');
  const files = fs.readdirSync(srcAssetsDir);
  for (const file of files) {
    if (file.endsWith('.png')) {
      fs.copyFileSync(resolve(srcAssetsDir, file), resolve(distAssetsDir, file));
    }
  }

  console.log('CP Vault Extension Build Completed Successfully!');
}

runBuilds().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
