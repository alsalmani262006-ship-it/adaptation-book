// يولّد رموز QR للألعاب الخمس عشرة وللكتاب من رابط النشر الحقيقي.
// الاستخدام (بعد النشر فقط):  npm run qr -- https://<اسم-المستخدم>.github.io/<اسم-المستودع>/
import QRCode from 'qrcode';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let base = process.argv[2];
if (!base || !/^https:\/\/[^\s]+$/.test(base)) {
  console.error('✘ أدخل رابط النشر الحقيقي (يبدأ بـ https://)، مثل:\n  npm run qr -- https://username.github.io/adaptation-book/');
  process.exit(1);
}
if (!base.endsWith('/')) base += '/';

const outDir = join(root, 'qr');
mkdirSync(outDir, { recursive: true });
const opts = { type: 'svg', margin: 2, errorCorrectionLevel: 'M', color: { dark: '#1d2a3a', light: '#ffffff' } };

const data = { base, generated: new Date().toISOString(), book: null, games: {} };
const bookUrl = base + 'book/index.html';
writeFileSync(join(outDir, 'book.svg'), await QRCode.toString(bookUrl, opts));
data.book = { url: bookUrl, svg: 'qr/book.svg' };

for (let n = 1; n <= 15; n++) {
  const slug = 'game-' + String(n).padStart(2, '0');
  const url = `${base}games/${slug}/`;
  writeFileSync(join(outDir, slug + '.svg'), await QRCode.toString(url, opts));
  data.games[n] = { url, svg: `qr/${slug}.svg` };
  console.log('✓', slug, url);
}

writeFileSync(join(outDir, 'qr-data.js'),
  `// مولَّد تلقائيًا بواسطة scripts/build-qr.mjs — لا تعدّله يدويًا\nwindow.QR_DATA = ${JSON.stringify(data, null, 2)};\n`);
console.log(`\n✓ حُدّث qr/qr-data.js — ستظهر الرموز في صفحات الأنشطة. أعد تصدير PDF: npm run pdf`);
