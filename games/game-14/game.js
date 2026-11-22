// النشاط ١٤: الباحث الصغير — تنفيذ نشاط ٧-١ (الطالب هو من يُدخل المعلومات)
const K = Kit.init(14, { max: 5 });
const app = K.$('#app');
const steps = ADAPT.activity.steps;
const S = Object.assign({ name: '', type: 'حيوان', habitat: '', image: '', labels: [] }, K.store.get('adapt-research', {}));
let step = 0, rewarded = new Set(), drawn = !!S.image;
const save = () => K.store.set('adapt-research', S);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

app.innerHTML = `
  <ol class="stepper">${steps.map((_, i) => `<li data-s="${i}"><span>${K.num(i + 1)}</span></li>`).join('')}</ol>
  <div class="card step" id="step"></div>
  <div class="nav"><button class="btn secondary" id="prev">→ السابق</button><button class="btn green" id="next">التالي ←</button></div>`;

function render() {
  app.querySelectorAll('.stepper li').forEach((li, i) => { li.classList.toggle('on', i === step); li.classList.toggle('ok', rewarded.has(i)); });
  K.$('#prev').disabled = step === 0;
  K.$('#next').textContent = step === 4 ? '✔ أنهيت المشروع' : 'التالي ←';
  const box = K.$('#step');
  const head = `<p class="task"><b>الخطوة ${K.num(step + 1)}:</b> ${steps[step]}</p>`;
  if (step === 0) box.innerHTML = head + `
    <label class="fld">اسم الكائن الحيّ الذي اخترته<input id="name" value="${esc(S.name)}" placeholder="اكتب اسم حيوان أو نبات يعيش في عُمان"></label>
    <div class="radios">${['حيوان', 'نبات'].map(t => `<label><input type="radio" name="type" value="${t}" ${S.type === t ? 'checked' : ''}> ${t === 'حيوان' ? '🐾' : '🌿'} ${t}</label>`).join('')}</div>`;
  if (step === 1) box.innerHTML = head + `
    <label class="fld">صِف الموطن الطبيعيّ لـ ${esc(S.name || 'الكائن')}<textarea id="habitat" rows="5" placeholder="أين يعيش؟ كيف يبدو المكان؟ هل هو حارّ أم بارد؟ هل فيه ماء كثير أم قليل؟">${esc(S.habitat)}</textarea></label>
    <p class="note">💡 ابحث في كتابك أو في مصدر موثوق، واكتب بأسلوبك.</p>`;
  if (step === 2) {
    box.innerHTML = head + `
      <div class="tools"><span>القلم:</span>${['#1d2a3a', '#e8892b', '#3aa856', '#1f8fd6', '#e0457b', '#8a6236'].map((c, i) => `<button class="pen${i ? '' : ' on'}" data-c="${c}" style="background:${c}" aria-label="لون"></button>`).join('')}
        <button class="btn secondary sm" id="eraser">🧽 ممحاة</button><button class="btn secondary sm" id="clear">🗑 مسح</button>
        <label class="btn water sm">📷 صورة<input type="file" accept="image/*" capture="environment" id="file" hidden></label></div>
      <canvas id="pad" width="800" height="560"></canvas>`;
    setupPad();
  }
  if (step === 3) {
    box.innerHTML = head + `
      <div class="addlbl"><input id="lbl" placeholder="مثال: ميزة … تساعده على …"><button class="btn sand" id="add">＋ أضف ملصقًا</button></div>
      <p class="note">اسحب الملصقات لتضعها على الجزء المناسب من الرسم. انقر ✕ لحذف ملصق.</p>
      <div class="poster-pic" id="pic"></div>`;
    drawPic(K.$('#pic'), true);
    K.$('#add').onclick = () => {
      const v = K.$('#lbl').value.trim(); if (v.length < 3) return K.bad(K.$('#lbl'), 'اكتب نص الملصق أولًا');
      S.labels.push({ t: v, x: 10 + (S.labels.length * 13) % 60, y: 10 + (S.labels.length * 17) % 70 }); save();
      K.$('#lbl').value = ''; drawPic(K.$('#pic'), true); K.sound.pop();
    };
    K.$('#lbl').onkeydown = e => { if (e.key === 'Enter') K.$('#add').click(); };
  }
  if (step === 4) {
    box.innerHTML = head + `<div class="poster" id="poster">
        <h2>${S.type === 'نبات' ? '🌿' : '🐾'} ${esc(S.name)}</h2>
        <p><b>الموطن الطبيعيّ:</b> ${esc(S.habitat)}</p>
        <div class="poster-pic" id="pic"></div>
        <p class="by">مشروع: إجراء بحث حول التكيُّف — نشاط ٧-١</p></div>
      <div class="row"><button class="btn" onclick="window.print()">🖨 اطبع الملصق</button><button class="btn water" id="png">⬇ احفظ صورة</button></div>
      <p class="note">🎤 الآن قدّم عرضًا عن وسائل تكيُّف ${esc(S.name)} أمام زملائك.</p>`;
    drawPic(K.$('#pic'), false);
    K.$('#png').onclick = exportPNG;
  }
}

