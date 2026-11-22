// النشاط ١٣: عجلة أسئلة الدرس — أسئلة الدرس الأربعة وأربعة أسئلة مراجعة
const K = Kit.init(13, { max: 5 });
const app = K.$('#app');
const L = ADAPT.lessonQuestions;
const segs = [
  { label: 'سؤال ١', q: L[0] },
  { label: 'مراجعة ١', q: { text: 'ما الموطن الطبيعيّ للزرافات كما ورد في الدرس؟', auto: true, choices: ['مناطق السافانا في أفريقيا', 'القطب الشماليّ', 'الماء'], answer: 0 } },
  { label: 'سؤال ٢', q: L[1] },
  { label: 'مراجعة ٢', q: { text: 'ما وسيلة التكيُّف التي تساعد ثعلب الصحراء على التخفّي؟', auto: true, choices: ['الفراء باللون الرمليّ', 'الآذان الكبيرة', 'الرجلان الأماميتان القويتان'], answer: 0 } },
  { label: 'سؤال ٣', q: L[2] },
  { label: 'مراجعة ٣', q: { text: 'أين تستطيع ديدان الأرض العيش؟', auto: true, choices: ['في التربة', 'على الأشجار'], answer: 0 } },
  { label: 'سؤال ٤', q: L[3] },
  { label: 'مراجعة ٤', q: { text: 'ما وسيلة التكيُّف التي تساعد الصبّار على الوصول للماء في أعماق التربة؟', auto: true, choices: ['الجذور الطويلة', 'الساق السميكة', 'الأشواك'], answer: 0 } }
];
const colors = ['#e8892b', '#7b4fc9', '#1f8fd6', '#3aa856', '#e0457b', '#f2b630', '#2bb3a8', '#5b6cd6'];
const answers = K.store.get('adapt-open-answers', {});
let rot = 0, cur = -1, spinning = false, missed = false;
const N = segs.length, A = 360 / N;

function wheelSVG() {
  const r = 150, cx = 160, cy = 160;
  const pt = a => [cx + r * Math.sin(a * Math.PI / 180), cy - r * Math.cos(a * Math.PI / 180)];
  return `<svg viewBox="0 0 320 320" class="wheel" id="wheel">${segs.map((s, i) => {
    const [x1, y1] = pt(i * A), [x2, y2] = pt((i + 1) * A), mid = i * A + A / 2;
    return `<g class="seg" data-i="${i}"><path d="M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2} Z" fill="${colors[i]}" stroke="#fff" stroke-width="3"/>
      <text x="${cx}" y="${cy - r + 34}" transform="rotate(${mid} ${cx} ${cy})" text-anchor="middle" fill="#fff" font-weight="900" font-size="17">${s.label}</text>
      <text class="tick" x="${cx}" y="${cy - r + 62}" transform="rotate(${mid} ${cx} ${cy})" text-anchor="middle" font-size="20">✔</text></g>`;
  }).join('')}<circle cx="${cx}" cy="${cy}" r="30" fill="#fff" stroke="#e4dccb" stroke-width="4"/><text x="${cx}" y="${cy + 9}" text-anchor="middle" font-size="26">🎡</text></svg>`;
}

app.innerHTML = `
  <div class="layout">
    <div class="wheelbox"><div class="pointer" aria-hidden="true">▼</div>${wheelSVG()}
      <button class="btn sand spin" id="spin">🎡 أدِر العجلة</button>
      <p class="left" id="left"></p></div>
    <div class="panel card" id="panel"><h3>كيف ألعب؟</h3><p>أدِر العجلة لتختار سؤالًا. أسئلة «سؤال ١–٤» هي أسئلة الدرس نفسها، وأسئلة «مراجعة» تختبر ما تعلّمته.</p></div>
  </div>`;

const done = new Set();
function updateLeft() { K.$('#left').textContent = `بقي ${K.num(N - done.size)} من ${K.num(N)} أسئلة`; }

