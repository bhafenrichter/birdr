// Birdr design tokens — derived from PRD §18.1
// Modern field-guide aesthetic: warm, naturalist, illustrated.
// Two themes; conservation tier frames (LC/NT/VU/EN/CR) stay constant
// across themes since IUCN colors are semantic.

const T_FIELDGUIDE = {
  // Surfaces
  cream:       '#FAF7F0',
  paper:       '#F4EFE4',
  ink:         '#2C2C2A',
  inkSoft:     '#5F5E5A',
  inkFaint:    '#9A968E',
  line:        '#E7E1D1',

  // Brand
  sage:        '#3B6D11',
  sageLight:   '#7BA85F',
  sageTint:    '#E4ECDB',
  sageDeep:    '#2A4F0B',

  saffron:     '#EF9F27',
  saffronLight:'#FAC775',
  saffronTint: '#FBEED3',
  saffronDeep: '#C77E12',

  coral:       '#D85A30',
  coralLight:  '#E88766',
  coralTint:   '#F8DDD1',
  coralDeep:   '#993C1D',

  sky:         '#85B7EB',
  skyLight:    '#B5D4F4',
  skyTint:     '#DFEBF7',
  skyDeep:     '#3F7DB8',

  // Achievement category accents
  cat: {
    collection: '#3B6D11',
    streaks:    '#D85A30',
    regional:   '#3F7DB8',
    family:     '#7A4DAA',
    habitat:    '#0F8C82',
  },
};

const T_VIVID = {
  // Soft mint surfaces inspired by AR collection-game UI:
  // pale green gradient base, cyan-teal chrome, translucent gradient pills.
  cream:       '#EAF5E5',
  paper:       '#DDEED7',
  ink:         '#1B3937',
  inkSoft:     '#4A6E6A',
  inkFaint:    '#8AA4A0',
  line:        '#CFE3CB',

  // Deep teal primary (per active selected color)
  sage:        '#008D8F',
  sageLight:   '#5DC79C',
  sageGrad:    'linear-gradient(135deg, #008D8F 0%, #5DC79C 100%)',
  sageTint:    '#D6EEEE',
  sageDeep:    '#00595B',

  // Saffron → warm coral-gold for accents (keeps street-light readability)
  saffron:     '#FFB347',
  saffronLight:'#FFD18A',
  saffronTint: '#FFEBCB',
  saffronDeep: '#B86B00',

  // CTA red — Pokeball-leaning vermillion
  coral:       '#E84B4B',
  coralLight:  '#F38787',
  coralTint:   '#FBDADA',
  coralDeep:   '#A82020',

  // Cyan-teal "sky"
  sky:         '#4FBDC0',
  skyLight:    '#8FD5D7',
  skyTint:     '#D7EEEF',
  skyDeep:     '#1F7F82',

  cat: {
    collection: '#008D8F',
    streaks:    '#E84B4B',
    regional:   '#4FBDC0',
    family:     '#9B6FE0',
    habitat:    '#26A599',
  },
};

// Constants across both themes — IUCN conservation status colors.
const T_CONSERVATION = {
  lc:          '#EFC027',
  nt:          '#E89A3B',
  vu:          '#D85A30',
  en:          '#A53A1F',
  cr:          '#6B1A12',
  lcBadge:     '#69A444',
  ntBadge:     '#B2A53A',
  vuBadge:     '#E29C2A',
  enBadge:     '#D85A30',
  crBadge:     '#993C1D',
};

const T = {
  ...T_FIELDGUIDE,
  ...T_CONSERVATION,
  font: '"Plus Jakarta Sans", -apple-system, system-ui, sans-serif',
  shadow: {
    sm: '0 1px 2px rgba(40,30,20,.06), 0 2px 6px rgba(40,30,20,.04)',
    md: '0 4px 12px rgba(40,30,20,.08), 0 12px 32px rgba(40,30,20,.06)',
    lg: '0 12px 36px rgba(40,30,20,.16), 0 36px 80px rgba(40,30,20,.12)',
  },
  themeName: 'fieldguide',
};

// Swap the palette in place; fire an event so the app re-renders.
function applyTheme(name) {
  const next = name === 'vivid' ? T_VIVID : T_FIELDGUIDE;
  for (const k of Object.keys(T_FIELDGUIDE)) delete T[k];
  Object.assign(T, next);
  T.themeName = name;
  window.dispatchEvent(new Event('birdr-theme'));
}

// Inject Plus Jakarta Sans + a default rule so every screen picks it up.
if (typeof document !== 'undefined' && !document.getElementById('birdr-fonts')) {
  const link = document.createElement('link');
  link.id = 'birdr-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap';
  document.head.appendChild(link);

  const css = document.createElement('style');
  css.id = 'birdr-base';
  css.textContent = `
    .birdr { font-family: ${T.font}; color: ${T.ink};
      -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;
      font-feature-settings: "tnum" 1, "ss01" 1; letter-spacing: -0.005em; }
    .birdr * { box-sizing: border-box; }
    .birdr button { font-family: inherit; }
    .tnum { font-variant-numeric: tabular-nums; }
    @keyframes birdr-spin { to { transform: rotate(360deg); } }
    @keyframes birdr-pulse { 0%,100% { opacity: 1; } 50% { opacity: .55; } }
    @keyframes birdr-capture-pulse {
      0%, 100% { transform: scale(1); }
      50%      { transform: scale(1.06); }
    }
    @keyframes birdr-capture-ring {
      0%, 100% { transform: scale(1); opacity: 0.4; }
      50%      { transform: scale(1.12); opacity: 0.05; }
    }
  `;
  document.head.appendChild(css);
}

window.T = T;
window.applyTheme = applyTheme;