function setupPad() {
  const c = K.$('#pad'), x = c.getContext('2d');
  let color = '#1d2a3a', erase = false, down = false, last = null;
  x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
  if (S.image) { const im = new Image(); im.onload = () => x.drawImage(im, 0, 0, c.width, c.height); im.src = S.image; }
  const pos = e => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * c.width / r.width, (e.clientY - r.top) * c.height / r.height]; };
  c.onpointerdown = e => { down = true; last = pos(e); c.setPointerCapture(e.pointerId); };
  c.onpointermove = e => {
    if (!down) return; const p = pos(e);
    x.strokeStyle = erase ? '#fff' : color; x.lineWidth = erase ? 28 : 6; x.lineCap = x.lineJoin = 'round';
    x.beginPath(); x.moveTo(...last); x.lineTo(...p); x.stroke(); last = p; drawn = true;
  };
  c.onpointerup = c.onpointercancel = () => { if (down) { down = false; S.image = c.toDataURL('image/jpeg', .85); save(); } };
  app.querySelectorAll('.pen').forEach(b => b.onclick = () => { color = b.dataset.c; erase = false; app.querySelectorAll('.pen').forEach(p => p.classList.toggle('on', p === b)); });
  K.$('#eraser').onclick = () => { erase = true; };
  K.$('#clear').onclick = () => { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); S.image = ''; drawn = false; save(); };
  K.$('#file').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => { const im = new Image(); im.onload = () => {
      const s = Math.min(c.width / im.width, c.height / im.height), w = im.width * s, h = im.height * s;
      x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, (c.width - w) / 2, (c.height - h) / 2, w, h);
      S.image = c.toDataURL('image/jpeg', .85); drawn = true; save(); K.toast('أُضيفت الصورة', 'ok');
    }; im.src = rd.result; };
    rd.readAsDataURL(f);
  };
}

function drawPic(box, editable) {
  box.innerHTML = (S.image ? `<img src="${S.image}" alt="رسم ${esc(S.name)}">` : '<div class="empty">لا يوجد رسم بعد</div>') +
    S.labels.map((l, i) => `<span class="sticker${editable ? ' edit' : ''}" data-i="${i}" style="left:${l.x}%;top:${l.y}%">${esc(l.t)}${editable ? `<button aria-label="حذف" data-del="${i}">✕</button>` : ''}</span>`).join('');
  if (!editable) return;
  box.querySelectorAll('[data-del]').forEach(b => b.onclick = e => { e.stopPropagation(); S.labels.splice(+b.dataset.del, 1); save(); drawPic(box, true); });
  box.querySelectorAll('.sticker').forEach(st => {
    st.onpointerdown = e => {
      if (e.target.dataset.del) return;
      e.preventDefault(); st.setPointerCapture(e.pointerId);
      const r = box.getBoundingClientRect();
      st.onpointermove = ev => {
        const l = S.labels[st.dataset.i];
        l.x = Math.max(0, Math.min(85, (ev.clientX - r.left) / r.width * 100 - 5)); l.y = Math.max(0, Math.min(92, (ev.clientY - r.top) / r.height * 100 - 3));
        st.style.left = l.x + '%'; st.style.top = l.y + '%';
      };
      st.onpointerup = () => { st.onpointermove = null; save(); };
    };
  });
}

