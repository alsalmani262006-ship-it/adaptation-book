/*
 * عارض الكتاب: صفحتان متقابلتان على الشاشات العريضة وصفحة واحدة على الهاتف،
 * مع تقليب ثلاثي الأبعاد للصفحات (اتجاه الكتاب العربي: من اليسار إلى اليمين).
 */
(function () {
  const W = 600, H = 848, TOTAL = PAGES.total, DUR = 900;
  const $ = s => document.querySelector(s);
  const stage = $('#stage'), wrap = $('#bookwrap'), book = $('#book');
  const num = PAGES.num;
  let mode = null, current = 1, busy = false, zoom = false, scale = 1;

  // في الكتاب العربي: الصفحة ١ وحدها يسارًا، ثم [٢ يمين، ٣ يسار]… ثم ٢٠ وحدها يمينًا
  const spreadOf = p => (p === 1 ? 0 : Math.floor(p / 2));
  const spreadPages = s => (s === 0 ? { right: null, left: 1 } : { right: 2 * s, left: 2 * s + 1 <= TOTAL ? 2 * s + 1 : null });
  const lastSpread = spreadOf(TOTAL);

  function pageEl(n) { return n ? PAGES.render(n) : null; }
  function fill(slot, n) {
    slot.innerHTML = '';
    slot.classList.toggle('empty', !n);
    if (n) slot.appendChild(pageEl(n));
  }
  const slots = () => ({ right: book.querySelector('.slot.right'), left: book.querySelector('.slot.left'), single: book.querySelector('.slot.single') });

  // ---------- التخطيط والمقياس ----------
  function layout() {
    const r = stage.getBoundingClientRect();
    const navW = innerWidth < 700 ? 0 : 140;
    const availW = r.width - navW - 24, availH = r.height - 24;
    const wantSpread = availW / availH > 1.05 && availW >= 760;
    const newMode = wantSpread ? 'spread' : 'single';
    if (newMode !== mode) { mode = newMode; build(); }
    const cols = mode === 'spread' ? 2 : 1;
    const fit = Math.min(availW / (cols * W), availH / H);
    scale = zoom ? Math.max(fit * 1.6, (r.width - 24) / (cols * W)) : fit;
    book.style.width = cols * W + 'px'; book.style.height = H + 'px';
    book.style.transform = `scale(${scale})`;
    wrap.style.width = cols * W * scale + 'px'; wrap.style.height = H * scale + 'px';
    stage.classList.toggle('zoomed', zoom);
    shift(false);
  }

  function build() {
    book.className = 'book ' + mode;
    book.innerHTML = mode === 'spread'
      ? '<div class="slot right"></div><div class="slot left"></div><div class="spine" aria-hidden="true"></div>'
      : '<div class="slot single"></div>';
    show(current);
  }

  // توسيط الصفحة المفردة (الغلاف والصفحة الأخيرة) في وضع الصفحتين
  function shift(animate = true, s = spreadOf(current)) {
    let x = 0;
    if (mode === 'spread') { const sp = spreadPages(s); if (!sp.right) x = W / 2; else if (!sp.left) x = -W / 2; }
    book.style.transition = animate ? `transform ${DUR}ms cubic-bezier(.45,.05,.25,1)` : 'none';
    book.style.transform = `scale(${scale}) translateX(${x}px)`;
  }

  function show(p) {
    current = p;
    const s = slots();
    if (mode === 'spread') { const sp = spreadPages(spreadOf(p)); fill(s.right, sp.right); fill(s.left, sp.left); }
    else fill(s.single, p);
    updateUI();
  }

  function visible() {
    if (mode === 'spread') { const sp = spreadPages(spreadOf(current)); return [sp.right, sp.left].filter(Boolean); }
    return [current];
  }

  function updateUI() {
    const v = visible();
    $('#pageinfo').textContent = v.length > 1 ? `${num(v[0])}–${num(v[1])} / ${num(TOTAL)}` : `${num(v[0])} / ${num(TOTAL)}`;
    $('#pagetitle').textContent = PAGES.titles[v[0] - 1];
    $('#prev').disabled = mode === 'spread' ? spreadOf(current) === 0 : current === 1;
    $('#next').disabled = mode === 'spread' ? spreadOf(current) === lastSpread : current === TOTAL;
    document.querySelectorAll('.toc a').forEach(a => a.classList.toggle('on', v.includes(+a.dataset.p)));
    const h = '#p=' + current;
    if (location.hash !== h) history.replaceState(null, '', h);
  }

  // ---------- التقليب ----------
  function face(n, side) {
    const f = document.createElement('div');
    f.className = 'face ' + side;
    if (n) f.appendChild(pageEl(n)); else f.classList.add('blank');
    const sh = document.createElement('div'); sh.className = 'shade'; f.appendChild(sh);
    return f;
  }

  function leafAnim(leaf, from, to, origin) {
    leaf.style.transformOrigin = origin;
    const shades = leaf.querySelectorAll('.shade');
    shades.forEach(s => s.animate([{ opacity: 0 }, { opacity: .45 }, { opacity: 0 }], { duration: DUR, easing: 'ease-in-out' }));
    return leaf.animate([{ transform: `rotateY(${from}deg)` }, { transform: `rotateY(${(from + to) / 2}deg) translateZ(30px)` }, { transform: `rotateY(${to}deg)` }],
      { duration: DUR, easing: 'cubic-bezier(.45,.05,.25,1)' }).finished;
  }

  async function flip(dir) {
    if (busy) return;
    const s = slots();
    if (mode === 'spread') {
      const cs = spreadOf(current), ns = cs + dir;
      if (ns < 0 || ns > lastSpread) return;
      busy = true; paperSound();
      const a = spreadPages(cs), b = spreadPages(ns);
      const leaf = document.createElement('div'); leaf.className = 'leaf';
      if (dir > 0) {
        // تُقلب الصفحة اليسرى نحو اليمين، وظهرها هو الصفحة اليمنى التالية
        leaf.classList.add('on-left');
        leaf.append(face(a.left, 'front'), face(b.right, 'back'));
        book.appendChild(leaf); fill(s.left, b.left);
        shift(true, ns);
        await leafAnim(leaf, 0, 180, 'right center');
        fill(s.right, b.right);
      } else {
        leaf.classList.add('on-right');
        leaf.append(face(a.right, 'front'), face(b.left, 'back'));
        book.appendChild(leaf); fill(s.right, b.right);
        shift(true, ns);
        await leafAnim(leaf, 0, -180, 'left center');
        fill(s.left, b.left);
      }
      leaf.remove();
      current = b.right || b.left;
    } else {
      const np = current + dir;
      if (np < 1 || np > TOTAL) return;
      busy = true; paperSound();
      const leaf = document.createElement('div'); leaf.className = 'leaf on-single';
      if (dir > 0) {
        leaf.append(face(current, 'front'), face(null, 'back'));
        book.appendChild(leaf); fill(s.single, np);
        await leafAnim(leaf, 0, 180, 'right center');
      } else {
        leaf.append(face(np, 'front'), face(null, 'back'));
        book.appendChild(leaf);
        await leafAnim(leaf, 180, 0, 'right center');
        fill(s.single, np);
      }
      leaf.remove();
      current = np;
    }
    busy = false;
    updateUI();
  }

  function go(p, instant) {
    p = Math.max(1, Math.min(TOTAL, p | 0));
    const same = mode === 'spread' ? spreadOf(p) === spreadOf(current) : p === current;
    if (same) { current = p; updateUI(); return; }
    const forward = p > current;
    const adjacent = mode === 'spread' ? Math.abs(spreadOf(p) - spreadOf(current)) === 1 : Math.abs(p - current) === 1;
    if (!instant && adjacent) { flip(forward ? 1 : -1); return; }
    show(p); shift(false);
  }

  // صوت ورق خفيف (ضجيج مُرشَّح) دون ملفات صوتية
  let actx = null;
  function paperSound() {
    if (localStorage.getItem('adapt-muted') === 'true') return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const len = actx.sampleRate * .35, buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2) * Math.sin(Math.PI * i / len);
      const src = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
      f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = .7; g.gain.value = .25;
      src.buffer = buf; src.connect(f).connect(g).connect(actx.destination); src.start();
    } catch { /* الصوت غير مدعوم */ }
  }

  // ---------- عناصر التحكم ----------
  $('#next').onclick = () => flip(1);
  $('#prev').onclick = () => flip(-1);
  $('#zoom').onclick = () => { zoom = !zoom; $('#zoom').setAttribute('aria-pressed', zoom); layout(); };
  $('#fs').onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); };
  $('#print').onclick = () => window.print();
  $('#menu').onclick = () => { const t = $('#toc'); t.hidden = !t.hidden; $('#menu').setAttribute('aria-expanded', !t.hidden); };
  $('#toc').addEventListener('click', e => { const a = e.target.closest('a[data-p]'); if (!a) return; e.preventDefault(); $('#toc').hidden = true; go(+a.dataset.p, Math.abs(+a.dataset.p - current) > 2); });

  addEventListener('keydown', e => {
    if (e.target.isContentEditable || /input|textarea/i.test(e.target.tagName)) return;
    if (e.key === 'ArrowLeft' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); flip(1); }
    if (e.key === 'ArrowRight' || e.key === 'PageUp') { e.preventDefault(); flip(-1); }
    if (e.key === 'Home') go(1, true);
    if (e.key === 'End') go(TOTAL, true);
  });

  // السحب باللمس: السحب نحو اليمين يقلب إلى الصفحة التالية (كتاب عربي)
  let tx = null, ty = null;
  stage.addEventListener('touchstart', e => { if (zoom) return; tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener('touchend', e => {
    if (tx == null) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; tx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) flip(dx > 0 ? 1 : -1);
  });

  addEventListener('hashchange', () => { const m = location.hash.match(/p=(\d+)/); if (m && +m[1] !== current) go(+m[1], true); });
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 120); });

  // فهرس المحتويات
  $('#toc').innerHTML = `<h2>فهرس الكتاب</h2><ol>${PAGES.titles.map((t, i) => `<li><a href="#p=${i + 1}" data-p="${i + 1}"><span>${num(i + 1)}</span>${t}</a></li>`).join('')}</ol>`;

  // نسخة الطباعة / PDF: الصفحات العشرون متتالية
  function buildPrint() {
    const root = $('#print-root'); root.innerHTML = '';
    for (let p = 1; p <= TOTAL; p++) root.appendChild(PAGES.render(p, { print: true }));
    root.querySelectorAll('img[loading]').forEach(i => i.loading = 'eager'); // الصور المخفية لا تُحمَّل كسولًا
  }
  addEventListener('beforeprint', buildPrint);

  const m = location.hash.match(/p=(\d+)/);
  current = m ? Math.max(1, Math.min(TOTAL, +m[1])) : 1;
  buildPrint();
  layout();
  document.body.classList.add('ready');

  window.BOOK = { total: TOTAL, go, flip, gameUrl: PAGES.gameUrl, get current() { return current; }, get mode() { return mode; } };
})();
