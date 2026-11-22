// اختبار آلي للكتاب والألعاب في متصفح حقيقي (Edge أو Chrome المثبّت على الجهاز)
// الاستخدام: node scripts/test.mjs [--shots <مجلد>] [--only 3,4] [--book] [--base https://…/]  (--base يختبر النسخة المنشورة)
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { startServer } from './serve.mjs';

const args = process.argv.slice(2);
const shots = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : null;
const bookOnly = args.includes('--book');
const only = bookOnly ? [] : args.includes('--only') ? args[args.indexOf('--only') + 1].split(',').map(Number) : null;
if (shots) mkdirSync(shots, { recursive: true });

const remote = args.includes('--base') ? args[args.indexOf('--base') + 1].replace(/\/$/, '') : null;
const PORT = 8765;
const server = remote ? null : await startServer(PORT);
const base = remote || `http://localhost:${PORT}`;
console.log('الاختبار على: ' + base);
const browser = await chromium.launch({ channel: process.env.BROWSER || 'msedge' }).catch(() => chromium.launch({ channel: 'chrome' }));

let failures = 0;
const results = [];
const check = (cond, msg) => { if (!cond) { failures++; console.log('   ✘', msg); } return cond; };

async function openPage(url, viewport = { width: 1280, height: 860 }) {
  const ctx = await browser.newContext({ viewport, locale: 'ar' });
  await ctx.addInitScript(() => { window.__FAST = true; });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => errors.push('فشل تحميل: ' + r.url()));
  await page.goto(url);
  return { ctx, page, errors };
}
const state = page => page.evaluate(() => ({ ...Kit.current.state }));

