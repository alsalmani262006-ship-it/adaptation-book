// النشاط ٣: أكمل الفراغ — جمل الدرس مع بنك كلمات
const K = Kit.init(3, { max: 8 });
const app = K.$('#app');

const items = [
  { s: 'المكان الذي يعيش فيه الكائن الحي يُطلق عليه ____.', a: 'الموطن الطبيعيّ' },
  { s: 'وسائل التكيُّف هي تلك ____ التي تساعد الكائن الحيّ على العيش في موطنه.', a: 'الصفات الخاصّة' },
  { s: 'تستطيع الأسماك العيش في الماء، ولكنّها لا تستطيع العيش على ____.', a: 'اليابسة' },
  { s: 'تستطيع ديدان الأرض العيش في ____، ولكنّها لا تستطيع العيش على الأشجار.', a: 'التربة' },
  { s: 'تستطيع الزرافات العيش في مناطق السافانا في أفريقيا، ولكنها لا تستطيع العيش في ____.', a: 'القطب الشماليّ' },
  { s: 'تتمتّع الكائنات الحية بوسائل ____ تساعدها على العيش في موطنها الطبيعيّ.', a: 'تكيُّف' },
  { s: 'تمتصّ الخياشيم ____ المُذاب من الماء.', a: 'الأكسجين' },
  { s: 'الساق السميكة في الصبّار ____ الماء.', a: 'تخزّن' }
];
const bank = K.shuffle([...items.map(i => i.a), 'الحرارة', 'الجحور']);
const order = K.shuffle(items);
let qi = 0, missed = false;

function render() {
  const it = order[qi]; missed = false;
  const [before, after] = it.s.split('____');
  app.innerHTML = `
    <div class="g-progress"><i></i></div>
    <p class="g-prompt">اختر الكلمة المناسبة لملء الفراغ <small>(${K.num(qi + 1)} / ${K.num(order.length)})</small></p>
    <div class="card sentence">${before}<span class="blank" id="blank">؟</span>${after}</div>
    <div class="bank">${bank.map(w => `<button class="word${used.has(w) ? ' used' : ''}" ${used.has(w) ? 'disabled' : ''}>${w}</button>`).join('')}</div>`;
  K.progress(qi, order.length);
  app.querySelectorAll('.word').forEach(b => b.onclick = () => choose(b));
}

const used = new Set();
function choose(b) {
  const it = order[qi], blank = K.$('#blank');
  if (b.textContent === it.a) {
    blank.textContent = it.a; blank.classList.add('filled');
    used.add(it.a); b.disabled = true; b.classList.add('used');
    K.ok(blank, null, missed ? 0 : 1);
    app.querySelectorAll('.word').forEach(x => x.disabled = true);
    setTimeout(() => { ++qi < order.length ? render() : K.finish({ text: 'أكملت جمل الدرس بالكلمات الصحيحة.' }); }, K.t(1100));
  } else {
    missed = true; K.bad(b);
  }
}

render();

window.GameTest = {
  correct() { [...app.querySelectorAll('.word')].find(b => b.textContent === order[qi].a).click(); },
  wrong() { [...app.querySelectorAll('.word:not([disabled])')].find(b => b.textContent !== order[qi].a).click(); },
  async solve() { while (!K.state.finished) { const b = [...app.querySelectorAll('.word:not([disabled])')].find(b => b.textContent === order[qi]?.a); b && b.click(); await K.wait(40); } }
};
