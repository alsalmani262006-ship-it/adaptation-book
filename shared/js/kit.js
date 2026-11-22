/*
 * محرّك الألعاب المشترك: الشريط العلوي، النقاط، التصحيح الفوري، الأصوات، الاحتفال، السحب والإفلات.
 * الاستخدام: const K = Kit.init(n, { max, onStart });
 */
(function () {
  const digits = '٠١٢٣٤٥٦٧٨٩';
  const num = n => String(n).replace(/\d/g, d => digits[d]);
  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (a, n) => shuffle(a).slice(0, n);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* التخزين غير متاح */ } }
  };

  // ---------- الأصوات (WebAudio دون ملفات) ----------
  let ctx = null, muted = store.get('adapt-muted', false);
  function tone(freq, dur, type = 'sine', delay = 0, vol = .18) {
    if (muted) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + dur);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + .05);
    } catch { /* الصوت غير مدعوم */ }
  }
  const sound = {
    ok() { tone(660, .15, 'triangle'); tone(990, .22, 'triangle', .1); },
    bad() { tone(220, .25, 'sawtooth', 0, .08); tone(170, .3, 'sawtooth', .12, .08); },
    pop() { tone(900, .08, 'square', 0, .07); },
    flip() { tone(500, .06, 'triangle', 0, .08); },
    win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, .3, 'triangle', i * .13)); }
  };

  // ---------- الاحتفال ----------
  function confetti(amount = 140) {
    let c = $('#g-confetti');
    if (!c) { c = document.createElement('canvas'); c.id = 'g-confetti'; document.body.appendChild(c); }
    const x = c.getContext('2d'), W = c.width = innerWidth, H = c.height = innerHeight;
    const colors = ['#7b4fc9', '#1f8fd6', '#e8892b', '#3aa856', '#ff5d8f', '#ffc93c'];
    const ps = Array.from({ length: amount }, () => ({ x: W / 2 + (Math.random() - .5) * W * .4, y: H * .35, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4, s: 6 + Math.random() * 7, r: Math.random() * 6, c: colors[Math.random() * 6 | 0] }));
    let f = 0;
    (function loop() {
      x.clearRect(0, 0, W, H);
      ps.forEach(p => { p.vy += .35; p.x += p.vx; p.y += p.vy; p.r += .2; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); });
      if (++f < 160) requestAnimationFrame(loop); else x.clearRect(0, 0, W, H);
    })();
  }

  function toast(msg, type = 'info') {
    document.querySelectorAll('.g-toast').forEach(t => t.remove());
    const t = el(`<div class="g-toast ${type}" role="status"></div>`); t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 1900);
  }

  const praise = ['أحسنت!', 'رائع!', 'إجابة صحيحة!', 'ممتاز!', 'عمل جميل!', 'استمر هكذا!'];
  const retry = ['حاول مرة أخرى', 'قريب! فكّر مجددًا', 'ليست هذه، حاول ثانية'];
  const pick = a => a[Math.random() * a.length | 0];

  // ---------- السحب والإفلات (فأرة ولمس ونقر) ----------
  // items: عناصر قابلة للسحب، targets: دالة تُرجع أهداف الإفلات، onDrop(item, target) → true للقبول
  function dragDrop({ items, targets, onDrop, tapTargets = true }) {
    let selected = null;
    const getTargets = () => (typeof targets === 'function' ? targets() : targets);
    const targetAt = (x, y) => document.elementsFromPoint(x, y).map(n => n.closest('[data-drop]')).find(Boolean);
    const select = it => { if (selected) selected.classList.remove('is-sel'); selected = it; if (it) it.classList.add('is-sel'); };

    items.forEach(item => {
      item.classList.add('draggable');
      item.addEventListener('pointerdown', e => {
        if (item.dataset.done) return;
        e.preventDefault();
        const sx = e.clientX, sy = e.clientY; let ghost = null, over = null;
        const move = ev => {
          if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) {
            const r = item.getBoundingClientRect();
            ghost = item.cloneNode(true); ghost.classList.add('drag-ghost'); ghost.style.width = r.width + 'px';
            document.body.appendChild(ghost); item.style.opacity = '.35';
          }
          if (ghost) {
            ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px';
            const t = targetAt(ev.clientX, ev.clientY);
            if (t !== over) { over && over.classList.remove('drop-hover'); over = t; over && over.classList.add('drop-hover'); }
          }
        };
        const up = ev => {
          removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
          over && over.classList.remove('drop-hover');
          if (ghost) {
            ghost.remove(); item.style.opacity = '';
            const t = targetAt(ev.clientX, ev.clientY);
            if (t && getTargets().includes(t)) onDrop(item, t); else select(null);
          } else {
            select(selected === item ? null : item); // نقر: تحديد العنصر
          }
        };
        addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
      });
    });
    if (tapTargets) getTargets().forEach(t => t.addEventListener('click', () => { if (selected) { const it = selected; select(null); onDrop(it, t); } }));
    return { clear: () => select(null) };
  }

  // ---------- تهيئة اللعبة ----------
  function init(n, opts = {}) {
    const g = window.GAMES.find(x => x.n === n);
    const book = `../../book/index.html#p=${g.page}`;
    document.documentElement.style.setProperty('--theme', g.color);
    document.documentElement.style.setProperty('--theme-soft', g.soft);
    document.body.classList.add('game');
    document.title = `${g.title} | التكيّف لدى الكائنات الحية`;

    const state = { score: 0, max: opts.max || 0, correct: 0, wrong: 0, finished: false, started: false };
    const bar = el(`<header class="g-bar">
      <a class="g-back" href="${book}" title="العودة إلى الكتاب">📖 <span>الكتاب</span></a>
      <h1 class="g-title">${g.icon} ${g.title}<small>النشاط ${num(n)} · ${g.kind}</small></h1>
      <span class="g-score" aria-live="polite" title="النقاط">⭐ <b>${num(0)}</b></span>
      <button class="g-icon" data-act="sound" title="الصوت" aria-label="تشغيل الصوت أو إيقافه">${muted ? '🔇' : '🔊'}</button>
      <button class="g-icon" data-act="help" title="التعليمات" aria-label="التعليمات">❓</button>
      <button class="g-icon" data-act="restart" title="إعادة اللعبة" aria-label="إعادة اللعبة">↻</button>
    </header>`);
    document.body.prepend(bar);
    const scoreEl = $('.g-score', bar);

    function showIntro() {
      const o = el(`<div class="g-overlay" id="g-intro"><div class="g-modal" role="dialog" aria-modal="true" aria-labelledby="g-intro-h">
        <div class="g-badge">${g.icon}</div>
        <h2 id="g-intro-h">${g.title}</h2>
        <p class="goal">🎯 ${g.goal}</p>
        <ol>${g.howto.map(h => `<li>${h}</li>`).join('')}</ol>
        <div class="row"><button class="btn" data-act="start">${state.started ? 'متابعة' : 'ابدأ اللعب'} ▶</button></div>
      </div></div>`);
      document.body.appendChild(o);
      $('[data-act=start]', o).focus();
      $('[data-act=start]', o).onclick = () => {
        o.remove();
        if (!state.started) { state.started = true; tone(1, .01); opts.onStart && opts.onStart(); }
      };
    }

    bar.addEventListener('click', e => {
      const a = e.target.closest('[data-act]'); if (!a) return;
      if (a.dataset.act === 'sound') { muted = !muted; store.set('adapt-muted', muted); a.textContent = muted ? '🔇' : '🔊'; }
      if (a.dataset.act === 'help') showIntro();
      if (a.dataset.act === 'restart') location.reload();
    });

    const K = {
      game: g, state, num, el, $, shuffle, sample, wait, store, sound, confetti, toast, dragDrop,
      t: ms => (window.__FAST ? 15 : ms), // تسريع المؤقّتات أثناء الاختبار الآلي فقط
      add(points = 1) {
        state.score += points; scoreEl.querySelector('b').textContent = num(state.score);
        scoreEl.classList.remove('bump'); void scoreEl.offsetWidth; scoreEl.classList.add('bump');
      },
      // تصحيح فوري
      ok(target, msg, points = 1) {
        state.correct++; if (points) K.add(points); sound.ok();
        if (target) { target.classList.remove('is-bad'); target.classList.add('is-ok'); }
        toast(msg || pick(praise), 'ok');
      },
      bad(target, msg) {
        state.wrong++; sound.bad();
        if (target) { target.classList.remove('is-bad'); void target.offsetWidth; target.classList.add('is-bad'); setTimeout(() => target.classList.remove('is-bad'), 600); }
        toast(msg || pick(retry), 'bad');
      },
      progress(done, total) {
        let p = $('.g-progress'); if (!p) return;
        p.firstElementChild.style.width = (100 * done / total) + '%';
      },
      finish({ title, text, extra = '' } = {}) {
        if (state.finished) return; state.finished = true;
        const max = state.max || state.score || 1, ratio = state.score / max;
        const stars = ratio >= .9 ? 3 : ratio >= .6 ? 2 : 1;
        const best = Math.max(store.get('adapt-best-' + n, 0), state.score); store.set('adapt-best-' + n, best);
        sound.win(); confetti();
        const o = el(`<div class="g-overlay" id="g-finish"><div class="g-modal" role="dialog" aria-modal="true">
          <div class="stars" aria-label="${num(stars)} من ٣ نجوم">${[1, 2, 3].map(i => `<span class="${i > stars ? 'off' : ''}">⭐</span>`).join('')}</div>
          <h2>${title || (stars === 3 ? 'أداء رائع!' : stars === 2 ? 'أحسنت!' : 'محاولة جيدة!')}</h2>
          <p style="font-size:1.25rem;font-weight:800;margin:6px 0">النقاط: ${num(state.score)}${state.max ? ' من ' + num(state.max) : ''}</p>
          ${text ? `<p>${text}</p>` : ''}
          <p style="color:var(--ink-soft);margin:0 0 14px">أفضل نتيجة لك: ${num(best)}</p>
          ${extra}
          <div class="row"><button class="btn" data-act="again">↻ العب مرة أخرى</button><a class="btn secondary" href="${book}">📖 العودة إلى الكتاب</a></div>
        </div></div>`);
        document.body.appendChild(o);
        $('[data-act=again]', o).onclick = () => location.reload();
        return o;
      }
    };

    if (opts.autoIntro !== false) showIntro();
    window.Kit.current = K;
    return K;
  }

  window.Kit = { init, num, el, $, shuffle, sample, wait, store, sound, confetti, toast, dragDrop };
})();
