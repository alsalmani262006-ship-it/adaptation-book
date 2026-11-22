// النشاط ١١: بالونات التكيّف — افرقع البالون الذي يحمل إجابة اللغز «من أنا؟»
const ROUNDS = 10;
const K = Kit.init(11, { max: ROUNDS, onStart: () => launch() });
const app = K.$('#app');
const order = K.shuffle(ADAPT.features).slice(0, ROUNDS);
const colors = ['#ff5d8f', '#1f8fd6', '#ffc93c', '#3aa856', '#7b4fc9', '#e8892b'];
let ri = 0, missed = false, busy = false;

app.innerHTML = `
  <div class="g-progress"><i></i></div>
  <div class="riddle card" id="riddle"></div>
  <div class="sky" id="sky"><div class="cloud c1"></div><div class="cloud c2"></div></div>`;

function riddle() {
  const f = order[ri];
  K.$('#riddle').innerHTML = `<span class="who">من أنا؟ ${K.num(ri + 1)} / ${K.num(ROUNDS)}</span>
    <p>أنا من وسائل تكيُّف <b style="color:${ADAPT.organism(f.org).color}">${f.orgShort}</b>، وظيفتي: <mark>${f.role}</mark>.</p>`;
  K.progress(ri, ROUNDS);
}

function launch() {
  if (K.state.finished) return;
  busy = false; riddle();
  const f = order[ri];
  const opts = K.shuffle([f, ...K.sample(ADAPT.features.filter(x => x.id !== f.id), 3)]);
  const sky = K.$('#sky');
  sky.querySelectorAll('.balloon').forEach(b => b.remove());
  opts.forEach((o, i) => {
    const b = K.el(`<button class="balloon" data-id="${o.id}" style="--x:${8 + i * 23}%;--c:${colors[(ri + i) % colors.length]};--d:${i * .45}s;--t:${(window.__FAST ? 60 : 9) + (i % 2) * 1.5}s"><span>${o.name}</span></button>`);
    b.onclick = () => pop(b);
    b.addEventListener('animationend', e => { if (e.animationName === 'float' && b.dataset.id === f.id && !busy) escaped(); });
    sky.appendChild(b);
  });
}

function escaped() {
  missed = true; K.toast('طار البالون! انتبه وحاول مجددًا', 'info'); launch();
}

function pop(b) {
  if (busy || b.classList.contains('popped')) return;
  const f = order[ri];
  if (b.dataset.id === f.id) {
    busy = true; b.classList.add('popped'); K.sound.pop();
    K.ok(null, `أحسنت! أنا ${f.name}`, missed ? 0 : 1); missed = false;
    setTimeout(() => { if (++ri < ROUNDS) launch(); else { K.progress(1, 1); K.finish({ text: 'تعرّفت على وسائل التكيُّف من وظائفها.' }); } }, K.t(900));
  } else {
    missed = true; b.classList.add('popped', 'wrongpop'); K.bad(null, `هذا «${b.textContent}»، وليس الإجابة`);
  }
}

window.GameTest = {
  correct() { app.querySelector(`.balloon[data-id="${order[ri].id}"]`).click(); },
  wrong() { app.querySelector(`.balloon:not(.popped):not([data-id="${order[ri].id}"])`).click(); },
  async solve() { while (!K.state.finished) { const b = !busy && app.querySelector(`.balloon[data-id="${order[ri]?.id}"]`); b && b.click(); await K.wait(40); } }
};
