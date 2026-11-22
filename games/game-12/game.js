// النشاط ١٢: الكلمات المتقاطعة — مصطلحات الدرس (التخطيط مولَّد مسبقًا ومثبَّت)
const W = 10, H = 11;
// d: 0 أفقي (من اليمين إلى اليسار)، 1 عمودي (من أعلى إلى أسفل). العمود 0 هو أقصى اليمين.
const WORDS = [
  { w: 'انسيابي', r: 3, c: 2, d: 0, clue: 'صفة جسم السمكة، وهي تقلّل الاحتكاك عندما تتحرّك للأمام' },
  { w: 'موطن', r: 0, c: 3, d: 1, clue: 'المكان الذي يعيش فيه الكائن الحي يُطلق عليه الـ… الطبيعيّ' },
  { w: 'زعانف', r: 1, c: 6, d: 1, clue: 'تساعد السمكة على الاحتفاظ باتّزانها' },
  { w: 'أشواك', r: 3, c: 2, d: 1, clue: 'تمنع الحيوانات العطشى من أكل الصبّار للحصول على الماء' },
  { w: 'خياشيم', r: 2, c: 8, d: 1, clue: 'تمتصّ الأكسجين المُذاب من الماء' },
  { w: 'تكيف', r: 7, c: 1, d: 0, clue: 'الصفات الخاصّة التي تساعد الكائن الحيّ على العيش في موطنه هي وسائل الـ…' },
  { w: 'جحور', r: 1, c: 1, d: 0, clue: 'يحفرها الحصيني برجليه الأماميتين ليرتاح فيها أثناء النهار' },
  { w: 'جذور', r: 5, c: 0, d: 0, clue: 'تستطيع الوصول للماء في أعماق التربة (في الصبّار)' },
  { w: 'فراء', r: 7, c: 4, d: 1, clue: 'يغطّي جسم الحصيني، والسميك منه يوفّر له الدفء في الليالي الباردة' },
  { w: 'ساق', r: 9, c: 3, d: 0, clue: 'جزء الصبّار السميك الذي يخزّن الماء' },
  { w: 'ذيل', r: 6, c: 7, d: 0, clue: 'يساعد السمكة على الحركة في الماء' }
];
const K = Kit.init(12, { max: WORDS.length });
const app = K.$('#app');
const norm = ch => ({ 'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ى': 'ي' }[ch] || ch);
const cellsOf = w => [...w.w].map((ch, i) => ({ r: w.d ? w.r + i : w.r, c: w.d ? w.c : w.c + i, ch }));

// ترقيم بدايات الكلمات حسب ترتيب القراءة
const starts = [...new Set(WORDS.map(w => w.r * 100 + w.c))].sort((a, b) => a - b);
WORDS.forEach(w => { w.n = starts.indexOf(w.r * 100 + w.c) + 1; w.solved = false; });
const grid = {};
WORDS.forEach((w, wi) => cellsOf(w).forEach(({ r, c, ch }) => { const k = r + ',' + c; (grid[k] = grid[k] || { ch, words: [] }).words.push(wi); }));

let active = 0, input = {};
const letters = 'ا أ ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي ء ة ى'.split(' ');

app.innerHTML = `
  <div class="wrap">
    <div>
      <div class="cw" style="grid-template-columns:repeat(${W},1fr)">${Array.from({ length: H * W }, (_, i) => {
        const r = Math.floor(i / W), c = i % W, g = grid[r + ',' + c];
        if (!g) return '<span class="blank"></span>';
        const n = WORDS.find(w => w.r === r && w.c === c);
        return `<label class="cell" data-k="${r},${c}">${n ? `<i>${K.num(n.n)}</i>` : ''}<input maxlength="2" autocomplete="off" aria-label="خانة"></label>`;
      }).join('')}</div>
      <div class="kb">${letters.map(l => `<button data-l="${l}">${l}</button>`).join('')}<button data-l="del" class="del">⌫ حذف</button></div>
      <div class="actions"><button class="btn green" id="check">✔ تحقّق</button><button class="btn secondary" id="reveal">💡 اكشف حرفًا</button></div>
    </div>
    <div class="clues">
      <h3>↙ أفقي</h3><ol>${WORDS.map((w, i) => w.d ? '' : clue(w, i)).join('')}</ol>
      <h3>↓ عمودي</h3><ol>${WORDS.map((w, i) => w.d ? clue(w, i) : '').join('')}</ol>
    </div>
  </div>`;
function clue(w, i) { return `<li data-w="${i}"><b>${K.num(w.n)}</b> ${w.clue} <small>(${K.num([...w.w].length)} حروف)</small></li>`; }