// ---------------- الألعاب ----------------
for (let n = 1; n <= 15; n++) {
  if (only && !only.includes(n)) continue;
  const slug = 'game-' + String(n).padStart(2, '0');
  console.log(`• النشاط ${n} (${slug})`);
  const url = `${base}/games/${slug}/`;
  let ok = true;

  // ١) إجابة خاطئة ثم صحيحة
  let { ctx, page, errors } = await openPage(url);
  await page.click('[data-act=start]');
  const s0 = await state(page);
  await page.evaluate(() => GameTest.wrong());
  await page.waitForTimeout(150);
  const s1 = await state(page);
  ok &= check(s1.wrong === s0.wrong + 1, `الإجابة الخاطئة لم تُسجَّل (wrong ${s0.wrong}→${s1.wrong})`);
  ok &= check(s1.score === s0.score, `الإجابة الخاطئة غيّرت النقاط (${s0.score}→${s1.score})`);
  await page.evaluate(() => GameTest.correct());
  await page.waitForTimeout(150);
  const s2 = await state(page);
  ok &= check(s2.correct === s1.correct + 1, `الإجابة الصحيحة لم تُسجَّل (correct ${s1.correct}→${s2.correct})`);
  ok &= check(await page.locator('.g-toast').count() > 0 || n === 14, 'لا تظهر رسالة تصحيح فوري');
  ok &= check(errors.length === 0, 'أخطاء: ' + errors.join(' | '));
  await ctx.close();

  // ٢) حلّ اللعبة كاملة دون أخطاء → شاشة النهاية بالدرجة الكاملة
  ({ ctx, page, errors } = await openPage(url));
  await page.click('[data-act=start]');
  await page.evaluate(() => GameTest.solve());
  const fin = await page.waitForSelector('#g-finish', { timeout: 20000 }).catch(() => null);
  ok &= check(!!fin, 'لم تظهر شاشة النهاية بعد حلّ اللعبة');
  const s3 = await state(page);
  ok &= check(s3.score === s3.max && s3.max > 0, `الدرجة عند الحل الكامل ${s3.score} من ${s3.max}`);
  ok &= check(errors.length === 0, 'أخطاء: ' + errors.join(' | '));
  await ctx.close();

  // ٣) عرض الهاتف: لا تمرير أفقي
  ({ ctx, page, errors } = await openPage(url, { width: 390, height: 800 }));
  await page.click('[data-act=start]');
  await page.waitForTimeout(250);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  ok &= check(overflow <= 1, `تمرير أفقي على الهاتف بمقدار ${overflow}px`);
  if (shots) await page.screenshot({ path: `${shots}/${slug}-mobile.png` });
  await ctx.close();

  if (shots) {
    ({ ctx, page } = await openPage(url));
    await page.click('[data-act=start]');
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${shots}/${slug}.png` });
    await ctx.close();
  }
  results.push([n, !!ok]);
  console.log(ok ? '   ✔ يعمل' : '   ✘ فشل');
}

// سحب حقيقي بالفأرة في النشاط ٢
if (!only || only.includes(2)) {
  console.log('• سحب وإفلات حقيقي بالفأرة (النشاط ٢)');
  const { ctx, page, errors } = await openPage(`${base}/games/game-02/`);
  await page.click('[data-act=start]');
  const tok = page.locator('.token[data-id="fish"]');
  const zone = page.locator('.zone[data-id="water"]');
  const a = await tok.boundingBox(), b = await zone.boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(150);
  const s = await state(page);
  check(s.correct === 1 && s.score === 1, `السحب بالفأرة لم يُحتسب (${JSON.stringify(s)})`);
  check(await page.locator('.zone[data-id="water"] .token[data-id="fish"]').count() === 1, 'العنصر لم يستقر في الموطن');
  check(errors.length === 0, 'أخطاء: ' + errors.join(' | '));
  await ctx.close();
}

// ---------------- الكتاب ----------------
if (!only || bookOnly) {
  console.log('• الكتاب: الصفحات العشرون');
  for (const vp of [{ width: 1440, height: 900, name: 'desktop' }, { width: 390, height: 820, name: 'mobile' }]) {
    const { ctx, page, errors } = await openPage(`${base}/book/index.html`, vp);
    await page.waitForSelector('.page');
    const total = await page.evaluate(() => BOOK.total);
    check(total === 20, `عدد الصفحات ${total} وليس ٢٠`);
    for (let p = 1; p <= 20; p++) {
      await page.evaluate(n => BOOK.go(n, true), p);
      await page.waitForTimeout(60);
      const info = await page.evaluate(n => {
        const el = document.querySelector(`.slot .page[data-p="${n}"]`);
        if (!el) return { missing: true };
        const inner = el.querySelector('.pg');
        return { overflow: inner.scrollHeight - inner.clientHeight, text: el.innerText.length };
      }, p);
      check(!info.missing, `[${vp.name}] الصفحة ${p} غير معروضة`);
      check(info.overflow <= 2, `[${vp.name}] محتوى الصفحة ${p} يتجاوز حدودها بمقدار ${info.overflow}px`);
      if (shots && (vp.name === 'desktop')) await page.screenshot({ path: `${shots}/book-${String(p).padStart(2, '0')}.png` });
    }
    if (shots && vp.name === 'mobile') { await page.evaluate(() => BOOK.go(4, true)); await page.waitForTimeout(80); await page.screenshot({ path: `${shots}/book-mobile-04.png` }); }
    // التنقل بالأزرار مع حركة التقليب
    await page.evaluate(() => BOOK.go(1, true));
    await page.click('#next'); await page.waitForTimeout(1100);
    const cur = await page.evaluate(() => BOOK.current);
    check(cur >= 2, `[${vp.name}] زر «التالي» لا يعمل (الصفحة ${cur})`);
    await page.click('#prev'); await page.waitForTimeout(1100);
    check(await page.evaluate(() => BOOK.current) === 1, `[${vp.name}] زر «السابق» لا يعمل`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(overflow <= 1, `[${vp.name}] تمرير أفقي في الكتاب ${overflow}px`);
    // روابط الأنشطة تشير إلى ألعاب موجودة
    const links = await page.evaluate(() => GAMES.map(g => BOOK.gameUrl(g)));
    for (const l of links) {
      const r = await page.request.get(new URL(l, page.url()).href);
      check(r.ok(), `رابط لعبة لا يعمل: ${l}`);
    }
    check(errors.length === 0, `[${vp.name}] أخطاء: ` + errors.join(' | '));
    await ctx.close();
  }
}

await browser.close();
if (server) { server.closeAllConnections(); server.close(); }
console.log('\n' + (failures ? `✘ ${failures} مشكلة` : '✔ نجحت جميع الاختبارات'));
if (results.length) console.log(`الألعاب العاملة: ${results.filter(r => r[1]).length} من ${results.length}`);
process.exit(failures ? 1 : 0);
