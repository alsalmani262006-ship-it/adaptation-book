// يلتقط صورة معاينة حقيقية من كل لعبة ويحفظها في book/assets/previews (تظهر في صفحات الأنشطة)
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './serve.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'book', 'assets', 'previews');
mkdirSync(out, { recursive: true });

// خطوات تجعل المعاينة تعرض اللعبة أثناء اللعب
const warmup = {
  1: async p => { await p.click('.flip >> nth=0'); await p.click('.flip >> nth=1'); },
  2: async p => { await p.evaluate(() => GameTest.correct()); },
  4: async p => { await p.evaluate(() => { GameTest.correct(); }); await p.waitForTimeout(300); await p.evaluate(() => GameTest.correct()); },
  5: async p => { await p.evaluate(() => { GameTest.correct(); GameTest.correct(); }); },
  6: async p => { await p.evaluate(() => GameTest.correct()); await p.waitForTimeout(400); await p.click('.part >> nth=0'); },
  7: async p => { await p.evaluate(() => { GameTest.correct(); GameTest.correct(); }); await p.click('.name:not([data-done]) >> nth=0'); },
  8: async p => { await p.evaluate(() => GameTest.correct()); await p.waitForTimeout(500); },
  9: async p => { await p.evaluate(() => GameTest.correct()); await p.waitForTimeout(800); await p.evaluate(() => GameTest.correct()); await p.waitForTimeout(800); },
  10: async p => { await p.evaluate(() => GameTest.correct()); await p.waitForTimeout(300); await p.click('.mcard:not([data-done]) >> nth=0'); },
  11: async p => { await p.waitForTimeout(3200); },
  12: async p => { await p.evaluate(() => { GameTest.correct(); GameTest.correct(); GameTest.correct(); }); await p.click('.clues li >> nth=4'); },
  13: async p => { await p.click('#spin'); await p.waitForTimeout(3600); },
  14: async p => { await p.fill('#name', 'المها العربي'); },
  15: async p => { await p.click('.choice >> nth=0'); }
};

const PORT = 8770;
const server = await startServer(PORT);
const browser = await chromium.launch({ channel: process.env.BROWSER || 'msedge' });
for (let n = 1; n <= 15; n++) {
  const slug = 'game-' + String(n).padStart(2, '0');
  const ctx = await browser.newContext({ viewport: { width: 1000, height: 610 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${PORT}/games/${slug}/`);
  await page.click('[data-act=start]');
  await page.waitForTimeout(300);
  if (warmup[n]) await warmup[n](page);
  await page.waitForTimeout(350);
  await page.screenshot({ path: join(out, slug + '.jpg'), type: 'jpeg', quality: 78 });
  console.log('✓', slug);
  await ctx.close();
}
await browser.close();
server.closeAllConnections(); server.close();
