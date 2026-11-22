// النشاط ٨: السلال الثلاث — صنّف وسائل التكيّف حسب الكائن
const K = Kit.init(8, { max: 14, onStart: () => { t0 = Date.now(); tick = setInterval(clock, 1000); } });
const app = K.$('#app');
const deck = K.shuffle(ADAPT.features);
const pics = { fish: ART.fish(), fox: ART.fox(), cactus: ART.cactus() };
let i = 0, missed = false, t0 = Date.now(), tick = null;

app.innerHTML = `
  <div class="g-progress"><i></i></div>
  <div class="top"><p class="g-prompt">إلى أيّ كائن تنتمي وسيلة التكيُّف هذه؟</p><span class="clock" id="clock">⏱ ٠:٠٠</span></div>
  <div class="deck"><div class="stack" aria-hidden="true"></div><div id="card"></div></div>
  <div class="baskets">${ADAPT.organisms.map(o => `
    <div class="basket" data-drop data-id="${o.id}" style="--c:${o.color}">
      <span class="pic">${pics[o.id]}</span><b>${o.name}</b><span class="count" data-count="${o.id}">${K.num(0)}</span>
    </div>`).join('')}
  </div>`;

const counts = { fish: 0, fox: 0, cactus: 0 };
function clock() { const s = Math.floor((Date.now() - t0) / 1000); K.$('#clock').textContent = `⏱ ${K.num(Math.floor(s / 60))}:${K.num(String(s % 60).padStart(2, '0'))}`; }

function deal() {
  missed = false;
  const f = deck[i];
  K.$('#card').innerHTML = `<div class="fcard" data-id="${f.id}" tabindex="0"><small>${K.num(i + 1)} / ${K.num(deck.length)}</small><b>${f.name}</b><p>${f.role}</p><em>اسحبني إلى السلّة المناسبة</em></div>`;
  K.progress(i, deck.length);
  K.dragDrop({ items: [K.$('.fcard')], targets: baskets, onDrop: drop, tapTargets: false });
}
const baskets = () => [...app.querySelectorAll('.basket')];
baskets().forEach(b => b.addEventListener('click', () => { const c = K.$('.fcard'); if (c) drop(c, b); }));

function drop(card, basket) {
  if (card.dataset.done) return;
  const f = ADAPT.feature(card.dataset.id);
  if (basket.dataset.id === f.org) {
    card.dataset.done = 1;
    K.ok(basket, null, missed ? 0 : 1);
    counts[f.org]++; app.querySelector(`[data-count="${f.org}"]`).textContent = K.num(counts[f.org]);
    card.classList.add('fly');
    setTimeout(() => basket.classList.remove('is-ok'), 600);
    setTimeout(() => { if (++i < deck.length) deal(); else { clearInterval(tick); clock(); K.progress(1, 1); K.finish({ text: `صنّفت وسائل التكيُّف الأربع عشرة في ${K.$('#clock').textContent.replace('⏱ ', '')} دقيقة: ٥ للسمكة، و٦ للحصيني، و٣ للصبّار.` }); } }, K.t(600));
  } else {
    missed = true; K.bad(basket, `ليست هذه السلّة: «${f.name}» من وسائل تكيُّف كائن آخر`);
  }
}

deal();

window.GameTest = {
  correct() { const c = K.$('.fcard'); drop(c, app.querySelector(`.basket[data-id="${ADAPT.feature(c.dataset.id).org}"]`)); },
  wrong() { const c = K.$('.fcard'); drop(c, app.querySelector(`.basket:not([data-id="${ADAPT.feature(c.dataset.id).org}"])`)); },
  async solve() { while (!K.state.finished) { const c = K.$('.fcard:not([data-done])'); if (c) this.correct(); await K.wait(40); } }
};
