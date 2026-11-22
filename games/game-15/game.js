// النشاط ١٥: التحدّي النهائي — اثنا عشر سؤالًا متنوّعًا، محاولة واحدة لكل سؤال، ثم شهادة
const K = Kit.init(15, { max: 12 });
const app = K.$('#app');
const F = ADAPT.feature;
const tf = K.sample(ADAPT.trueFalse(), 3);
const mark = (svg, [x, y], vbW, vbH) => svg.replace('</svg>', `<circle cx="${x}" cy="${y}" r="${vbW / 22}" fill="none" stroke="#e5484d" stroke-width="${vbW / 80}"><animate attributeName="r" values="${vbW / 26};${vbW / 18};${vbW / 26}" dur="1.2s" repeatCount="indefinite"/></circle></svg>`);
const names = list => list.map(id => F(id).name);

const Q = [
  { t: 'المكان الذي يعيش فيه الكائن الحي يُطلق عليه:', c: ['الموطن الطبيعيّ', 'التكيُّف', 'وسائل التكيُّف'], a: 0, why: 'المكان الذي يعيش فيه الكائن الحي يُطلق عليه الموطن الطبيعيّ.' },
  { t: 'وسائل التكيُّف هي:', c: ['الصفات الخاصّة التي تساعد الكائن الحيّ على العيش في موطنه', 'المكان الذي يعيش فيه الكائن الحي'], a: 0, why: 'وسائل التكيُّف هي تلك الصفات الخاصّة التي تساعد ذلك الكائن الحيّ على العيش في موطنه.' },
  { t: 'ما اسم الجزء المشار إليه في السمكة؟', pic: mark(ART.fish(), ART.points.fish.gills, 420, 220), c: names(['gills', 'fins', 'tail']), a: 0, why: F('gills').text },
  { t: 'ما اسم الجزء المشار إليه في ثعلب الصحراء؟', pic: mark(ART.fox(), ART.points.fox.ears, 400, 380), c: names(['ears', 'eyes', 'legs']), a: 0, why: F('ears').text },
  { t: 'ما اسم الجزء المشار إليه في الصبّار؟', pic: mark(ART.cactus(), ART.points.cactus.roots, 300, 420), c: names(['roots', 'stem', 'spines']), a: 0, why: F('roots').text },
  { t: 'أيّ كائن حيّ يمتلك الخطّ الجانبيّ الذي يستشعر أيّ حركة في الماء حوله؟', c: ['السمكة', 'ثعلب الصحراء (الحصيني)', 'الصبّار'], a: 0, why: F('lateral').text },
  { t: 'أيّ كائن حيّ تمنع أشواكه الحيوانات العطشى من أكله للحصول على الماء؟', c: ['الصبّار', 'السمكة', 'ثعلب الصحراء (الحصيني)'], a: 0, why: F('spines').text },
  { t: 'ما وظيفة الفراء السميك في ثعلب الصحراء؟', c: [F('fur').role, F('color').role, F('ears').role], a: 0, why: F('fur').text },
  { t: 'وضّح لماذا لا تستطيع الأسماك العيش على اليابسة.', c: ADAPT.lessonQuestions[0].choices, a: 0, why: F('gills').text },
  ...tf.map(x => ({ t: `صح أم خطأ: ${x.s}`, c: ['صح', 'خطأ'], a: x.a ? 0 : 1, fixed: true, why: x.a ? 'العبارة صحيحة.' : `العبارة خاطئة. ${x.fix || ''}` }))
];
let qi = 0, wrongList = [];

function ask() {
  const q = Q[qi];
  const opts = q.fixed ? q.c.map((c, j) => ({ c, j })) : K.shuffle(q.c.map((c, j) => ({ c, j })));
  app.innerHTML = `
    <div class="g-progress"><i></i></div>
    <div class="card qbox">
      <span class="qn">السؤال ${K.num(qi + 1)} من ${K.num(Q.length)}</span>
      <h2>${q.t}</h2>
      ${q.pic ? `<div class="pic">${q.pic}</div>` : ''}
      <div class="choices ${q.fixed ? 'two' : ''}">${opts.map(o => `<button class="choice" data-j="${o.j}">${o.c}</button>`).join('')}</div>
      <div id="why" aria-live="polite"></div>
      <div class="nextrow"><button class="btn" id="next" hidden>${qi + 1 < Q.length ? 'السؤال التالي ←' : 'النتيجة 🏆'}</button></div>
    </div>`;
  K.progress(qi, Q.length);
  app.querySelectorAll('.choice').forEach(b => b.onclick = () => {
    const right = +b.dataset.j === q.a;
    app.querySelectorAll('.choice').forEach(x => { x.disabled = true; if (+x.dataset.j === q.a) x.classList.add('is-ok'); });
    if (right) K.ok(b); else { K.bad(b, 'إجابة غير صحيحة'); wrongList.push(q); }
    K.$('#why').innerHTML = `<div class="g-explain ${right ? '' : 'bad'}">${right ? '✔' : '✘ الإجابة الصحيحة: «' + q.c[q.a] + '».'} ${q.why}</div>`;
    K.$('#next').hidden = false; K.$('#next').focus();
  });
  K.$('#next').onclick = () => { ++qi < Q.length ? ask() : result(); };
}

function result() {
  K.progress(1, 1);
  const o = K.finish({
    text: wrongList.length ? `راجع ${K.num(wrongList.length)} ${wrongList.length === 1 ? 'سؤالًا' : 'أسئلة'} في صفحات المحتوى (٣–٥) من الكتاب.` : 'أجبت عن جميع الأسئلة إجابة صحيحة!',
    extra: `<div class="cert-form"><label>اكتب اسمك لتحصل على شهادتك<input id="sname" placeholder="اسم الطالب"></label><button class="btn green" id="cert">🎓 أصدر شهادتي</button></div>`
  });
  o.querySelector('#cert').onclick = () => {
    const n = o.querySelector('#sname').value.trim();
    if (n.length < 2) { K.bad(o.querySelector('#sname'), 'اكتب اسمك أولًا'); return; }
    const d = new Date().toLocaleDateString('ar-OM', { year: 'numeric', month: 'long', day: 'numeric' });
    document.body.insertAdjacentHTML('beforeend', `<div class="g-overlay cert-wrap"><div class="cert" id="certificate">
      <div class="seal">🏆</div><p class="k">شهادة إنجاز</p>
      <p>تُمنح هذه الشهادة للطالب/ـة</p><h2>${n.replace(/</g, '&lt;')}</h2>
      <p>لإتمامه/ـا «التحدّي النهائي» في درس <b>التكيُّف لدى الكائنات الحية</b></p>
      <p class="score">النتيجة: ${K.num(K.state.score)} من ${K.num(Q.length)}</p>
      <p class="date">${d}</p>
      <div class="row noprint"><button class="btn" onclick="window.print()">🖨 اطبع الشهادة</button><button class="btn secondary" onclick="this.closest('.g-overlay').remove()">إغلاق</button></div>
    </div></div>`);
    K.confetti();
  };
}

ask();

window.GameTest = {
  pick(ok) { const q = Q[qi]; app.querySelector(ok ? `.choice[data-j="${q.a}"]` : `.choice:not([data-j="${q.a}"])`).click(); },
  correct() { this.pick(true); K.$('#next').click(); },
  wrong() { this.pick(false); K.$('#next').click(); },
  async solve() { while (!K.state.finished) { if (K.$('#next')?.hidden === false) K.$('#next').click(); else this.pick(true); await K.wait(30); } }
};