function exportPNG() {
  const c = document.createElement('canvas'); c.width = 900; c.height = 1100;
  const x = c.getContext('2d'); x.direction = 'rtl'; x.textAlign = 'right';
  x.fillStyle = '#fffdf8'; x.fillRect(0, 0, 900, 1100);
  x.fillStyle = '#3aa856'; x.fillRect(0, 0, 900, 16);
  x.fillStyle = '#1d2a3a'; x.font = '900 46px Cairo, Tahoma'; x.fillText(S.name, 860, 90);
  x.font = '600 24px Cairo, Tahoma';
  const lines = wrap(x, 'الموطن الطبيعيّ: ' + S.habitat, 820); lines.slice(0, 5).forEach((l, i) => x.fillText(l, 860, 140 + i * 38));
  const top = 140 + Math.min(lines.length, 5) * 38 + 20;
  const finish = () => {
    S.labels.forEach(l => {
      x.font = '800 22px Cairo, Tahoma'; const w = Math.min(x.measureText(l.t).width + 28, 500);
      const px = 40 + l.x / 100 * 820, py = top + l.y / 100 * 574;
      x.fillStyle = '#ffc93c'; x.beginPath(); x.roundRect(px, py, w, 42, 12); x.fill();
      x.fillStyle = '#1d2a3a'; x.fillText(l.t, px + w - 14, py + 29, w - 28);
    });
    x.fillStyle = '#4a5a70'; x.font = '600 20px Cairo, Tahoma'; x.fillText('مشروع: إجراء بحث حول التكيُّف — نشاط ٧-١', 860, 1070);
    const a = document.createElement('a'); a.download = 'ملصق-التكيف.png'; a.href = c.toDataURL('image/png'); a.click();
  };
  if (S.image) { const im = new Image(); im.onload = () => { x.drawImage(im, 40, top, 820, 574); finish(); }; im.src = S.image; } else finish();
}
function wrap(x, text, max) {
  const words = text.split(/\s+/), out = []; let line = '';
  words.forEach(w => { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > max && line) { out.push(line); line = w; } else line = t; });
  if (line) out.push(line); return out;
}

function validate() {
  if (step === 0) { S.name = K.$('#name').value.trim(); S.type = app.querySelector('[name=type]:checked').value; save(); if (S.name.length < 2) return 'اكتب اسم الكائن الحيّ'; }
  if (step === 1) { S.habitat = K.$('#habitat').value.trim(); save(); if (S.habitat.length < 10) return 'صِف الموطن الطبيعيّ بجملة كاملة على الأقل'; }
  if (step === 2 && !drawn && !S.image) return 'ارسم الكائن الحيّ أو أضف صورة له';
  if (step === 3 && S.labels.length < 2) return 'أضف ملصقين على الأقل لوسائل التكيُّف';
  return '';
}

K.$('#next').onclick = () => {
  const err = validate();
  if (err) { K.bad(K.$('#step'), err); return; }
  if (!rewarded.has(step)) { rewarded.add(step); K.ok(null, step === 4 ? 'رائع! مشروعك جاهز للعرض' : 'خطوة مكتملة!'); } else K.sound.flip();
  if (step < 4) { step++; render(); }
  else K.finish({ title: 'أنت باحث رائع! 🔍', text: `أنجزت بحثك عن تكيُّف ${esc(S.name)}. اطبع الملصق واعرضه أمام زملائك.` });
};
K.$('#prev').onclick = () => { if (step > 0) { if (step < 3) validate(); step--; render(); } };

render();

window.GameTest = {
  fill() {
    if (step === 0) K.$('#name').value = 'كائن تجريبي';
    if (step === 1) K.$('#habitat').value = 'وصف تجريبي للموطن الطبيعي للاختبار';
    if (step === 2) { const c = K.$('#pad').getContext('2d'); c.fillStyle = '#3aa856'; c.fillRect(100, 100, 200, 200); S.image = K.$('#pad').toDataURL(); drawn = true; }
    if (step === 3) { K.$('#lbl').value = 'ملصق تجريبي أول'; K.$('#add').click(); K.$('#lbl').value = 'ملصق تجريبي ثانٍ'; K.$('#add').click(); }
  },
  correct() { this.fill(); K.$('#next').click(); },
  wrong() {
    if (step === 0) K.$('#name').value = ''; if (step === 1) K.$('#habitat').value = '';
    if (step === 2) { drawn = false; S.image = ''; } if (step === 3) S.labels = [];
    K.$('#next').click();
  },
  async solve() { while (!K.state.finished) { this.correct(); await K.wait(40); } }
};
