// النشاط ٦: الصبّار الصامد — ابنِ الصبّار بإضافة كل جزء بعد تحديد وظيفته، ثم اختبار سريع
const K = Kit.init(6, { max: 6 });
const app = K.$('#app');
const cactus = ADAPT.organism('cactus');
const others = ADAPT.features.filter(f => f.org !== 'cactus');
const icons = { stem: '🟩', spines: '📍', roots: '〰️' };
const built = [];
let phase = 'build', cur = null, missed = false, quiz = [], qi = 0;

app.innerHTML = `
  <p class="g-prompt" id="q">${cactus.intro}<br><small>اختر جزءًا، ثم حدّد وظيفته ليُضاف إلى النبات.</small></p>
  <div class="layout">
    <div class="desert"><div class="sun" aria-hidden="true"></div><div id="plant"></div>
      <div class="meter" title="الماء المخزّن"><i id="water"></i><span>💧</span></div></div>
    <div class="panel" id="panel"></div>
  </div>`;

function drawPlant() {
  K.$('#plant').innerHTML = ART.cactus(built.length ? built : ['none']);
  K.$('#water').style.height = (built.includes('stem') ? 45 : 0) + (built.includes('roots') ? 45 : 0) + '%';
}

function partsMenu() {
  phase = 'build';
  const left = cactus.features.filter(f => !built.includes(f.id));
  K.$('#panel').innerHTML = `<h3>أجزاء الصبّار</h3><div class="parts">${left.map(f => `
    <button class="part" data-id="${f.id}"><span>${icons[f.id]}</span>${f.name}</button>`).join('')}</div>`;
  K.$('#panel').querySelectorAll('.part').forEach(b => b.onclick = () => askPart(b.dataset.id));
}

function askPart(id) {
  cur = ADAPT.feature(id); missed = false;
  const opts = K.shuffle([...cactus.features.map(f => f.role), K.sample(others, 1)[0].role]);
  K.$('#panel').innerHTML = `<h3>ما وظيفة ${cur.name}؟</h3>
    <div class="choices">${opts.map(o => `<button class="choice">${o}</button>`).join('')}</div>
    <button class="btn secondary back" id="back">↩ اختر جزءًا آخر</button>`;
  K.$('#panel').querySelectorAll('.choice').forEach(b => b.onclick = () => answerBuild(b));
  K.$('#back').onclick = partsMenu;
}

function answerBuild(b) {
  if (b.textContent === cur.role) {
    K.ok(b, `أُضيف ${cur.name}!`, missed ? 0 : 1);
    built.push(cur.id); drawPlant();
    K.$('#plant').classList.remove('grow'); void K.$('#plant').offsetWidth; K.$('#plant').classList.add('grow');
    K.$('#panel').innerHTML = `<div class="g-explain">✔ ${cur.text}</div>`;
    setTimeout(() => built.length === 3 ? startQuiz() : partsMenu(), K.t(1500));
  } else { missed = true; b.disabled = true; K.bad(b); }
}

function startQuiz() {
  phase = 'quiz'; qi = 0;
  quiz = K.shuffle(cactus.features);
  K.$('#q').innerHTML = 'صمد الصبّار في الصحراء! 🌵 والآن اختبار سريع: أيّ جزء يقوم بهذه الوظيفة؟';
  askQuiz();
}

function askQuiz() {
  cur = quiz[qi]; missed = false;
  K.$('#panel').innerHTML = `<h3>«${cur.role}»</h3>
    <div class="choices">${K.shuffle(cactus.features).map(f => `<button class="choice" data-id="${f.id}">${icons[f.id]} ${f.name}</button>`).join('')}</div>`;
  K.$('#panel').querySelectorAll('.choice').forEach(b => b.onclick = () => {
    if (b.dataset.id === cur.id) {
      K.ok(b, null, missed ? 0 : 1);
      K.$('#panel').querySelectorAll('.choice').forEach(x => x.disabled = true);
      setTimeout(() => ++qi < quiz.length ? askQuiz() : K.finish({ text: 'بنيت الصبّار وتعرّفت على وسائل تكيُّفه الثلاث التي تساعده على العيش حيث يوجد الماء بكميّة قليلة.' }), K.t(1000));
    } else { missed = true; b.disabled = true; K.bad(b); }
  });
}

drawPlant(); partsMenu();

window.GameTest = {
  ensure() { if (phase === 'build' && !K.$('#panel .choice')) K.$('#panel .part').click(); },
  right() { this.ensure(); return [...K.$('#panel').querySelectorAll('.choice')].find(b => phase === 'build' ? b.textContent === cur.role : b.dataset.id === cur.id); },
  correct() { this.right().click(); },
  wrong() { const r = this.right(); [...K.$('#panel').querySelectorAll('.choice:not([disabled])')].find(b => b !== r).click(); },
  async solve() { while (!K.state.finished) { if (K.$('#panel .part') || K.$('#panel .choice:not([disabled])')) { const r = this.right(); r && !r.disabled && r.click(); } await K.wait(40); } }
};
