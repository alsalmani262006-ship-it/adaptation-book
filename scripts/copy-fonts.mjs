// ينسخ ملفات خط Cairo (العربية واللاتينية) من node_modules إلى shared/fonts
import { copyFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', '@fontsource', 'cairo', 'files');
const dest = join(root, 'shared', 'fonts');
mkdirSync(dest, { recursive: true });

for (const subset of ['arabic', 'latin']) {
  for (const weight of [400, 600, 700, 800, 900]) {
    const name = `cairo-${subset}-${weight}-normal.woff2`;
    copyFileSync(join(src, name), join(dest, name));
    console.log('✓', name);
  }
}
