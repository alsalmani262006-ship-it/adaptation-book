// النشاط ٩: سباق صح أم خطأ — الإجابة الصحيحة تقدّم سيارتك، والخاطئة تقدّم المنافس
const GOAL = 10;
const K = Kit.init(9, { max: GOAL, onStart: () => { rivalTimer = setInterval(() => move('rival'), 7000); ask(); } });
const app = K.$('#app');
const pool = K.shuffle(ADAPT.trueFalse());
let qi = 0, pos = { me: 0, rival: 0 }, rivalTimer = null, locked = false;

app.innerHTML = `
  <div class="track">
    <div class="finish" aria-hidden="true">🏁</div>
    <div class="lane"><span class="who">أنت</span><span class="car" id="me">🚙</span></div>
    <div class="lane"><span class="who">المنافس</span><span class="car" id="rival">🚗</span></div>
  </div>
  <div class="card q" id="q"><p class="state">اضغط «ابدأ اللعب» لينطلق السباق</p></div>
  <div class="answers"><button class="btn green big" data-a="1" disabled>✔ صح</button><button class="btn big no" data-a="0" disabled>✘ خطأ</button></div>
  <div id="explain" aria-live="polite"></div>`;

function place() {
  ['me', 'rival'].forEach(w => K.$('#' + w).style.insetInlineStart = `calc(${pos[w] / GOAL * 100}% * .86)`);
}

function move(who) {
  if (K.state.finished) return;
  pos[who] = Math.min(GOAL, pos[who] + 1); place();
  if (pos[who] >= GOAL) end(who === 'me');
}

function end(win) {
  clearInterval(rivalTimer);
  app.querySelectorAll('[data-a]').forEach(b => b.disabled = true);
  setTimeout(() => K.finish({ title: win ? 'فزت بالسباق! 🏆' : 'سبقك المنافس هذه المرة', text: win ? 'وصلت إلى خط النهاية أولًا.' : 'راجع وسائل التكيُّف ووظائفها، ثم حاول مجددًا.' }), K.t(700));
}

function ask() {
  if (K.state.finished) return;
  if (qi >= pool.length) { qi = 0; }
  locked = false;
  K.$('#q').innerHTML = `<small>العبارة ${K.num(qi + 1)}</small><p>${pool[qi].s}</p>`;
  app.querySelectorAll('[data-a]').forEach(b => b.disabled = false);
}

app.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
  if (locked || K.state.finished) return; locked = true;
  const item = pool[qi], right = (b.dataset.a === '1') === item.a;
  if (right) { K.ok(b); move('me'); K.$('#explain').innerHTML = ''; }
  else {
    K.bad(b, 'إجابة خاطئة! تقدّم المنافس'); move('rival');
    K.$('#explain').innerHTML = `<div class="g-explain bad">العبارة ${item.a ? 'صحيحة' : 'خاطئة'}.${item.fix ? ' الصواب: ' + item.fix : ''}</div>`;
  }
  qi++;
  app.querySelectorAll('[data-a]').forEach(x => x.disabled = true);
  setTimeout(ask, K.t(right ? 700 : 2200));
});

place();

window.GameTest = {
  btn(ok) { const a = pool[qi].a; return app.querySelector(`[data-a="${(ok ? a : !a) ? 1 : 0}"]`); },
  async correct() { await K.wait(30); this.btn(true).click(); },
  async wrong() { await K.wait(30); this.btn(false).click(); },
  async solve() { while (!K.state.finished) { const b = this.btn(true); if (!b.disabled) b.click(); await K.wait(40); } }
};
