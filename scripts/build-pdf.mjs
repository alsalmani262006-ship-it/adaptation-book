// يصدّر الكتاب إلى PDF من ٢٠ صفحة A4: dist/pdf/adaptation-book.pdf
// يشترط وجود روابط النشر الحقيقية في qr/qr-data.js (تُولَّد بـ npm run qr -- <الرابط>).
// للمسودة المحلية فقط: npm run pdf -- --draft  (تُحفظ باسم مختلف وروابطها محلية)
import { chromium } from 'playwright-core';
import { mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './serve.mjs';

const draft = process.argv.includes('--draft');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'dist', 'pdf');
const out = join(outDir, draft ? 'adaptation-book-DRAFT.pdf' : 'adaptation-book.pdf');
mkdirSync(outDir, { recursive: true });

const PORT = 8771;
const server = await startServer(PORT);
const browser = await chromium.launch({ channel: process.env.BROWSER || 'msedge' });
const page = await browser.newPage();
await page.goto(`http://localhost:${PORT}/book/index.html`, { waitUntil: 'networkidle' });
const qr = await page.evaluate(() => window.QR_DATA);
if (!qr && !draft) {
  await browser.close(); server.closeAllConnections(); server.close();
  console.error('✘ لا توجد روابط نشر حقيقية بعد (qr/qr-data.js فارغ).\n  انشر الكتاب أولًا ثم شغّل: npm run qr -- <الرابط>  ثم  npm run pdf\n  (أو npm run pdf -- --draft لمسودة محلية روابطها لا تصلح للتسليم)');
  process.exit(1);
}
await page.emulateMedia({ media: 'print' });
await page.evaluate(async () => {
  await document.fonts.ready;
  const imgs = [...document.querySelectorAll('#print-root img')];
  imgs.forEach(i => { i.loading = 'eager'; });
  await Promise.race([Promise.all(imgs.map(i => i.decode().catch(() => 0))), new Promise(r => setTimeout(r, 15000))]);
});
await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await browser.close();
server.closeAllConnections(); server.close();

// التحقق: عدد الصفحات والروابط داخل الملف
const pdf = readFileSync(out, 'latin1');
const pages = (pdf.match(/\/Type\s*\/Page[^s]/g) || []).length;
const uris = [...pdf.matchAll(/\/URI\s*\(([^)]*)\)/g)].map(m => m[1]);
const bad = uris.filter(u => /localhost|127\.0\.0\.1|file:/i.test(u));
console.log(`✓ ${out}\n  عدد الصفحات: ${pages}\n  عدد الروابط: ${uris.length}`);
if (pages !== 20) { console.error('✘ عدد الصفحات ليس ٢٠'); process.exit(1); }
if (!draft) {
  if (bad.length) { console.error('✘ روابط محلية داخل PDF:\n  ' + bad.join('\n  ')); process.exit(1); }
  const expected = Object.values(qr.games).map(g => g.url);
  const missing = expected.filter(u => !uris.includes(u));
  if (missing.length) { console.error('✘ روابط ألعاب غير موجودة في PDF:\n  ' + missing.join('\n  ')); process.exit(1); }
  console.log('  ✓ جميع روابط «افتح اللعبة» تشير إلى الروابط المنشورة:');
  [...new Set(uris)].forEach(u => console.log('   ', u));
}
