/*
 * رسوم SVG أصلية للمشروع (لا تُستخدم صور الكتاب المدرسي).
 * كل دالة تُرجع نص SVG. المعرّفات الداخلية فريدة لكل نسخة.
 * إحداثيات نقاط الأجزاء (ART.points) تُستخدم في الكتاب وفي ألعاب التسمية.
 */
(function () {
  let uid = 0;
  const id = p => `${p}${++uid}`;

  function fish(opts = {}) {
    const g = id('fg'), b = id('fb');
    return `<svg viewBox="0 0 420 220" class="art art-fish" role="img" aria-label="رسم سمكة">
  <defs>
    <linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1b5f9e"/><stop offset=".55" stop-color="#4fb0e8"/><stop offset="1" stop-color="#e3f4ff"/>
    </linearGradient>
    <linearGradient id="${b}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#2a7fc4"/><stop offset="1" stop-color="#155a96"/>
    </linearGradient>
  </defs>
  <path class="part-tail" d="M316 106 L398 46 Q382 106 398 166 Z" fill="url(#${b})"/>
  <path class="part-fins" d="M148 64 C170 22 222 24 240 70 Z" fill="url(#${b})"/>
  <path d="M228 142 C244 166 268 168 276 154 L256 136 Z" fill="url(#${b})"/>
  <path class="part-body" d="M28 112 C60 58 172 46 286 82 C304 90 316 98 328 106 C316 114 304 122 286 130 C172 166 60 166 28 112 Z" fill="url(#${g})" stroke="#164f84" stroke-width="2.5"/>
  <path d="M120 70 Q190 58 260 82" fill="none" stroke="#ffffff" stroke-opacity=".35" stroke-width="6" stroke-linecap="round"/>
  <path class="part-gills" d="M92 78 C110 100 110 126 94 148" fill="none" stroke="#123f6b" stroke-width="4" stroke-linecap="round"/>
  <path d="M104 84 C118 102 118 124 106 142" fill="none" stroke="#123f6b" stroke-opacity=".45" stroke-width="2.5" stroke-linecap="round"/>
  <path class="part-lateral" d="M112 110 C180 104 250 104 318 106" fill="none" stroke="#0e3558" stroke-width="2.5" stroke-dasharray="7 6"/>
  <path d="M118 126 C140 152 166 160 178 150 C162 140 142 130 118 126 Z" fill="#2b86c9" stroke="#164f84" stroke-width="2"/>
  <circle cx="60" cy="100" r="11" fill="#fff" stroke="#123f6b" stroke-width="2"/>
  <circle cx="58" cy="100" r="5.5" fill="#0b2238"/><circle cx="56" cy="98" r="1.8" fill="#fff"/>
  <path d="M30 116 Q40 120 48 118" fill="none" stroke="#123f6b" stroke-width="2.5" stroke-linecap="round"/>
  ${opts.bubbles ? '<g fill="none" stroke="#7cc6f2" stroke-width="2"><circle cx="18" cy="70" r="6"/><circle cx="10" cy="44" r="4"/><circle cx="22" cy="24" r="3"/></g>' : ''}
</svg>`;
  }

  function fox() {
    const f = id('xf'), t = id('xt');
    return `<svg viewBox="0 0 400 380" class="art art-fox" role="img" aria-label="رسم ثعلب الصحراء">
  <defs>
    <linearGradient id="${f}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8a957"/><stop offset="1" stop-color="#f3cf93"/></linearGradient>
    <linearGradient id="${t}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9ae5f"/><stop offset=".8" stop-color="#d68f3c"/><stop offset="1" stop-color="#3b2714"/></linearGradient>
  </defs>
  <ellipse cx="205" cy="352" rx="165" ry="12" fill="#000" opacity=".08"/>
  <path class="part-color" d="M290 200 C340 170 392 190 390 238 C388 270 350 282 318 262 C300 250 292 228 290 200 Z" fill="url(#${t})"/>
  <rect x="258" y="236" width="24" height="96" rx="11" fill="#e2a45a"/>
  <rect x="286" y="232" width="22" height="98" rx="10" fill="#d69a52"/>
  <path class="part-fur" d="M110 210 C120 160 200 150 270 168 C312 178 318 236 290 256 C250 282 160 284 126 262 C108 250 104 232 110 210 Z" fill="url(#${f})"/>
  <path d="M150 196 C170 182 230 178 270 188" fill="none" stroke="#c98a3f" stroke-width="3" stroke-linecap="round" opacity=".5"/>
  <rect class="part-legs" x="132" y="240" width="24" height="94" rx="11" fill="#eab66d"/>
  <rect x="162" y="244" width="24" height="90" rx="11" fill="#e2aa60"/>
  <g class="part-paws" fill="#f7e3bf" stroke="#c9944e" stroke-width="2">
    <ellipse cx="144" cy="336" rx="17" ry="9"/><ellipse cx="174" cy="336" rx="17" ry="9"/>
    <ellipse cx="270" cy="334" rx="16" ry="8"/><ellipse cx="297" cy="332" rx="15" ry="8"/>
  </g>
  <path d="M108 196 C112 236 150 250 176 230 C182 214 170 192 150 186 Z" fill="#fbf0dc"/>
  <g class="part-ears">
    <path d="M76 132 L40 22 C70 30 106 70 116 108 Z" fill="#e8a957" stroke="#c98a3f" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M78 120 L54 40 C76 50 98 78 104 104 Z" fill="#f8d9c4"/>
    <path d="M140 108 C152 70 186 32 214 22 L182 132 Z" fill="#e8a957" stroke="#c98a3f" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M152 104 C160 78 180 52 200 40 L178 120 Z" fill="#f8d9c4"/>
  </g>
  <path d="M70 140 C70 104 110 92 128 92 C148 92 188 104 188 140 C188 168 160 196 128 206 C96 196 70 168 70 140 Z" fill="url(#${f})" stroke="#c98a3f" stroke-width="2"/>
  <path d="M96 160 C104 186 118 200 128 206 C138 200 152 186 160 160 C146 168 110 168 96 160 Z" fill="#fbf0dc"/>
  <g class="part-eyes">
    <path d="M94 140 Q106 128 118 140 Q106 150 94 140 Z" fill="#2b1a0c"/>
    <path d="M138 140 Q150 128 162 140 Q150 150 138 140 Z" fill="#2b1a0c"/>
    <circle cx="109" cy="138" r="2.2" fill="#fff"/><circle cx="153" cy="138" r="2.2" fill="#fff"/>
  </g>
  <ellipse cx="128" cy="190" rx="9" ry="6.5" fill="#2b1a0c"/>
  <path d="M128 196 L128 202 M120 204 Q128 209 136 204" fill="none" stroke="#2b1a0c" stroke-width="2" stroke-linecap="round"/>
</svg>`;
  }

  // parts: مصفوفة الأجزاء الظاهرة ['stem','spines','roots'] (الافتراضي: الكل)
  function cactus(parts) {
    const show = p => !parts || parts.includes(p);
    const s = id('cs'), d = id('cd'), st = id('cst');
    const spine = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 0 L-9 -5 M0 0 L9 -5 M0 0 L0 -10"/></g>`;
    const spines = [[150, 82, 0], [138, 110, -10], [162, 112, 10], [148, 142, 0], [136, 170, -12], [163, 176, 10], [149, 200, 0], [104, 120, -30], [98, 150, -20], [196, 98, 30], [200, 130, 20]]
      .map(a => spine(...a)).join('');
    return `<svg viewBox="0 0 300 420" class="art art-cactus" role="img" aria-label="رسم نبات الصبّار">
  <defs>
    <linearGradient id="${s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7dfa6"/><stop offset="1" stop-color="#e9c47c"/></linearGradient>
    <linearGradient id="${d}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c79a5f"/><stop offset="1" stop-color="#8a6236"/></linearGradient>
    <linearGradient id="${st}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2f8f47"/><stop offset=".5" stop-color="#5cc46f"/><stop offset="1" stop-color="#2b7f40"/></linearGradient>
  </defs>
  <rect x="0" y="214" width="300" height="206" fill="url(#${d})"/>
  <g fill="#6f4c28" opacity=".35"><circle cx="40" cy="260" r="3"/><circle cx="250" cy="300" r="4"/><circle cx="80" cy="360" r="3"/><circle cx="220" cy="380" r="2.5"/><circle cx="270" cy="240" r="2.5"/></g>
  <path d="M0 214 C60 200 110 222 150 212 C200 200 250 222 300 210 L300 228 L0 228 Z" fill="url(#${s})"/>
  ${show('roots') ? `<g class="part-roots" fill="none" stroke="#f5ead2" stroke-width="4" stroke-linecap="round">
    <path d="M150 224 C148 270 156 320 146 404"/><path d="M146 300 C128 330 112 350 104 392"/><path d="M152 280 C176 318 188 350 196 398"/>
    <path d="M140 228 C110 236 70 238 30 250"/><path d="M160 228 C196 236 236 240 276 252"/><path d="M104 392 L96 410 M146 404 L150 416 M196 398 L204 412"/>
  </g>` : ''}
  ${show('stem') ? `<g class="part-stem">
    <path d="M110 150 C88 150 84 128 84 104 C84 92 102 92 102 104 C102 124 104 132 116 132 Z" fill="url(#${st})" stroke="#1f6b33" stroke-width="2"/>
    <path d="M188 128 C212 128 216 106 216 82 C216 70 198 70 198 82 C198 100 196 110 184 110 Z" fill="url(#${st})" stroke="#1f6b33" stroke-width="2"/>
    <rect x="118" y="64" width="64" height="156" rx="32" fill="url(#${st})" stroke="#1f6b33" stroke-width="2.5"/>
    <path d="M136 76 L136 214 M150 66 L150 218 M164 76 L164 214" stroke="#1f6b33" stroke-width="2" opacity=".45"/>
    <circle cx="150" cy="60" r="9" fill="#ff7aa8"/><circle cx="150" cy="60" r="3.5" fill="#ffd34d"/>
  </g>` : ''}
  ${show('spines') ? `<g class="part-spines" stroke="#5b4a2a" stroke-width="1.8" stroke-linecap="round">${spines}</g>` : ''}
</svg>`;
  }

  function eagle() {
    return `<svg viewBox="0 0 300 300" class="art art-eagle" role="img" aria-label="رسم عُقاب السهول">
  <rect x="0" y="226" width="300" height="74" rx="10" fill="#b89c7d"/>
  <path d="M0 236 Q150 220 300 236" fill="none" stroke="#9a7f62" stroke-width="3"/>
  <path d="M120 120 C100 170 104 210 130 236 L196 236 C214 200 212 150 186 116 Z" fill="#7a5532"/>
  <path d="M176 120 C214 140 230 196 214 244 L186 236 C196 196 190 150 168 128 Z" fill="#5e3f22"/>
  <path d="M150 236 L170 280 L190 236 Z" fill="#4e331b"/>
  <circle cx="152" cy="96" r="34" fill="#8b6239"/>
  <path d="M120 98 C112 82 128 66 146 64" fill="none" stroke="#a7794a" stroke-width="5" stroke-linecap="round"/>
  <path d="M122 92 C104 92 96 104 98 116 C104 112 112 110 120 112 Z" fill="#f2b630"/>
  <path d="M98 116 C100 124 106 126 110 120" fill="none" stroke="#3a2a12" stroke-width="2.5"/>
  <circle cx="136" cy="88" r="6" fill="#f8d23d"/><circle cx="135" cy="88" r="3" fill="#1d1208"/>
  <g stroke="#f2b630" stroke-width="5" stroke-linecap="round"><path d="M140 236 L136 250 M154 236 L156 250 M176 236 L176 250"/></g>
</svg>`;
  }

  function worm() {
    return `<svg viewBox="0 0 200 120" class="art art-worm" role="img" aria-label="رسم دودة الأرض">
  <rect x="0" y="60" width="200" height="60" rx="8" fill="#9b6b3f"/>
  <path d="M20 86 C50 56 80 110 110 82 C140 54 160 96 182 78" fill="none" stroke="#e98b9a" stroke-width="16" stroke-linecap="round"/>
  <path d="M60 80 L62 92 M92 92 L94 80 M128 70 L130 82" stroke="#c96677" stroke-width="2.5"/>
  <circle cx="182" cy="76" r="2" fill="#4a2a2f"/>
</svg>`;
  }

  function giraffe() {
    return `<svg viewBox="0 0 200 220" class="art art-giraffe" role="img" aria-label="رسم زرافة">
  <path d="M60 140 C60 110 150 110 160 140 L160 160 L60 160 Z" fill="#f3c25a"/>
  <path d="M138 130 L150 40 L168 40 L162 136 Z" fill="#f3c25a"/>
  <ellipse cx="166" cy="34" rx="22" ry="13" fill="#f3c25a"/>
  <path d="M154 22 L152 10 M166 21 L168 9" stroke="#8a5a1c" stroke-width="4" stroke-linecap="round"/>
  <circle cx="170" cy="31" r="2.8" fill="#2b1a0c"/>
  <g fill="#b9782b"><circle cx="84" cy="132" r="8"/><circle cx="108" cy="126" r="7"/><circle cx="132" cy="138" r="7"/><circle cx="152" cy="100" r="5"/><circle cx="156" cy="70" r="5"/><circle cx="98" cy="148" r="6"/></g>
  <g fill="#e6b04a"><rect x="66" y="156" width="12" height="54" rx="5"/><rect x="88" y="156" width="12" height="54" rx="5"/><rect x="130" y="156" width="12" height="54" rx="5"/><rect x="148" y="156" width="12" height="54" rx="5"/></g>
  <path d="M60 140 C48 150 44 166 46 176" fill="none" stroke="#b9782b" stroke-width="4" stroke-linecap="round"/>
</svg>`;
  }

  // أيقونات المواطن كما وردت في الدرس
  const habitatIcons = {
    water: `<svg viewBox="0 0 120 80" class="art hab"><rect width="120" height="80" rx="12" fill="#bfe6ff"/><path d="M0 34 Q15 26 30 34 T60 34 T90 34 T120 34 V80 H0Z" fill="#4fb0e8"/><path d="M0 52 Q15 44 30 52 T60 52 T90 52 T120 52 V80 H0Z" fill="#1f8fd6"/></svg>`,
    soil: `<svg viewBox="0 0 120 80" class="art hab"><rect width="120" height="80" rx="12" fill="#8a6236"/><rect width="120" height="22" rx="12" fill="#7cc576"/><g fill="#6f4c28"><circle cx="20" cy="44" r="4"/><circle cx="64" cy="58" r="5"/><circle cx="96" cy="40" r="3"/><circle cx="40" cy="68" r="3"/></g></svg>`,
    savanna: `<svg viewBox="0 0 120 80" class="art hab"><rect width="120" height="80" rx="12" fill="#ffe7a8"/><circle cx="96" cy="20" r="10" fill="#ffb627"/><rect y="56" width="120" height="24" rx="12" fill="#d9b44a"/><rect x="40" y="30" width="5" height="28" fill="#7a5532"/><ellipse cx="42" cy="28" rx="26" ry="7" fill="#5e9e3a"/></svg>`,
    desert: `<svg viewBox="0 0 120 80" class="art hab"><rect width="120" height="80" rx="12" fill="#ffd9a0"/><circle cx="30" cy="22" r="12" fill="#ff9f1c"/><path d="M0 60 Q35 36 70 58 T120 52 V80 H0Z" fill="#e9b264"/><path d="M0 70 Q50 54 120 68 V80 H0Z" fill="#d89a47"/></svg>`,
    land: `<svg viewBox="0 0 120 80" class="art hab"><rect width="120" height="80" rx="12" fill="#dff3d2"/><path d="M0 50 Q60 36 120 50 V80 H0Z" fill="#8fc96b"/><path d="M14 50 l4 -10 l4 10 M90 46 l4 -10 l4 10" stroke="#4d8a33" stroke-width="3" fill="none"/></svg>`,
    trees: `<svg viewBox="0 0 120 80" class="art hab"><rect width="120" height="80" rx="12" fill="#e1f5e0"/><rect x="54" y="40" width="12" height="34" fill="#7a5532"/><circle cx="60" cy="32" r="22" fill="#3f9b4b"/><circle cx="44" cy="40" r="13" fill="#4fb05b"/><circle cx="76" cy="40" r="13" fill="#4fb05b"/></svg>`,
    arctic: `<svg viewBox="0 0 120 80" class="art hab"><rect width="120" height="80" rx="12" fill="#dcefff"/><path d="M0 58 L30 40 L52 54 L78 34 L120 56 V80 H0Z" fill="#ffffff" stroke="#a8cde8" stroke-width="2"/><g stroke="#7fb3dc" stroke-width="2.5" stroke-linecap="round"><path d="M96 10 v16 M88 18 h16 M90 12 l12 12 M102 12 l-12 12"/></g></svg>`
  };

  // نقاط الأجزاء على الرسوم (بوحدات viewBox) لألعاب التسمية وللكتاب
  const points = {
    fish: { gills: [100, 113], fins: [194, 46], tail: [372, 106], body: [140, 76], lateral: [262, 105] },
    fox: { ears: [60, 50], eyes: [150, 140], legs: [144, 282], paws: [174, 338], fur: [228, 214], color: [352, 222] },
    cactus: { stem: [150, 150], spines: [200, 98], roots: [184, 340] }
  };

  window.ART = { fish, fox, cactus, eagle, worm, giraffe, habitatIcons, points };
})();