const cellEl = (r, c) => app.querySelector(`.cell[data-k="${r},${c}"]`);
function highlight() {
  app.querySelectorAll('.cell.hl').forEach(x => x.classList.remove('hl'));
  app.querySelectorAll('.clues li.on').forEach(x => x.classList.remove('on'));
  cellsOf(WORDS[active]).forEach(({ r, c }) => cellEl(r, c).classList.add('hl'));
  app.querySelector(`.clues li[data-w="${active}"]`).classList.add('on');
}
function focusCell(r, c) { const e = cellEl(r, c); e && e.querySelector('input').focus(); }
let cursor = null;

app.querySelectorAll('.cell').forEach(cell => {
  const [r, c] = cell.dataset.k.split(',').map(Number), inp = cell.querySelector('input');
  inp.addEventListener('focus', () => { cursor = [r, c]; const ws = grid[cell.dataset.k].words; if (!ws.includes(active)) active = ws[0]; highlight(); });
  cell.addEventListener('click', () => { const ws = grid[cell.dataset.k].words; if (ws.length > 1 && cursor && cursor[0] === r && cursor[1] === c && document.activeElement === inp) { active = ws.find(w => w !== active); highlight(); } });
  inp.addEventListener('input', () => {
    const ch = [...inp.value.replace(/[ً-ْـ]/g, '')].pop() || '';
    inp.value = ch; if (ch) advance(r, c, 1);
  });
  inp.addEventListener('keydown', e => { if (e.key === 'Backspace' && !inp.value) { advance(r, c, -1); e.preventDefault(); } });
});

function advance(r, c, step) {
  const cs = cellsOf(WORDS[active]), i = cs.findIndex(x => x.r === r && x.c === c), n = cs[i + step];
  if (n) focusCell(n.r, n.c);
}
app.querySelectorAll('.clues li').forEach(li => li.onclick = () => { active = +li.dataset.w; const s = cellsOf(WORDS[active]).find(x => !cellEl(x.r, x.c).querySelector('input').value) || cellsOf(WORDS[active])[0]; focusCell(s.r, s.c); highlight(); });

app.querySelector('.kb').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || !cursor) return;
  const [r, c] = cursor, inp = cellEl(r, c).querySelector('input');
  if (b.dataset.l === 'del') { if (inp.value) inp.value = ''; else advance(r, c, -1); }
  else if (!inp.readOnly) { inp.value = b.dataset.l; advance(r, c, 1); }
  K.sound.pop();
  if (b.dataset.l === 'del') focusCell(...cursor);
});

function check() {
  let newly = 0, wrongWords = 0;
  WORDS.forEach(w => {
    if (w.solved) return;
    const cs = cellsOf(w), full = cs.every(x => cellEl(x.r, x.c).querySelector('input').value);
    const ok = cs.every(x => norm(cellEl(x.r, x.c).querySelector('input').value) === norm(x.ch));
    if (ok) {
      w.solved = true; newly++;
      cs.forEach(x => { const e = cellEl(x.r, x.c); e.classList.add('solved'); e.querySelector('input').readOnly = true; });
      app.querySelector(`.clues li[data-w="${WORDS.indexOf(w)}"]`).classList.add('done');
    } else if (full) {
      wrongWords++;
      cs.forEach(x => { const e = cellEl(x.r, x.c); if (norm(e.querySelector('input').value) !== norm(x.ch)) { e.classList.add('is-bad'); setTimeout(() => e.classList.remove('is-bad'), 700); } });
    }
  });
  if (newly) K.ok(null, `أحسنت! ${K.num(newly)} ${newly === 1 ? 'كلمة صحيحة' : 'كلمات صحيحة'}`, newly);
  else if (wrongWords) K.bad(null, 'بعض الحروف غير صحيحة، راجع الخانات الحمراء');
  else K.toast('املأ كلمة كاملة ثم اضغط «تحقّق»', 'info');
  if (WORDS.every(w => w.solved)) setTimeout(() => K.finish({ text: 'حللت الكلمات المتقاطعة كلها!' }), K.t(900));
}
K.$('#check').onclick = check;
K.$('#reveal').onclick = () => {
  const w = WORDS[active]; const x = cellsOf(w).find(x => norm(cellEl(x.r, x.c).querySelector('input').value) !== norm(x.ch));
  if (!x) return K.toast('هذه الكلمة مكتملة، اضغط «تحقّق»', 'info');
  cellEl(x.r, x.c).querySelector('input').value = x.ch; cellEl(x.r, x.c).classList.add('revealed');
  K.toast('كُشف حرف واحد', 'info');
};

highlight();

window.GameTest = {
  fill(i, ok) { cellsOf(WORDS[i]).forEach((x, j) => { cellEl(x.r, x.c).querySelector('input').value = ok || j ? x.ch : 'ث'; }); },
  correct() { const i = WORDS.findIndex(w => !w.solved); this.fill(i, true); check(); },
  wrong() { const i = WORDS.findIndex(w => !w.solved); this.fill(i, false); check(); },
  async solve() { WORDS.forEach((w, i) => !w.solved && this.fill(i, true)); check(); }
};
