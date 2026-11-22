// النشاط ٢: من يسكن أين؟ — سحب الكائن إلى موطنه، ثم إلى المكان الذي لا يستطيع العيش فيه
const K = Kit.init(2, { max: 8 });
const app = K.$('#app');
const H = ART.habitatIcons;

const rounds = [
  {
    prompt: 'اسحب كل كائن حيّ إلى موطنه الطبيعيّ',
    zones: [
      { id: 'water', name: 'الماء', icon: H.water },
      { id: 'soil', name: 'التربة', icon: H.soil },
      { id: 'savanna', name: 'مناطق السافانا في أفريقيا', icon: H.savanna },
      { id: 'desert', name: 'الصحراء', icon: H.desert }
    ],
    items: [
      { id: 'fish', name: 'الأسماك', art: ART.fish(), ans: 'water', why: 'تستطيع الأسماك العيش في الماء.' },
      { id: 'worm', name: 'ديدان الأرض', art: ART.worm(), ans: 'soil', why: 'تستطيع ديدان الأرض العيش في التربة.' },
      { id: 'giraffe', name: 'الزرافات', art: ART.giraffe(), ans: 'savanna', why: 'تستطيع الزرافات العيش في مناطق السافانا في أفريقيا.' },
      { id: 'fox', name: 'ثعلب الصحراء (الحصيني)', art: ART.fox(), ans: 'desert', why: 'يعيش الحصيني في الصحراء الحارّة ويصطاد في الليل.' },
      { id: 'cactus', name: 'الصبّار', art: ART.cactus(), ans: 'desert', why: 'يعيش الصبّار في الصحراء حيث يوجد الماء بكميّة قليلة.' }
    ]
  },
  {
    prompt: 'الجولة الثانية: أين لا يستطيع هذا الكائن أن يعيش؟',
    zones: [
      { id: 'land', name: 'اليابسة', icon: H.land },
      { id: 'trees', name: 'الأشجار', icon: H.trees },
      { id: 'arctic', name: 'القطب الشماليّ', icon: H.arctic }
    ],
    items: ADAPT.intro.map(x => ({
      id: x.id, name: x.name, art: x.id === 'fish' ? ART.fish() : x.id === 'worm' ? ART.worm() : ART.giraffe(),
      ans: { 'اليابسة': 'land', 'الأشجار': 'trees', 'القطب الشماليّ': 'arctic' }[x.cannot], why: x.sentence
    }))
  }
];

let ri = 0, round = null, done = 0, missed = new Set();

function render() {
  round = rounds[ri]; done = 0; missed = new Set();
  app.innerHTML = `
    <p class="g-prompt">${round.prompt}</p>
    <div class="tray" id="tray">${K.shuffle(round.items).map(it => `
      <div class="token" data-id="${it.id}" tabindex="0"><span class="pic">${it.art}</span><b>${it.name}</b></div>`).join('')}
    </div>
    <div class="zones z${round.zones.length}">${round.zones.map(z => `
      <div class="zone" data-drop data-id="${z.id}"><span class="zicon">${z.icon}</span><b>${z.name}</b><div class="got"></div></div>`).join('')}
    </div>
    <div id="why" class="why" aria-live="polite"></div>`;
  K.dragDrop({ items: [...app.querySelectorAll('.token')], targets: () => [...app.querySelectorAll('.zone')], onDrop: drop });
}

function drop(token, zone) {
  const it = round.items.find(i => i.id === token.dataset.id);
  if (token.dataset.done) return;
  if (zone.dataset.id === it.ans) {
    token.dataset.done = 1;
    K.ok(zone, null, missed.has(it.id) ? 0 : 1);
    setTimeout(() => zone.classList.remove('is-ok'), 700);
    zone.querySelector('.got').appendChild(token);
    token.classList.add('placed');
    K.$('#why').innerHTML = `<div class="g-explain">✔ ${it.why}</div>`;
    if (++done === round.items.length) {
      setTimeout(() => { if (++ri < rounds.length) { K.toast('انتقل إلى الجولة الثانية', 'info'); render(); } else K.finish({ text: 'لكلّ كائن حيّ موطن طبيعيّ يستطيع العيش فيه، وأماكن لا يستطيع العيش فيها.' }); }, K.t(1300));
    }
  } else {
    missed.add(it.id);
    K.bad(token, 'ليس هذا موطنه، حاول مرة أخرى');
  }
}

render();

window.GameTest = {
  next() { return [...app.querySelectorAll('.token:not([data-done])')][0]; },
  zoneFor(t) { const it = round.items.find(i => i.id === t.dataset.id); return app.querySelector(`.zone[data-id="${it.ans}"]`); },
  correct() { const t = this.next(); drop(t, this.zoneFor(t)); },
  wrong() { const t = this.next(); const z = [...app.querySelectorAll('.zone')].find(z => z !== this.zoneFor(t)); drop(t, z); },
  async solve() { while (!K.state.finished) { const t = this.next(); if (t) drop(t, this.zoneFor(t)); await K.wait(40); } }
};
