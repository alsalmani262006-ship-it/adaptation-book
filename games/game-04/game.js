// النشاط ٤: مستكشف السمكة — انقر الجزء الذي يؤدي الوظيفة المعروضة
const K = Kit.init(4, { max: 5 });
const app = K.$('#app');
const fish = ADAPT.organism('fish');
const P = ART.points.fish;
const order = K.shuffle(fish.features);
let qi = 0, missed = false;

app.innerHTML = `
  <div class="g-progress"><i></i></div>
  <p class="g-prompt" id="q"></p>
  <div class="sea">
    <div class="bubbles" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
    <div class="stage">
      ${ART.fish()}
      ${fish.features.map(f => `<button class="spot" data-id="${f.id}" style="left:${P[f.id][0] / 420 * 100}%;top:${P[f.id][1] / 220 * 100}%" aria-label="جزء من السمكة"><span></span></button>
      <span class="tag" data-for="${f.id}" style="left:${P[f.id][0] / 420 * 100}%;top:${P[f.id][1] / 220 * 100}%">${f.name}</span>`).join('')}
    </div>
  </div>
  <div id="explain" aria-live="polite"></div>
  <p class="intro">🐟 ${fish.intro}</p>`;

function ask() {
  missed = false;
  K.$('#q').innerHTML = `أيّ جزء في السمكة وظيفته: <mark>${order[qi].role}</mark>؟`;
  K.progress(qi, order.length);
}

app.querySelectorAll('.spot').forEach(b => b.onclick = () => {
  if (b.dataset.done) return;
  const f = order[qi];
  if (b.dataset.id === f.id) {
    b.dataset.done = 1; b.classList.add('found');
    app.querySelector(`.tag[data-for="${f.id}"]`).classList.add('show');
    K.ok(null, null, missed ? 0 : 1);
    K.$('#explain').innerHTML = `<div class="g-explain">✔ <b>${f.name}:</b> ${f.text}</div>`;
    if (++qi < order.length) setTimeout(ask, K.t(700));
    else { K.progress(1, 1); setTimeout(() => K.finish({ text: 'اكتشفت وسائل تكيُّف السمكة الخمس التي تساعدها على العيش في الماء.' }), K.t(1200)); }
  } else {
    missed = true; K.bad(b, 'ليس هذا الجزء، جرّب نقطة أخرى');
  }
});

ask();

window.GameTest = {
  correct() { app.querySelector(`.spot[data-id="${order[qi].id}"]`).click(); },
  wrong() { app.querySelector(`.spot:not([data-done]):not([data-id="${order[qi].id}"])`).click(); },
  async solve() { while (!K.state.finished) { if (qi < order.length) this.correct(); await K.wait(60); } }
};
