// النشاط ٧: وصّل الوسيلة بوظيفتها — مطابقة بخطوط في ثلاث جولات
const K = Kit.init(7, { max: 14 });
const app = K.$('#app');
const orgs = ADAPT.organisms;
let ri = 0, sel = null, done = 0, missed = new Set(), links = [];

function render() {
  const o = orgs[ri]; done = 0; links = []; sel = null; missed = new Set();
  app.innerHTML = `
    <div class="g-progress"><i></i></div>
    <p class="g-prompt">الجولة ${K.num(ri + 1)} من ${K.num(orgs.length)}: وسائل تكيُّف <span style="color:${o.color}">${o.name}</span><br><small>انقر وسيلة التكيُّف، ثم انقر وظيفتها.</small></p>
    <div class="board" style="--c:${o.color}">
      <svg class="lines" aria-hidden="true"></svg>
      <div class="col names">${K.shuffle(o.features).map(f => `<button class="node name" data-id="${f.id}">${f.name}<i class="dot"></i></button>`).join('')}</div>
      <div class="col roles">${K.shuffle(o.features).map(f => `<button class="node role" data-id="${f.id}"><i class="dot"></i>${f.role}</button>`).join('')}</div>
    </div>`;
  K.progress(ri, orgs.length);
  app.querySelectorAll('.name').forEach(b => b.onclick = () => { if (b.dataset.done) return; sel && sel.classList.remove('is-sel'); sel = b; b.classList.add('is-sel'); K.sound.pop(); });
  app.querySelectorAll('.role').forEach(b => b.onclick = () => match(b));
}

function point(node, side) {
  const board = app.querySelector('.board').getBoundingClientRect(), d = node.querySelector('.dot').getBoundingClientRect();
  return [d.left + d.width / 2 - board.left, d.top + d.height / 2 - board.top];
}
function line(a, b, cls) {
  const [x1, y1] = point(a), [x2, y2] = point(b);
  const svg = app.querySelector('.lines');
  const l = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const mx = (x1 + x2) / 2;
  l.setAttribute('d', `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`);
  l.setAttribute('class', cls); svg.appendChild(l); return l;
}
function redraw() {
  const svg = app.querySelector('.lines'); if (!svg) return;
  svg.innerHTML = ''; links.forEach(([a, b]) => line(a, b, 'ok'));
}
addEventListener('resize', redraw);

function match(role) {
  if (role.dataset.done) return;
  if (!sel) { K.toast('اختر وسيلة التكيُّف أولًا من العمود الأيمن', 'info'); return; }
  const name = sel; name.classList.remove('is-sel'); sel = null;
  if (name.dataset.id === role.dataset.id) {
    name.dataset.done = role.dataset.done = 1;
    links.push([name, role]); line(name, role, 'ok draw');
    K.ok(role, null, missed.has(name.dataset.id) ? 0 : 1); name.classList.add('is-ok');
    if (++done === orgs[ri].features.length) setTimeout(() => ++ri < orgs.length ? render() : K.finish({ text: 'ربطت وسائل التكيُّف الأربع عشرة بوظائفها.' }), K.t(1200));
  } else {
    missed.add(name.dataset.id);
    const l = line(name, role, 'bad'); setTimeout(() => l.remove(), 600);
    K.bad(role);
  }
}

render();

window.GameTest = {
  pair(ok) {
    const n = app.querySelector('.name:not([data-done])'); n.click();
    const r = ok ? app.querySelector(`.role[data-id="${n.dataset.id}"]`) : app.querySelector(`.role:not([data-done]):not([data-id="${n.dataset.id}"])`);
    r.click();
  },
  correct() { this.pair(true); }, wrong() { this.pair(false); },
  async solve() { while (!K.state.finished) { if (app.querySelector('.name:not([data-done])')) this.pair(true); await K.wait(40); } }
};