function spin() {
  if (spinning || done.size === N) return;
  spinning = true; K.$('#spin').disabled = true;
  const left = segs.map((_, i) => i).filter(i => !done.has(i));
  cur = left[Math.random() * left.length | 0];
  // المؤشر في الأعلى: ندير العجلة حتى يصبح منتصف القطعة عند الزاوية ٠
  const target = 360 - (cur * A + A / 2);
  rot += 360 * 4 + ((target - rot % 360) + 360) % 360;
  const w = K.$('#wheel');
  w.style.transition = window.__FAST ? 'none' : 'transform 3.2s cubic-bezier(.15, .85, .25, 1)';
  w.style.transform = `rotate(${rot}deg)`;
  let ticks = 0; const tk = setInterval(() => { K.sound.pop(); if (++ticks > 14) clearInterval(tk); }, 180);
  setTimeout(() => { clearInterval(tk); spinning = false; show(cur); }, K.t(3300));
}
K.$('#spin').onclick = spin;

function show(i) {
  const { q, label } = segs[i]; missed = false;
  const p = K.$('#panel');
  if (q.auto) {
    p.innerHTML = `<span class="lbl" style="background:${colors[i]}">${label}</span><h3>${q.text}</h3>
      <div class="choices">${K.shuffle(q.choices.map((c, j) => ({ c, j }))).map(o => `<button class="choice" data-j="${o.j}">${o.c}</button>`).join('')}</div>`;
    p.querySelectorAll('.choice').forEach(b => b.onclick = () => {
      if (+b.dataset.j === q.answer) { K.ok(b, null, missed ? 0 : 1); p.querySelectorAll('.choice').forEach(x => x.disabled = true); complete(i); }
      else { missed = true; b.disabled = true; K.bad(b); }
    });
  } else {
    p.innerHTML = `<span class="lbl" style="background:${colors[i]}">${label} · سؤال مفتوح</span><h3>${q.text}</h3>
      <textarea id="ans" rows="4" placeholder="اكتب إجابتك هنا…">${answers[q.n] || ''}</textarea>
      <div class="row"><button class="btn green" id="save">💾 حفظ إجابتي</button><button class="btn secondary" id="hintb">💡 تلميح من الدرس</button></div>
      <div id="hint"></div><p class="note">لا تُصحَّح هذه الإجابة آليًا؛ تُحفظ على جهازك ليراجعها معلّمك.</p>`;
    K.$('#hintb').onclick = () => K.$('#hint').innerHTML = `<div class="g-explain">${q.hint}</div>`;
    K.$('#save').onclick = () => {
      const v = K.$('#ans').value.trim();
      if (v.length < 8) { K.bad(K.$('#ans'), 'اكتب إجابة أوضح (جملة كاملة)'); return; }
      answers[q.n] = v; K.store.set('adapt-open-answers', answers);
      K.ok(K.$('#ans'), 'حُفظت إجابتك ليراجعها المعلّم', 0); K.$('#save').disabled = true; complete(i);
    };
  }
}

function complete(i) {
  done.add(i); app.querySelector(`.seg[data-i="${i}"]`).classList.add('done'); updateLeft();
  if (done.size === N) {
    const list = L.filter(q => !q.auto).map(q => `<li><b>${q.text}</b><br>${(answers[q.n] || '').replace(/</g, '&lt;')}</li>`).join('');
    setTimeout(() => {
      const o = K.finish({ text: 'أجبت عن جميع أسئلة العجلة.', extra: `<div class="open"><h4>إجاباتك عن الأسئلة المفتوحة</h4><ol>${list}</ol><button class="btn secondary" onclick="window.print()">🖨 اطبع إجاباتي للمعلّم</button></div>` });
    }, K.t(1000));
  } else K.$('#spin').disabled = false;
}

updateLeft();

window.GameTest = {
  async ready() { if (!K.$('#panel .choice:not([disabled]), #panel #save:not([disabled])')) { spin(); while (spinning) await K.wait(20); } },
  async correct() {
    await this.ready(); const q = segs[cur].q;
    if (q.auto) K.$(`#panel .choice[data-j="${q.answer}"]`).click(); else { K.$('#ans').value = 'إجابة تجريبية من الطالب للاختبار'; K.$('#save').click(); }
  },
  async wrong() {
    await this.ready(); const q = segs[cur].q;
    if (q.auto) K.$(`#panel .choice:not([data-j="${q.answer}"])`).click(); else { K.$('#ans').value = ''; K.$('#save').click(); }
  },
  async solve() { while (!K.state.finished) { if (done.size < N) await this.correct(); await K.wait(60); } }
};
