// النشاط ١: بطاقات المفاهيم — قلب البطاقات ثم اختبار المطابقة
const K = Kit.init(1, { max: 6 });
const app = K.$('#app');
const C = ADAPT.concepts;
let phase = 'cards', qs = [], qi = 0, cur = null, missed = false;
const flipped = new Set();

function renderCards() {
  app.innerHTML = `
    <p class="g-prompt">اقلب البطاقات الثلاث لتتعرّف على مفاهيم الدرس</p>
    <div class="cards">${C.map((c, i) => `
      <button class="flip" data-id="${c.id}" style="--d:${i * .12}s" aria-label="بطاقة ${c.term}">
        <span class="inner">
          <span class="face front"><span class="ico">${['🏡', '🦎', '✨'][i]}</span><b>${c.term}</b>${c.en ? `<i>${c.en}</i>` : ''}<small>انقر للقلب ↺</small></span>
          <span class="face back"><b>${c.term}</b><span>${c.def}</span></span>
        </span>
      </button>`).join('')}
    </div>
    <div class="center"><button class="btn" id="go" disabled>ابدأ الاختبار ▶</button><p class="hint" id="hint">اقلب البطاقات الثلاث أولًا</p></div>`;
  app.querySelectorAll('.flip').forEach(b => b.onclick = () => {
    b.classList.toggle('on'); K.sound.flip(); flipped.add(b.dataset.id);
    if (flipped.size === C.length) { K.$('#go').disabled = false; K.$('#hint').textContent = 'أحسنت! يمكنك الآن بدء الاختبار'; }
  });
  K.$('#go').onclick = startQuiz;
}

function startQuiz() {
  phase = 'quiz';
  qs = K.shuffle([...C.map(c => ({ type: 'term', c })), ...C.map(c => ({ type: 'def', c }))]);
  qi = 0; ask();
}

function ask() {
  cur = qs[qi]; missed = false;
  const isTerm = cur.type === 'term';
  app.innerHTML = `
    <div class="g-progress"><i></i></div>
    <p class="g-prompt">${isTerm ? 'أيّ مصطلح يناسب هذا التعريف؟' : 'ما تعريف هذا المصطلح؟'} <small>(${K.num(qi + 1)} / ${K.num(qs.length)})</small></p>
    <div class="card qcard">${isTerm ? `«${cur.c.def}»` : `<b>${cur.c.term}</b>`}</div>
    <div class="choices">${K.shuffle(C).map(o => `<button class="choice" data-id="${o.id}">${isTerm ? o.term : o.def}</button>`).join('')}</div>`;
  K.progress(qi, qs.length);
  app.querySelectorAll('.choice').forEach(b => b.onclick = () => choose(b));
}

function choose(b) {
  if (b.dataset.id === cur.c.id) {
    K.ok(b, null, missed ? 0 : 1);
    app.querySelectorAll('.choice').forEach(x => x.disabled = true);
    setTimeout(() => { qi++; qi < qs.length ? ask() : K.finish({ text: 'تعرّفت على مفاهيم الدرس: الموطن الطبيعيّ، والتكيُّف، ووسائل التكيُّف.' }); }, K.t(1000));
  } else {
    missed = true; b.disabled = true; K.bad(b);
  }
}

renderCards();

window.GameTest = {
  prep() { if (phase === 'cards') { app.querySelectorAll('.flip').forEach(b => b.click()); K.$('#go').click(); } },
  correct() { this.prep(); app.querySelector(`.choice[data-id="${cur.c.id}"]`).click(); },
  wrong() { this.prep(); app.querySelector(`.choice:not([data-id="${cur.c.id}"]):not([disabled])`).click(); },
  async solve() { this.prep(); while (!K.state.finished) { const b = app.querySelector(`.choice[data-id="${cur.c.id}"]:not([disabled])`); b && b.click(); await K.wait(40); } }
};
