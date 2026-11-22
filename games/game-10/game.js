// النشاط ١٠: ذاكرة التكيّف — طابق وسيلة التكيّف مع وظيفتها
const PAIRS = 6;
const K = Kit.init(10, { max: PAIRS * 3 });
const app = K.$('#app');
// زوج واحد على الأقل من كل كائن، والباقي عشوائي
const chosen = ADAPT.organisms.map(o => ADAPT.feature(K.sample(o.features, 1)[0].id));
chosen.push(...K.shuffle(ADAPT.features.filter(f => !chosen.includes(f))).slice(0, PAIRS - chosen.length));
const cards = K.shuffle(chosen.flatMap(f => [{ f, kind: 'name' }, { f, kind: 'role' }]));
let open = [], matched = 0, tries = 0, missSince = 0, lock = false;

app.innerHTML = `
  <div class="stats"><span>المحاولات: <b id="tries">${K.num(0)}</b></span><span>الأزواج: <b id="pairs">${K.num(0)} / ${K.num(PAIRS)}</b></span></div>
  <div class="grid">${cards.map((c, i) => {
    const o = ADAPT.organism(c.f.org);
    return `<button class="mcard" data-i="${i}" style="--c:${o.color}" aria-label="بطاقة مقلوبة">
      <span class="in"><span class="f back">🌿</span>
      <span class="f front ${c.kind}"><small>${c.kind === 'name' ? (o.short || o.name) : 'الوظيفة'}</small>${c.kind === 'name' ? c.f.name : c.f.role}</span></span></button>`;
  }).join('')}</div>
  <p class="tip">💡 كل زوج = اسم وسيلة التكيُّف + وظيفتها</p>`;

app.querySelectorAll('.mcard').forEach(b => b.onclick = () => flip(b));

function flip(b) {
  if (lock || b.classList.contains('on') || b.dataset.done) return;
  b.classList.add('on'); K.sound.flip(); open.push(b);
  if (open.length < 2) return;
  tries++; K.$('#tries').textContent = K.num(tries);
  const [a, c] = open.map(x => cards[x.dataset.i]);
  if (a.f.id === c.f.id && a.kind !== c.kind) {
    open.forEach(x => x.dataset.done = 1);
    const pts = missSince <= 1 ? 3 : missSince <= 3 ? 2 : 1; missSince = 0;
    open.forEach(x => x.classList.add('is-ok'));
    K.ok(null, `${a.f.name}: ${a.f.role}`, pts);
    open = []; matched++;
    K.$('#pairs').textContent = `${K.num(matched)} / ${K.num(PAIRS)}`;
    if (matched === PAIRS) setTimeout(() => K.finish({ text: `أنهيت اللعبة في ${K.num(tries)} محاولة.` }), K.t(900));
  } else {
    missSince++; lock = true;
    K.bad(null, 'ليستا زوجًا متطابقًا');
    setTimeout(() => { open.forEach(x => x.classList.remove('on')); open = []; lock = false; }, K.t(1100));
  }
}

window.GameTest = {
  idx(pred) { return [...app.querySelectorAll('.mcard')].filter(b => !b.dataset.done).find(pred); },
  async correct() {
    while (lock) await K.wait(20);
    const a = this.idx(() => true), ca = cards[a.dataset.i];
    flip(a); flip(this.idx(b => b !== a && cards[b.dataset.i].f.id === ca.f.id));
  },
  async wrong() {
    while (lock) await K.wait(20);
    const a = this.idx(() => true), ca = cards[a.dataset.i];
    flip(a); flip(this.idx(b => b !== a && cards[b.dataset.i].f.id !== ca.f.id));
  },
  async solve() { while (!K.state.finished) { if (this.idx(() => true)) await this.correct(); await K.wait(40); } }
};
