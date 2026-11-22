// النشاط ٥: أسرار الحصيني — اسحب اسم وسيلة التكيّف إلى بطاقة وظيفتها
const K = Kit.init(5, { max: 6 });
const app = K.$('#app');
const fox = ADAPT.organism('fox');
const P = ART.points.fox;
const nums = Object.fromEntries(fox.features.map((f, i) => [f.id, i + 1]));
const missed = new Set();
let done = 0;

app.innerHTML = `
  <p class="g-prompt">${fox.intro}<br><small>اسحب كل اسم إلى بطاقة الوظيفة المناسبة. الأرقام على الرسم تدلّك على مكان كل وسيلة.</small></p>
  <div class="layout">
    <div class="scene">
      <div class="moon" aria-hidden="true"></div>
      <div class="foxwrap">${ART.fox()}
        ${fox.features.map(f => `<span class="num" data-for="${f.id}" style="left:${P[f.id][0] / 400 * 100}%;top:${P[f.id][1] / 380 * 100}%">${K.num(nums[f.id])}</span>`).join('')}
      </div>
    </div>
    <div class="slots">${fox.features.map(f => `
      <div class="slot" data-drop data-id="${f.id}"><span class="n">${K.num(nums[f.id])}</span><p>${f.role}</p><b class="ans">اسحب الاسم هنا</b></div>`).join('')}
    </div>
  </div>
  <div class="chips">${K.shuffle(fox.features).map(f => `<span class="chip" data-id="${f.id}" tabindex="0">${f.name}</span>`).join('')}</div>
  <div id="explain" aria-live="polite"></div>`;

function drop(chip, slot) {
  if (chip.dataset.done || slot.dataset.done) return;
  const f = ADAPT.feature(slot.dataset.id);
  if (chip.dataset.id === f.id) {
    chip.dataset.done = slot.dataset.done = 1;
    slot.querySelector('.ans').textContent = f.name;
    chip.remove();
    K.ok(slot, null, missed.has(f.id) ? 0 : 1);
    app.querySelector(`.num[data-for="${f.id}"]`).classList.add('found');
    app.querySelector('.foxwrap svg').querySelector(`.part-${f.id}`)?.classList.add('glow');
    K.$('#explain').innerHTML = `<div class="g-explain">✔ ${f.text}</div>`;
    if (++done === fox.features.length) setTimeout(() => K.finish({ text: 'تعرّفت على وسائل تكيُّف الحصيني التي تساعده على العيش في الصحراء الحارّة والصيد في الليل.' }), K.t(1400));
  } else {
    missed.add(f.id); K.bad(slot, 'هذه البطاقة لوظيفة أخرى');
  }
}

K.dragDrop({ items: [...app.querySelectorAll('.chip')], targets: () => [...app.querySelectorAll('.slot')], onDrop: drop });

window.GameTest = {
  chip() { return app.querySelector('.chip:not([data-done])'); },
  correct() { const c = this.chip(); drop(c, app.querySelector(`.slot[data-id="${c.dataset.id}"]`)); },
  wrong() { const c = this.chip(); drop(c, app.querySelector(`.slot:not([data-done]):not([data-id="${c.dataset.id}"])`)); },
  async solve() { while (!K.state.finished) { if (this.chip()) this.correct(); await K.wait(40); } }
};
