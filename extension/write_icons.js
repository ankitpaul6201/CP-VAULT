import fs from 'fs';
import path from 'path';

const assetsDir = path.resolve('src/assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// A tiny valid 1x1 black PNG base64 representation.
// Since Chrome only checks for valid image decodability, we can write a small valid PNG.
// For a beautiful look, we'll write a simple 8x8 colored PNG that scales nicely or a 1x1 PNG.
const tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const imageBuffer = Buffer.from(tinyPngBase64, 'base64');

['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png'].forEach(filename => {
  fs.writeFileSync(path.join(assetsDir, filename), imageBuffer);
  console.log(`Created asset: ${filename}`);
});
