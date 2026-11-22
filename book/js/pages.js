/*
 * صفحات الكتاب العشرون. كل صفحة تُبنى من المحتوى المشترك (shared/js/data.js).
 * PAGES.render(n) يُرجع عنصر الصفحة. مقاس الصفحة الأساسي 600×848 (نسبة A4).
 */
(function () {
  const D = ADAPT, A = ART, G = GAMES, CFG = window.BOOK_CONFIG || {};
  const digits = '٠١٢٣٤٥٦٧٨٩';
  const num = n => String(n).replace(/\d/g, d => digits[d]);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch { return {}; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* غير متاح */ } } };

  const titles = ['الغلاف', 'أهداف الدرس', 'الموطن الطبيعيّ والتكيُّف', 'وسائل التكيُّف', 'الملخّص', ...G.map(g => `النشاط ${num(g.n)}: ${g.title}`)];
  const gameUrl = g => `../games/${g.slug}/index.html`;
  // في نسخة الطباعة/PDF تُستخدم الروابط المنشورة الحقيقية (من qr/qr-data.js) حتى لا تشير إلى الجهاز المحلي
  let printing = false;
  const publishedUrl = g => (window.QR_DATA && window.QR_DATA.games && window.QR_DATA.games[g.n] ? window.QR_DATA.games[g.n].url : null);
  const linkFor = g => (printing && publishedUrl(g)) || gameUrl(g);

  function frame(n, cls, body, opts = {}) {
    const el = document.createElement('div');
    el.className = 'page';
    el.dataset.p = n;
    el.innerHTML = `<div class="pg ${cls}" ${opts.style ? `style="${opts.style}"` : ''}>${body}</div>
      ${n > 1 ? `<footer class="pfoot"><span class="rt">التكيّف لدى الكائنات الحية</span><span class="pn">${num(n)}</span></footer>` : ''}`;
    return el;
  }
  const head = (kicker, title, icon) => `<header class="phead"><span class="kicker">${kicker}</span><h2>${icon ? `<i>${icon}</i>` : ''}${title}</h2></header>`;

  // ---------------- ١: الغلاف ----------------
  function cover() {
    const saved = store.get('adapt-cover');
    const field = (key, label) => {
      const v = CFG[key] || saved[key] || '';
      return `<div class="cf"><span class="cl">${label}</span><span class="cv${CFG[key] ? ' fixed' : ''}" data-f="${key}" ${key === 'studentId' ? 'dir="ltr"' : ''} ${CFG[key] ? '' : 'contenteditable="plaintext-only" spellcheck="false"'} data-ph="اكتب هنا">${esc(v)}</span></div>`;
    };
    return frame(1, 'cover', `
      <div class="sky"><span class="sun"></span><span class="cloud a"></span><span class="cloud b"></span></div>
      <div class="ctop"><span class="subj">🔬 ${esc(CFG.subject || 'العلوم')}</span><span class="unit">الوحدة ٧ · الكائنات الحيّة في بيئتها</span></div>
      <h1 class="ctitle"><span>التكيُّف</span><small>لدى الكائنات الحية</small></h1>
      <p class="csub">كتاب إلكتروني تفاعلي · ٥ صفحات تعليمية · ١٥ نشاطًا تفاعليًا</p>
      <div class="scene">
        <div class="water"><div class="c-fish">${A.fish({ bubbles: true })}</div></div>
        <div class="dune"><div class="c-cactus">${A.cactus()}</div><div class="c-fox">${A.fox()}</div></div>
      </div>
      <div class="cfields">${field('author', 'إعداد')}${field('studentId', 'الرقم الجامعي')}${field('grade', 'الصف الدراسي')}</div>`);
  }

  // ---------------- ٢: الأهداف ----------------
  function goals() {
    const gs = [
      ['🏡', 'يعرّف الموطن الطبيعيّ.', 'violet'],
      ['✨', 'يعرّف التكيُّف ووسائله.', 'violet'],
      ['🐟', 'يذكر وسائل تكيُّف السمكة ووظائفها.', 'water'],
      ['🦊', 'يذكر وسائل تكيُّف ثعلب الصحراء (الحصيني) ووظائفها.', 'sand'],
      ['🌵', 'يذكر وسائل تكيُّف الصبّار ووظائفها.', 'green'],
      ['🤔', 'يفسّر عدم قدرة كائن حيّ على العيش خارج موطنه الطبيعيّ.', 'pink'],
      ['🔍', 'يبحث عن تكيُّف كائن حيّ يعيش في عُمان ويعرضه.', 'green']
    ];
    return frame(2, 'goals', `
      ${head('قبل أن نبدأ', 'أهداف الدرس', '🎯')}
      <p class="lead">في نهاية الدرس يُتوقّع منك أن:</p>
      <ol class="glist">${gs.map(([i, t, c], k) => `<li class="t-${c}"><span class="gi">${i}</span><span class="gn">${num(k + 1)}</span><span>${t}</span></li>`).join('')}</ol>
      <div class="howto">
        <h3>📖 كيف تستخدم هذا الكتاب؟</h3>
        <div class="steps">
          <div><b>١</b><span>اقرأ صفحات المحتوى من ٣ إلى ٥.</span></div>
          <div><b>٢</b><span>العب الأنشطة من ٦ إلى ٢٠ بزر «افتح اللعبة» أو بمسح رمز QR.</span></div>
          <div><b>٣</b><span>اكتب ما تعلّمته في مربّع «ماذا تعلّمت؟».</span></div>
        </div>
      </div>
      <div class="map"><span class="m1">الصفحات ١–٥<b>المحتوى العلمي</b></span><span class="m2">الصفحات ٦–٢٠<b>١٥ نشاطًا تفاعليًا</b></span></div>`);
  }

  // ---------------- ٣: الموطن والتكيّف ----------------
  function concepts() {
    const art = { fish: A.fish(), worm: A.worm(), giraffe: A.giraffe() };
    const hab = { 'الماء': 'water', 'اليابسة': 'land', 'التربة': 'soil', 'الأشجار': 'trees', 'مناطق السافانا في أفريقيا': 'savanna', 'القطب الشماليّ': 'arctic' };
    return frame(3, 'concepts', `
      ${head('الدرس ٧-١', 'الموطن الطبيعيّ والتكيُّف', '🌍')}
      <p class="lead">لماذا يعيش كل كائن حيّ في مكان معيّن ولا يعيش في غيره؟</p>
      <div class="intro3">${D.intro.map(x => `
        <div class="ic"><div class="ia">${art[x.id]}</div><b>${x.name}</b>
          <div class="yes"><span class="hb">${A.habitatIcons[hab[x.can]]}</span>✔ تعيش في ${x.id === 'giraffe' ? 'السافانا' : x.can}</div>
          <div class="no"><span class="hb">${A.habitatIcons[hab[x.cannot]]}</span>✘ لا تعيش ${x.id === 'fish' ? 'على' : x.id === 'worm' ? 'على' : 'في'} ${x.cannot}</div></div>`).join('')}
      </div>
      <div class="defs">
        <div class="def d1"><span class="dt">الموطن الطبيعيّ <i>Habitat</i></span><p>المكان الذي يعيش فيه الكائن الحي يُطلق عليه <b>الموطن الطبيعيّ</b>.</p></div>
        <div class="def d2"><span class="dt">التكيُّف <i>Adaptation</i></span><p>لكلّ نوع من الكائنات الحيّة <b>وسائل تكيُّف</b> تساعده على العيش في موطن طبيعيّ معيّن، ووسائل التكيُّف هي تلك <b>الصفات الخاصّة</b> التي تساعد ذلك الكائن الحيّ على العيش في موطنه.</p></div>
      </div>
      <div class="think"><h3>💭 فكّر وأجب</h3><ol>${D.lessonQuestions.slice(0, 3).map(q => `<li>${q.text}</li>`).join('')}</ol>
        <p class="tip">أجب عن هذه الأسئلة في النشاط ١٣: «عجلة أسئلة الدرس».</p></div>`);
  }

  // ---------------- ٤: المحتوى العلمي ----------------
  function content() {
    const panel = (o, art, cls) => `
      <section class="org ${cls}" style="--c:${o.color}">
        <div class="oart">${art}${o.features.map((f, i) => { const p = A.points[o.id][f.id], vb = { fish: [420, 220], fox: [400, 380], cactus: [300, 420] }[o.id]; return `<span class="mk" style="left:${p[0] / vb[0] * 100}%;top:${p[1] / vb[1] * 100}%">${num(i + 1)}</span>`; }).join('')}</div>
        <div class="otext"><h3>${o.name}</h3><p class="oi">${o.intro}</p>
          <ol>${o.features.map((f, i) => `<li><span class="n">${num(i + 1)}</span><span>${f.text.includes(f.name) ? f.text.replace(f.name, `<b>${f.name}</b>`) : `<b>${f.name}:</b> ${f.text}`}</span></li>`).join('')}</ol></div>
      </section>`;
    const [fish, fox, cactus] = D.organisms;
    return frame(4, 'content', `
      ${head('المحتوى العلمي', 'وسائل التكيُّف في ثلاثة كائنات', '🔎')}
      ${panel(fish, A.fish(), 'o-fish')}
      ${panel(fox, A.fox(), 'o-fox')}
      <div class="row2">${panel(cactus, A.cactus(), 'o-cactus')}
        <aside class="eagle"><div class="ea">${A.eagle()}</div><h4>🦅 تحدٍّ</h4><p>${D.lessonQuestions[3].text}</p><small>ابحث عن الإجابة، واكتبها في النشاط ١٣.</small></aside></div>`);
  }

  // ---------------- ٥: الملخّص ----------------
  function summary() {
    return frame(5, 'summary', `
      ${head('نراجع معًا', 'الملخّص', '📝')}
      <div class="sbox"><h3>مُلخّص الدرس</h3><ul>${D.summary.map(s => `<li>${s}</li>`).join('')}</ul></div>
      <div class="cmap">
        <div class="root">التكيُّف<small>صفات خاصّة تساعد الكائن الحيّ على العيش في موطنه الطبيعيّ</small></div>
        <svg class="links" viewBox="0 0 528 40" preserveAspectRatio="none" aria-hidden="true"><path d="M264 0 V14 M88 40 V14 H440 V40 M264 14 V40"/></svg>
        <div class="branches">${D.organisms.map(o => `
          <div class="br" style="--c:${o.color}"><b>${o.name}</b><span class="hab">الموطن: ${o.habitat}</span>
            <ul>${o.features.map(f => `<li>${f.name}</li>`).join('')}</ul></div>`).join('')}
        </div>
      </div>
      <div class="project">
        <div class="ph"><span class="tag">مشروعي</span><h3>${D.activity.title}</h3></div>
        <ol>${D.activity.steps.map(s => `<li>${s}</li>`).join('')}</ol>
        <a class="pbtn" href="${linkFor(G[13])}">🔍 نفّذ المشروع رقميًا في النشاط ١٤ ←</a>
      </div>`);
  }

  // ---------------- ٦–٢٠: صفحات الأنشطة ----------------
  function activity(g) {
    const qr = window.QR_DATA && window.QR_DATA.games && window.QR_DATA.games[g.n];
    const qrBox = qr
      ? `<div class="qr has"><img src="../${qr.svg}" alt="رمز QR للنشاط ${num(g.n)}"><span class="qu" dir="ltr">${esc(qr.url)}</span></div>`
      : `<div class="qr"><div class="qph" aria-hidden="true"><i></i><i></i><i></i><span>QR</span></div><span class="qt">مساحة رمز QR<br><small>يُولَّد بعد نشر الكتاب ويظهر هنا تلقائيًا</small></span></div>`;
    return frame(g.page, `act t-${g.theme}`, `
      <header class="ahead">
        <span class="anum"><small>النشاط</small>${num(g.n)}</span>
        <div><span class="kind">${g.icon} ${g.kind}</span><h2>${g.title}</h2></div>
      </header>
      <div class="goal"><h3>🎯 الهدف التعليمي</h3><p>${g.goal}</p></div>
      <div class="ahow"><h3>📋 تعليمات اللعب</h3><ol>${g.howto.map(h => `<li>${h}</li>`).join('')}</ol></div>
      <figure class="prev"><div class="screen"><span class="dots"><i></i><i></i><i></i></span><img src="assets/previews/${g.slug}.jpg" alt="معاينة ${g.title}" loading="lazy"></div><figcaption>معاينة من اللعبة</figcaption></figure>
      <div class="play">
        <a class="pbtn big" href="${linkFor(g)}">▶ افتح اللعبة</a>
        ${qrBox}
      </div>
      <div class="learned"><h3>✏️ ماذا تعلّمت؟</h3><div class="lines"><i></i><i></i></div></div>`, { style: `--c:${g.color};--soft:${g.soft}` });
  }

  function render(n, opts = {}) {
    printing = !!opts.print;
    try { return build(n); } finally { printing = false; }
  }
  function build(n) {
    if (n === 1) return cover();
    if (n === 2) return goals();
    if (n === 3) return concepts();
    if (n === 4) return content();
    if (n === 5) return summary();
    return activity(G[n - 6]);
  }

  // مزامنة حقول الغلاف بين كل النسخ المعروضة (الشاشة والطباعة) وحفظها على الجهاز
  document.addEventListener('input', e => {
    const f = e.target.closest && e.target.closest('.cv[data-f]'); if (!f) return;
    const saved = store.get('adapt-cover'); saved[f.dataset.f] = f.textContent.trim(); store.set('adapt-cover', saved);
    document.querySelectorAll(`.cv[data-f="${f.dataset.f}"]`).forEach(x => { if (x !== f) x.textContent = f.textContent; });
  });

  window.PAGES = { total: 20, titles, render, gameUrl, publishedUrl, num };
})();
