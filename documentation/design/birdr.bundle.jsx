
// ====== tokens.jsx ======
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


// ====== icons.jsx ======
// Lucide-style outline icons (PRD §18.5). Single-component stroke icons.

const Icon = ({ d, size = 22, stroke = 'currentColor', width = 1.8, fill = 'none', children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
    {d ? <path d={d}/> : children}
  </svg>
);

const Binocs = (p) => (
  <Icon {...p}>
    <path d="M5 4h3l1 5M19 4h-3l-1 5"/>
    <path d="M9 9a3 3 0 0 0-3 3v5a3 3 0 1 0 6 0v-5a3 3 0 0 0-3-3Z"/>
    <path d="M15 9a3 3 0 0 1 3 3v5a3 3 0 1 1-6 0v-5a3 3 0 0 1 3-3Z"/>
    <path d="M12 12v5"/>
  </Icon>
);

const Book = (p) => (
  <Icon {...p}>
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v15H6.5A2.5 2.5 0 0 0 4 19.5v-15Z"/>
    <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20"/>
  </Icon>
);

const Compass = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9"/>
    <path d="m15.5 8.5-2 6-6 2 2-6 6-2Z"/>
  </Icon>
);

const User = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 21a8 8 0 0 1 16 0"/>
  </Icon>
);

const Camera = (p) => (
  <Icon {...p}>
    <path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z"/>
    <circle cx="12" cy="13" r="3.5"/>
  </Icon>
);

const Flame = (p) => (
  <Icon {...p}>
    <path d="M12 22c4 0 7-2.8 7-7 0-3-2-5-3.5-6.5 0 2-1 3.5-2.5 3.5 0-3-1.5-6-4-8 0 4-4 6-4 11 0 4.2 3 7 7 7Z"/>
  </Icon>
);

const Bolt = (p) => (
  <Icon {...p}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>
  </Icon>
);

const X = (p) => <Icon {...p} d="M6 6l12 12M18 6 6 18"/>;
const Plus = (p) => <Icon {...p} d="M12 5v14M5 12h14"/>;
const Chevron = (p) => <Icon {...p} d="m9 6 6 6-6 6"/>;
const ChevronLeft = (p) => <Icon {...p} d="m15 6-6 6 6 6"/>;
const ChevronDown = (p) => <Icon {...p} d="m6 9 6 6 6-6"/>;
const Check = (p) => <Icon {...p} d="m5 12 5 5 9-11"/>;
const Search = (p) => (
  <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>
);
const Filter = (p) => <Icon {...p} d="M3 5h18M6 12h12M10 19h4"/>;
const Pin = (p) => (
  <Icon {...p}>
    <path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12Z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </Icon>
);
const Lock = (p) => (
  <Icon {...p}>
    <rect x="4.5" y="10" width="15" height="11" rx="2"/>
    <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
  </Icon>
);
const Sparkles = (p) => (
  <Icon {...p}>
    <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4Z"/>
    <path d="M18.5 16l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"/>
    <path d="M5.5 3l.5 1.5L7.5 5 6 5.5 5.5 7 5 5.5 3.5 5 5 4.5 5.5 3Z"/>
  </Icon>
);
const Refresh = (p) => (
  <Icon {...p}>
    <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/>
    <path d="M3 21v-5h5"/>
  </Icon>
);
const Music = (p) => (
  <Icon {...p}><path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2.5"/><circle cx="17" cy="16" r="2.5"/></Icon>
);
const MapIcon = (p) => (
  <Icon {...p}>
    <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/>
    <path d="M9 4v14M15 6v14"/>
  </Icon>
);
const Bell = (p) => (
  <Icon {...p}>
    <path d="M6 9a6 6 0 0 1 12 0c0 5 3 6 3 7H3c0-1 3-2 3-7Z"/>
    <path d="M10 20a2 2 0 0 0 4 0"/>
  </Icon>
);
const Trophy = (p) => (
  <Icon {...p}>
    <path d="M8 4h8v6a4 4 0 0 1-8 0V4Z"/>
    <path d="M16 6h3v2a3 3 0 0 1-3 3M8 6H5v2a3 3 0 0 0 3 3"/>
    <path d="M9 17h6l-1 4h-4l-1-4Z"/>
    <path d="M12 14v3"/>
  </Icon>
);
const Heart = (p) => (
  <Icon {...p} d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z"/>
);
const Flash = (p) => (
  <Icon {...p}><path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z"/></Icon>
);
const Apple = (p) => (
  <Icon {...p} fill="currentColor" stroke="none">
    <path d="M16.5 12.5c0-2.6 2.1-3.9 2.2-4-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2.1-.9-3.4-.9-1.7 0-3.4 1-4.3 2.6-1.8 3.2-.5 7.9 1.3 10.5.9 1.3 1.9 2.7 3.3 2.6 1.3-.1 1.8-.8 3.4-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.2-2.6.7-.9 1.2-2 1.5-3.2-.1 0-2.9-1.1-3-3.9zM14 4.5c.7-.8 1.2-2 1-3.2-1.1.1-2.3.7-3 1.6-.7.7-1.3 1.9-1.1 3 1.2.1 2.4-.6 3.1-1.4z"/>
  </Icon>
);
const Google = (p) => (
  <Icon {...p} stroke="none" fill="currentColor">
    <path d="M21.6 12.2c0-.8-.1-1.6-.2-2.3H12v4.5h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.7z" fill="#4285F4"/>
    <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6C4.7 19.7 8.1 22 12 22z" fill="#34A853"/>
    <path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1C2.4 8.8 2 10.4 2 12s.4 3.2 1.1 4.6L6.4 14z" fill="#FBBC05"/>
    <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9C16.9 2.9 14.7 2 12 2 8.1 2 4.7 4.3 3.1 7.4L6.4 10c.8-2.4 3-4.1 5.6-4.1z" fill="#EA4335"/>
  </Icon>
);
const Info = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M12 11v5"/></Icon>;
const Star = (p) => (
  <Icon {...p} fill="currentColor">
    <path d="m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1-5.5-2.9L6.5 20l1-6.1L3 9.5l6.3-.9L12 3Z"/>
  </Icon>
);
const Trash = (p) => (
  <Icon {...p}>
    <path d="M4 7h16M10 7V4h4v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/>
  </Icon>
);
const Settings = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.7 1.7 0 0 0 .4 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.4 1.7 1.7 0 0 0-1 1.6V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .4-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.4-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.4h.1a1.7 1.7 0 0 0 1-1.6V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.4 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>
  </Icon>
);
const ArrowRight = (p) => <Icon {...p} d="M5 12h14M13 5l7 7-7 7"/>;
const ArrowUp = (p) => <Icon {...p} d="M12 19V5M5 12l7-7 7 7"/>;
const Crown = (p) => (
  <Icon {...p}><path d="M3 7l4 4 5-6 5 6 4-4-2 12H5L3 7Z"/></Icon>
);
const HelpCircle = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.3-1 1-1 1.7M12 17v.01"/></Icon>
);

Object.assign(window, {
  Icon, Binocs, Book, Compass, User, Camera, Flame, Bolt,
  X, Plus, Chevron, ChevronLeft, ChevronDown, Check, Search, Filter,
  Pin, Lock, Sparkles, Refresh, Music, MapIcon, Bell, Trophy, Heart, Flash,
  Apple, Google, Info, Star, Trash, Settings, ArrowRight, ArrowUp, Crown, HelpCircle,
});


// ====== imagery.jsx ======
// Bird imagery + habitat backgrounds.
// SVGs styled to feel like a modern field guide — flat shapes with subtle
// watercolor washes. Each species has a silhouette + a habitat-tinted scene.

const habitatScene = {
  forest:    { sky: '#C9DDC2', mid: '#8FB47A', near: '#3B6D11', accent: '#2A4F0B' },
  grassland: { sky: '#F3EBC9', mid: '#D9C97A', near: '#A88E2E', accent: '#6E5A14' },
  desert:    { sky: '#F0D9B5', mid: '#D9A972', near: '#A56B33', accent: '#7A4419' },
  wetland:   { sky: '#D7E6D7', mid: '#7CA886', near: '#3F6E54', accent: '#214733' },
  freshwater:{ sky: '#D5E5F0', mid: '#85B7C8', near: '#3F7B92', accent: '#274F62' },
  coast:     { sky: '#DCEAF2', mid: '#A8C8DB', near: '#5C90AE', accent: '#34607B' },
  mountain:  { sky: '#DDE2E5', mid: '#9AA6AE', near: '#5D6D77', accent: '#3A484F' },
  tundra:    { sky: '#E8EEEC', mid: '#B8C5C0', near: '#7E8E89', accent: '#4F5C58' },
  urban:     { sky: '#E1DAC7', mid: '#B2A98E', near: '#7D7559', accent: '#4F4A34' },
};

// A small reusable habitat illustration — for card footers, etc.
function HabitatStrip({ habitat = 'forest', height = 90, width = '100%' }) {
  const s = habitatScene[habitat] || habitatScene.forest;
  // Different scene per habitat
  const scene = (() => {
    if (habitat === 'forest') return (
      <>
        <rect width="400" height="120" fill={s.sky}/>
        {[...Array(14)].map((_, i) => {
          const x = i * 30 - 10;
          const h = 40 + (i % 5) * 12;
          return <path key={i} d={`M${x} 120 L${x+15} ${120-h} L${x+30} 120Z`} fill={i % 2 ? s.near : s.mid}/>;
        })}
        {[...Array(7)].map((_, i) => {
          const x = i * 60 + 20;
          const h = 70;
          return <path key={'b'+i} d={`M${x} 120 L${x+22} ${120-h} L${x+44} 120Z`} fill={s.accent} opacity="0.85"/>;
        })}
      </>
    );
    if (habitat === 'wetland') return (
      <>
        <rect width="400" height="120" fill={s.sky}/>
        <rect y="80" width="400" height="40" fill={s.near} opacity="0.4"/>
        {[...Array(30)].map((_, i) => (
          <line key={i} x1={i*14} y1="85" x2={i*14} y2={50 + (i%4)*8} stroke={s.accent} strokeWidth="1.6"/>
        ))}
        <ellipse cx="200" cy="105" rx="180" ry="8" fill={s.accent} opacity="0.35"/>
      </>
    );
    if (habitat === 'coast' || habitat === 'freshwater') return (
      <>
        <rect width="400" height="60" fill={s.sky}/>
        <rect y="60" width="400" height="60" fill={s.mid} opacity="0.7"/>
        {[0,1,2,3].map((i) => (
          <path key={i} d={`M0 ${72 + i*12} Q100 ${68 + i*12} 200 ${72 + i*12} T400 ${72 + i*12}`}
            stroke={s.accent} strokeWidth="1" fill="none" opacity="0.4"/>
        ))}
      </>
    );
    if (habitat === 'mountain') return (
      <>
        <rect width="400" height="120" fill={s.sky}/>
        <path d="M0 120 L80 50 L140 90 L200 30 L280 80 L360 40 L400 75 L400 120Z" fill={s.mid}/>
        <path d="M0 120 L60 90 L130 110 L200 80 L290 105 L360 90 L400 100 L400 120Z" fill={s.near}/>
        <path d="M180 30 L200 30 L195 50 L210 45 L200 60Z" fill="#fff" opacity="0.5"/>
      </>
    );
    if (habitat === 'desert') return (
      <>
        <rect width="400" height="120" fill={s.sky}/>
        <path d="M0 120 Q100 80 200 95 T400 90 L400 120Z" fill={s.mid}/>
        <path d="M0 120 Q120 105 240 115 T400 110 L400 120Z" fill={s.near}/>
        <g fill={s.accent}>
          <rect x="60" y="70" width="10" height="50" rx="4"/>
          <rect x="50" y="85" width="10" height="20" rx="4"/>
          <rect x="70" y="78" width="10" height="22" rx="4"/>
          <rect x="280" y="80" width="8" height="40" rx="3"/>
        </g>
      </>
    );
    if (habitat === 'tundra') return (
      <>
        <rect width="400" height="120" fill={s.sky}/>
        <ellipse cx="100" cy="120" rx="160" ry="20" fill={s.mid}/>
        <ellipse cx="320" cy="120" rx="120" ry="15" fill={s.near}/>
        <circle cx="60" cy="50" r="4" fill="#fff" opacity="0.7"/>
        <circle cx="200" cy="35" r="3" fill="#fff" opacity="0.7"/>
        <circle cx="320" cy="55" r="3.5" fill="#fff" opacity="0.7"/>
      </>
    );
    if (habitat === 'urban') return (
      <>
        <rect width="400" height="120" fill={s.sky}/>
        {[
          [20, 60, 50, 60],
          [80, 40, 40, 80],
          [130, 70, 60, 50],
          [200, 30, 50, 90],
          [260, 55, 55, 65],
          [325, 45, 50, 75],
        ].map(([x,y,w,h], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill={s.near}/>
            {[...Array(Math.floor(h/12))].map((_, r) => (
              [...Array(Math.floor(w/12))].map((_, c) => (
                <rect key={r+'-'+c} x={x + 3 + c*12} y={y + 3 + r*12} width="6" height="6" fill={s.accent} opacity="0.4"/>
              ))
            ))}
          </g>
        ))}
      </>
    );
    // grassland default
    return (
      <>
        <rect width="400" height="120" fill={s.sky}/>
        <path d="M0 80 Q200 70 400 80 L400 120 L0 120Z" fill={s.mid}/>
        <path d="M0 100 Q200 95 400 100 L400 120 L0 120Z" fill={s.near}/>
        {[...Array(40)].map((_, i) => (
          <line key={i} x1={i*10 + 5} y1={100 - (i%3)*4} x2={i*10 + 5} y2="120" stroke={s.accent} strokeWidth="1.2"/>
        ))}
      </>
    );
  })();
  return (
    <svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice" style={{ width, height, display: 'block' }}>
      {scene}
    </svg>
  );
}

// Bird silhouettes — referenced by species id. Stylized, simplified.
const birdSilhouettes = {
  cardinal: {
    body: '#C8331F', accent: '#1A1A1A', beak: '#F2A33A',
    shape: (
      <g>
        {/* perched cardinal, crest right */}
        <path d="M120 220 C85 215 60 195 55 165 C50 140 65 120 90 110 C115 100 145 105 165 95 C180 85 195 75 195 60 L210 80 L195 95 C210 105 220 125 218 145 C215 175 195 200 165 215 C155 220 138 222 120 220 Z" fill="#C8331F"/>
        {/* head accent */}
        <path d="M165 100 C170 85 180 70 195 60 L200 75 L185 95 Z" fill="#A22414"/>
        {/* face mask */}
        <ellipse cx="172" cy="110" rx="14" ry="10" fill="#1A1A1A"/>
        {/* beak */}
        <path d="M186 110 L208 108 L186 116 Z" fill="#F2A33A"/>
        {/* eye */}
        <circle cx="170" cy="106" r="2.5" fill="#1A1A1A"/>
        <circle cx="171" cy="105" r="0.8" fill="#fff"/>
        {/* tail */}
        <path d="M55 175 L20 170 L25 200 L60 195 Z" fill="#A22414"/>
        {/* leg */}
        <line x1="120" y1="218" x2="118" y2="240" stroke="#1A1A1A" strokeWidth="3"/>
        <line x1="138" y1="220" x2="140" y2="240" stroke="#1A1A1A" strokeWidth="3"/>
      </g>
    ),
  },
  bluejay: {
    body: '#5180BE', accent: '#2B4D7C', beak: '#1A1A1A',
    shape: (
      <g>
        <path d="M115 215 C80 210 60 188 58 162 C58 138 75 118 100 108 C125 100 155 108 175 92 C188 82 198 70 200 58 L215 75 L205 92 C218 102 225 124 222 145 C217 175 195 200 165 212 C150 218 132 218 115 215 Z" fill="#5180BE"/>
        {/* crest */}
        <path d="M180 92 L195 60 L205 78 L195 100Z" fill="#2B4D7C"/>
        {/* neck collar */}
        <path d="M155 120 Q175 125 185 110 L195 130 Q170 140 150 138 Z" fill="#1A1A1A"/>
        {/* wing bars */}
        <rect x="80" y="160" width="60" height="3" fill="#fff" opacity="0.7"/>
        <rect x="80" y="170" width="50" height="3" fill="#1A1A1A"/>
        <rect x="80" y="180" width="55" height="3" fill="#fff" opacity="0.7"/>
        {/* face */}
        <circle cx="178" cy="108" r="2.5" fill="#1A1A1A"/>
        <path d="M195 110 L215 108 L195 115 Z" fill="#1A1A1A"/>
        {/* tail */}
        <path d="M58 170 L18 165 L25 198 L60 192 Z" fill="#5180BE"/>
        <rect x="22" y="172" width="38" height="3" fill="#1A1A1A"/>
        <line x1="118" y1="215" x2="116" y2="240" stroke="#1A1A1A" strokeWidth="3"/>
        <line x1="138" y1="218" x2="140" y2="240" stroke="#1A1A1A" strokeWidth="3"/>
      </g>
    ),
  },
  robin: {
    body: '#6B5444', accent: '#C9591F', beak: '#F2C842',
    shape: (
      <g>
        <path d="M115 215 C80 210 60 190 58 165 C58 142 75 120 100 110 C125 102 155 108 175 95 C188 88 198 78 200 65 L212 80 L200 95 C215 105 222 125 220 148 C215 180 195 202 165 212 C150 218 132 218 115 215 Z" fill="#6B5444"/>
        <path d="M90 145 C90 128 110 118 130 122 C150 126 165 145 165 165 L100 170 Z" fill="#C9591F"/>
        <circle cx="180" cy="105" r="2.5" fill="#1A1A1A"/>
        <path d="M195 108 L215 106 L195 113 Z" fill="#F2C842"/>
        <line x1="118" y1="215" x2="116" y2="240" stroke="#1A1A1A" strokeWidth="3"/>
        <line x1="138" y1="218" x2="140" y2="240" stroke="#1A1A1A" strokeWidth="3"/>
        <path d="M58 175 L25 170 L30 195 L60 192 Z" fill="#6B5444"/>
      </g>
    ),
  },
  goldfinch: {
    body: '#F2C842', accent: '#1A1A1A', beak: '#A0743E',
    shape: (
      <g>
        <path d="M115 215 C82 210 62 188 60 162 C60 140 75 122 100 115 C125 108 155 112 175 100 C190 92 200 80 200 68 L214 82 L202 98 C215 108 220 128 218 148 C214 178 195 200 165 212 C150 218 132 218 115 215 Z" fill="#F2C842"/>
        <path d="M170 88 L218 85 L210 110 L165 105 Z" fill="#1A1A1A"/>
        <ellipse cx="100" cy="160" rx="40" ry="14" fill="#1A1A1A"/>
        <ellipse cx="105" cy="158" rx="34" ry="6" fill="#fff" opacity="0.6"/>
        <circle cx="180" cy="100" r="2.5" fill="#1A1A1A"/>
        <path d="M192 102 L210 100 L192 108 Z" fill="#A0743E"/>
        <path d="M60 170 L25 165 L30 195 L62 188 Z" fill="#1A1A1A"/>
      </g>
    ),
  },
  hummingbird: {
    body: '#1F8C5A', accent: '#C8331F', beak: '#1A1A1A',
    shape: (
      <g>
        <ellipse cx="120" cy="155" rx="55" ry="32" fill="#1F8C5A"/>
        <ellipse cx="160" cy="135" rx="22" ry="20" fill="#1F8C5A"/>
        <path d="M150 145 L160 150 L150 158 Z" fill="#C8331F"/>
        <path d="M175 135 L220 130 L175 145Z" fill="#1A1A1A"/>
        <circle cx="167" cy="132" r="2" fill="#1A1A1A"/>
        {/* wings as motion arcs */}
        <path d="M80 130 C40 110 30 150 75 160" stroke="#1F8C5A" strokeWidth="3" fill="none" opacity="0.7"/>
        <path d="M80 140 C30 130 20 175 75 175" stroke="#1F8C5A" strokeWidth="3" fill="none" opacity="0.4"/>
        <line x1="115" y1="185" x2="113" y2="225" stroke="#1A1A1A" strokeWidth="2"/>
      </g>
    ),
  },
  hawk: {
    body: '#7A604A', accent: '#E0CFB0', beak: '#F2C842',
    shape: (
      <g>
        <path d="M110 220 C75 210 55 185 55 155 C55 125 75 105 105 100 C140 95 170 105 195 90 C210 80 220 65 222 50 L235 70 L222 90 C238 100 245 125 240 155 C235 195 200 220 160 225 C145 226 125 225 110 220 Z" fill="#7A604A"/>
        <ellipse cx="100" cy="170" rx="50" ry="20" fill="#E0CFB0"/>
        {[...Array(5)].map((_, i) => (
          <ellipse key={i} cx={80 + i*15} cy="170" rx="3" ry="8" fill="#7A604A"/>
        ))}
        <circle cx="195" cy="92" r="3" fill="#F2C842"/>
        <circle cx="195" cy="92" r="1.2" fill="#1A1A1A"/>
        <path d="M212 95 C228 92 232 100 220 105 L210 100Z" fill="#F2C842"/>
        <path d="M212 100 L222 105 L210 110 Z" fill="#1A1A1A"/>
      </g>
    ),
  },
  woodpecker: {
    body: '#1A1A1A', accent: '#FFFFFF', beak: '#3A3A3A',
    shape: (
      <g>
        <path d="M115 220 C85 215 65 195 60 170 C60 145 75 125 100 118 C125 110 155 115 175 105 C185 100 195 90 195 78 L210 95 L195 110 C212 120 220 140 215 165 C208 195 188 215 158 220 C145 222 130 222 115 220 Z" fill="#1A1A1A"/>
        {/* white belly */}
        <ellipse cx="115" cy="165" rx="48" ry="22" fill="#fff"/>
        {/* white wing stripes */}
        <rect x="70" y="142" width="50" height="5" fill="#fff"/>
        <rect x="75" y="155" width="40" height="5" fill="#fff"/>
        {/* red cap */}
        <path d="M170 90 C175 80 188 78 198 82 L195 110 L180 105 Z" fill="#C8331F"/>
        <circle cx="182" cy="108" r="2" fill="#fff"/>
        <path d="M195 110 L218 108 L195 117 Z" fill="#3A3A3A"/>
      </g>
    ),
  },
  owl: {
    body: '#A89377', accent: '#E0CFB0', beak: '#3A3A3A',
    shape: (
      <g>
        <ellipse cx="135" cy="175" rx="70" ry="60" fill="#A89377"/>
        <ellipse cx="135" cy="120" rx="55" ry="48" fill="#A89377"/>
        {/* facial disk */}
        <ellipse cx="115" cy="120" rx="22" ry="26" fill="#E0CFB0"/>
        <ellipse cx="155" cy="120" rx="22" ry="26" fill="#E0CFB0"/>
        <circle cx="115" cy="120" r="9" fill="#1A1A1A"/>
        <circle cx="155" cy="120" r="9" fill="#1A1A1A"/>
        <circle cx="116" cy="118" r="2" fill="#F2C842"/>
        <circle cx="156" cy="118" r="2" fill="#F2C842"/>
        <path d="M130 130 L135 140 L140 130 Z" fill="#3A3A3A"/>
        {/* belly speckles */}
        {[...Array(20)].map((_, i) => (
          <ellipse key={i} cx={90 + (i%5)*22} cy={170 + Math.floor(i/5)*15} rx="3" ry="5" fill="#7A604A" opacity="0.6"/>
        ))}
      </g>
    ),
  },
  warbler: {
    body: '#F2C842', accent: '#1F8C5A', beak: '#3A3A3A',
    shape: (
      <g>
        <path d="M115 215 C82 210 65 190 62 165 C62 142 78 125 100 118 C125 110 152 115 170 105 C183 98 192 88 192 76 L205 90 L192 105 C208 115 215 132 213 152 C209 180 192 200 165 210 C150 215 130 218 115 215 Z" fill="#F2C842"/>
        <path d="M165 90 C170 78 180 70 192 70 L195 88 L180 100 Z" fill="#1F8C5A"/>
        <ellipse cx="100" cy="160" rx="40" ry="14" fill="#1F8C5A" opacity="0.6"/>
        <circle cx="178" cy="100" r="2.5" fill="#1A1A1A"/>
        <path d="M193 100 L210 100 L193 108 Z" fill="#3A3A3A"/>
      </g>
    ),
  },
  duck: {
    body: '#3A5A48', accent: '#7A604A', beak: '#F2A33A',
    shape: (
      <g>
        {/* water line under */}
        <ellipse cx="135" cy="200" rx="85" ry="8" fill="#85B7C8" opacity="0.5"/>
        <path d="M50 180 C50 150 80 130 130 130 C180 130 215 140 215 165 C215 180 200 195 165 200 C100 205 50 200 50 180 Z" fill="#7A604A"/>
        {/* iridescent green head */}
        <ellipse cx="190" cy="125" rx="32" ry="28" fill="#1F5A3A"/>
        <ellipse cx="195" cy="120" rx="22" ry="18" fill="#3A8857" opacity="0.7"/>
        {/* white collar */}
        <path d="M160 145 Q175 150 195 148 L200 158 Q175 160 158 158 Z" fill="#fff"/>
        <path d="M213 128 L240 130 L213 138 Z" fill="#F2A33A"/>
        <circle cx="200" cy="120" r="2" fill="#1A1A1A"/>
      </g>
    ),
  },
};

// Hero photo — bird silhouette on habitat background.
function BirdPhoto({ species = 'cardinal', habitat = 'forest', style = {}, mode = 'fill' }) {
  const sceneCols = habitatScene[habitat] || habitatScene.forest;
  const bird = birdSilhouettes[species] || birdSilhouettes.cardinal;
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: sceneCols.sky, ...style }}>
      <svg viewBox="0 0 280 280" preserveAspectRatio="xMidYMid slice" style={{ display: 'block', width: '100%', height: '100%' }}>
        {/* background wash */}
        <defs>
          <radialGradient id={`bg-${species}-${habitat}`} cx="50%" cy="40%" r="80%">
            <stop offset="0%" stopColor={sceneCols.sky}/>
            <stop offset="100%" stopColor={sceneCols.mid} stopOpacity="0.6"/>
          </radialGradient>
        </defs>
        <rect width="280" height="280" fill={`url(#bg-${species}-${habitat})`}/>
        {/* hint of habitat at bottom */}
        <path d={`M0 260 Q140 230 280 250 L280 280 L0 280Z`} fill={sceneCols.near} opacity="0.45"/>
        {/* subtle perch */}
        <rect x="0" y="240" width="280" height="6" fill={sceneCols.accent} opacity="0.35"/>
        {/* texture dots */}
        {[...Array(40)].map((_, i) => (
          <circle key={i} cx={(i*37)%280} cy={(i*53)%280} r="0.8" fill={sceneCols.accent} opacity="0.15"/>
        ))}
        {/* bird */}
        <g transform="translate(20,20) scale(1.0)">{bird.shape}</g>
      </svg>
    </div>
  );
}

// Small "reference illustration" for list rows (compact).
function BirdThumb({ species = 'cardinal', habitat = 'forest', size = 56, radius = 12 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: radius, overflow: 'hidden', flexShrink: 0 }}>
      <BirdPhoto species={species} habitat={habitat} style={{ width: '100%', height: '100%' }}/>
    </div>
  );
}

// Range-map asset (for illustrative purposes — used inside CardDetail flip).
function RangeMap({ habitat = 'forest', style = {} }) {
  const s = habitatScene[habitat] || habitatScene.forest;
  return (
    <div style={{ position: 'relative', background: '#E5EEDF', overflow: 'hidden', ...style }}>
      <svg viewBox="0 0 280 280" preserveAspectRatio="xMidYMid slice" style={{ display: 'block', width: '100%', height: '100%' }}>
        <rect width="280" height="280" fill="#EBE7D6"/>
        {/* simplified NA outline */}
        <path d="M30 60 Q50 30 100 32 Q140 24 180 32 Q210 28 240 50 Q258 70 252 110 Q258 140 246 165 Q255 200 230 235 Q200 255 165 255 Q150 270 130 260 Q105 268 90 250 Q60 250 45 220 Q22 195 28 160 Q15 130 30 100 Z"
          fill="#D9E0BC" stroke="#7A8A5A" strokeWidth="1.2"/>
        {/* internal land hints */}
        <path d="M70 90 Q140 80 220 100" stroke="#7A8A5A" strokeWidth="0.6" fill="none" opacity="0.5"/>
        <path d="M80 140 Q150 130 220 150" stroke="#7A8A5A" strokeWidth="0.6" fill="none" opacity="0.5"/>
        <path d="M60 190 Q140 180 230 200" stroke="#7A8A5A" strokeWidth="0.6" fill="none" opacity="0.5"/>
        {/* water on edges */}
        <path d="M0 0 H280 V280 H0 Z M30 60 Q50 30 100 32 Q140 24 180 32 Q210 28 240 50 Q258 70 252 110 Q258 140 246 165 Q255 200 230 235 Q200 255 165 255 Q150 270 130 260 Q105 268 90 250 Q60 250 45 220 Q22 195 28 160 Q15 130 30 100 Z"
          fill="#C7DCEC" fillRule="evenodd"/>
        {/* range overlay in coral */}
        <ellipse cx="160" cy="155" rx="80" ry="55" fill="#D85A30" opacity="0.55"/>
        <ellipse cx="160" cy="155" rx="60" ry="40" fill="#D85A30" opacity="0.4"/>
      </svg>
    </div>
  );
}

Object.assign(window, { HabitatStrip, BirdPhoto, BirdThumb, RangeMap, habitatScene, birdSilhouettes });


// ====== card.jsx ======
// BirdCard — the central collectible artifact of birdr.
// Modeled directly on the user's reference: tier-color frame around the
// whole card, family/name top-left, conservation status top-right,
// hero photo, Size/About/First Sight body, secondary "Also spotted in"
// scenery row, and the habitat-illustrated footer with badges.

const FRAME = {
  LC: window.T.lc,
  NT: window.T.nt,
  VU: window.T.vu,
  EN: window.T.en,
  CR: window.T.cr,
};
const BADGE_BG = {
  LC: window.T.lcBadge,
  NT: window.T.ntBadge,
  VU: window.T.vuBadge,
  EN: window.T.enBadge,
  CR: window.T.crBadge,
};
const TIER_LABEL = {
  LC: 'Least concern',
  NT: 'Near threatened',
  VU: 'Vulnerable',
  EN: 'Endangered',
  CR: 'Critically endangered',
};

// Round conservation status badge — sage circle with tier code.
function ConservationBadge({ tier = 'LC', size = 56 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: BADGE_BG[tier],
      border: `${Math.max(2, size * 0.06)}px solid #fff`,
      boxShadow: '0 3px 6px rgba(0,0,0,0.14)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, letterSpacing: 0.3,
      fontSize: size * 0.32, fontFamily: window.T.font,
      flexShrink: 0,
    }}>{tier}</div>
  );
}

function AudioBadge({ size = 56 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: window.T.sageGrad || window.T.sage,
      border: `${Math.max(2, size * 0.06)}px solid #fff`,
      boxShadow: '0 3px 6px rgba(0,0,0,0.14)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Music size={size * 0.5} stroke="#fff" width={2.4}/>
    </div>
  );
}

function SightingBadge({ count = 1, size = 56 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#C28847',
      border: `${Math.max(2, size * 0.06)}px solid #fff`,
      boxShadow: '0 3px 6px rgba(0,0,0,0.14)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', flexShrink: 0,
    }}>
      <Star size={size * 0.54} stroke="#fff" fill="none" width={1.6}/>
      <div style={{
        position: 'absolute', right: -3, bottom: -4,
        background: window.T.ink, color: '#fff',
        width: size * 0.34, height: size * 0.34,
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.22, fontWeight: 800,
      }}>{count}</div>
    </div>
  );
}

// Habitat pill — secondary button style (outline, ink text).
function HabitatPill({ habitat = 'Forests', frameColor, size = 14 }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: '#fff',
      color: window.T.ink,
      padding: `${size * 0.5}px ${size * 0.9}px`,
      borderRadius: 999,
      fontSize: size, fontWeight: 700,
      border: `1.5px solid ${window.T.ink}`,
    }}>
      <span>{habitat}</span>
      <Pin size={size + 2} stroke={window.T.ink} width={2.2}/>
    </span>
  );
}

// One small "also spotted in" thumbnail with a habitat caption.
function AltScene({ speciesKey, habitatKey, label, size }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
      <div style={{ borderRadius: size * 0.18, overflow: 'hidden', height: size, border: '1.5px solid rgba(0,0,0,0.06)' }}>
        <BirdPhoto species={speciesKey} habitat={habitatKey} style={{ width: '100%', height: '100%' }}/>
      </div>
      <div style={{ fontSize: size * 0.18, color: window.T.inkSoft, fontWeight: 600,
        textAlign: 'center', letterSpacing: 0.2 }}>{label}</div>
    </div>
  );
}

function BirdCard({
  family = 'Songbird',
  name = 'Cardinal',
  habitat = 'Forests',
  habitatKey = 'forest',
  speciesKey = 'cardinal',
  altScenes = [
    { habitatKey: 'urban', label: 'City park' },
    { habitatKey: 'grassland', label: 'Open field' },
  ],
  tier = 'LC',
  size = 'Approx. 8.3 - 9 inches (21 - 23 cm)',
  about = 'One of our most popular birds, the Northern Cardinal, is the official state bird of no fewer than seven eastern states.',
  firstSight = 'January 15, 2024, backyard feeder',
  count = 7,
  showSightingBadge = true,
  showAltScenes = null,         // auto: only when there's room (width >= 280)
  scale = 1,
  locked = false,
  width = 320,
  compact = null,
}) {
  const isCompact = compact == null ? width < 240 : compact;
  const showAlt = showAltScenes == null ? width >= 280 : showAltScenes;
  const frameColor = FRAME[tier] || FRAME.LC;
  const border = Math.round(width * 0.038);
  const pad = Math.round(width * 0.055);
  const innerR = Math.round(width * 0.04);
  const outerR = Math.round(width * 0.07);

  return (
    <div className="birdr" style={{
      width,
      borderRadius: outerR,
      background: frameColor,
      padding: border,
      boxShadow: window.T.shadow.md,
      fontFamily: window.T.font,
      color: window.T.ink,
      transform: scale !== 1 ? `scale(${scale})` : undefined,
      transformOrigin: 'top left',
      position: 'relative',
    }}>
      {/* Glossy sheen overlay — diagonal highlight across the whole card */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: outerR, pointerEvents: 'none',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 28%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.04) 80%, rgba(0,0,0,0.12) 100%)',
        zIndex: 5, mixBlendMode: 'overlay',
      }}/>
      {/* Top specular gloss band */}
      <div style={{
        position: 'absolute', top: border, left: border, right: border,
        height: width * 0.18, borderRadius: `${innerR}px ${innerR}px 999px 999px / ${innerR}px ${innerR}px ${innerR}px ${innerR}px`,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.05) 80%, rgba(255,255,255,0) 100%)',
        pointerEvents: 'none', zIndex: 4,
      }}/>
      {/* Inner cream body */}
      <div style={{
        background: '#FBF9EF',
        borderRadius: innerR,
        padding: pad,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        minHeight: width * 1.45,
      }}>
        {/* Header: family + name LEFT, habitat pill TOP RIGHT */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: width * 0.04, color: window.T.ink, opacity: 0.85, lineHeight: 1, marginBottom: 3 }}>
              {family}
            </div>
            <div style={{ fontSize: width * 0.085, fontWeight: 800, lineHeight: 1.05, letterSpacing: -0.5,
              color: locked ? window.T.inkSoft : window.T.ink }}>
              {name}
            </div>
          </div>
          <HabitatPill habitat={habitat} frameColor={frameColor} size={width * 0.044}/>
        </div>

        {/* Hero photo with tier-color inner frame */}
        <div style={{
          marginTop: pad * 0.7,
          borderRadius: width * 0.035,
          overflow: 'hidden',
          border: `${Math.max(2, width*0.014)}px solid ${frameColor}`,
          aspectRatio: '4 / 3',
          background: '#fff',
        }}>
          {locked ? (
            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center',
              background:'repeating-linear-gradient(45deg,#EFE9D8,#EFE9D8 6px,#E5DEC8 6px,#E5DEC8 12px)' }}>
              <div style={{ fontSize: width * 0.34, fontWeight: 800, color: window.T.inkFaint, lineHeight: 1 }}>?</div>
            </div>
          ) : (
            <BirdPhoto species={speciesKey} habitat={habitatKey} style={{ width: '100%', height: '100%' }}/>
          )}
        </div>

        {/* Body text */}
        <div style={{ marginTop: pad * 0.6, fontSize: width * 0.042, lineHeight: 1.35, color: window.T.ink }}>
          <p style={{ margin: 0, marginBottom: pad * 0.3 }}>
            <b>Size</b>: {locked ? '—' : size}
          </p>
          <p style={{ margin: 0, marginBottom: pad * 0.3 }}>
            <b>About</b>: {locked ? 'Photograph this species to unlock its card.' : about}
          </p>
          {!locked && (
            <p style={{ margin: 0 }}>
              <b>First Sight</b>: {firstSight}
            </p>
          )}
        </div>

        {/* Footer with illustrated habitat scene + conservation, audio + sighting */}
        <div style={{
          marginTop: pad * 0.6,
          marginLeft: -pad, marginRight: -pad, marginBottom: -pad,
          height: width * 0.32, position: 'relative',
        }}>
          <HabitatStrip habitat={habitatKey} height={width * 0.32}/>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            padding: `0 ${pad}px ${pad * 0.6}px`,
          }}>
            <ConservationBadge tier={tier} size={width * 0.14}/>
            <AudioBadge size={width * 0.14}/>
            {showSightingBadge ? (
              <SightingBadge count={count} size={width * 0.14}/>
            ) : (
              <div style={{ width: width * 0.14 }}/>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// A grid-thumbnail variant — keeps the prior compact design.
function BirdCardThumb({
  name = 'Cardinal',
  family = 'Songbird',
  tier = 'LC',
  habitatKey = 'forest',
  speciesKey = 'cardinal',
  count = 1,
  locked = false,
  width = 108,
}) {
  const frameColor = FRAME[tier];
  const cardH = width * 1.55;
  const r = Math.round(width * 0.11);

  return (
    <div style={{
      width, height: cardH, borderRadius: r,
      background: '#FBF9EF',
      border: locked ? `1.5px solid ${window.T.line}` : `2px solid ${frameColor}`,
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 2px 6px rgba(40,30,20,0.08)',
    }}>
      <div style={{
        margin: width * 0.06, marginBottom: width * 0.04,
        borderRadius: r * 0.6, overflow: 'hidden',
        background: locked ? '#E5DEC8' : frameColor,
        padding: Math.max(2, width * 0.03),
        height: width * 0.72,
      }}>
        <div style={{ width: '100%', height: '100%', borderRadius: r * 0.5, overflow: 'hidden' }}>
          {locked ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'repeating-linear-gradient(45deg,#F3EFE0,#F3EFE0 4px,#E7E0CD 4px,#E7E0CD 8px)' }}>
              <Lock size={width * 0.22} stroke={window.T.inkFaint} width={1.6}/>
            </div>
          ) : (
            <BirdPhoto species={speciesKey} habitat={habitatKey} style={{ width: '100%', height: '100%' }}/>
          )}
        </div>
      </div>

      <div style={{ flex: 1, padding: `0 ${width * 0.09}px ${width * 0.07}px`,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 4 }}>
        <div>
          <div style={{ fontSize: width * 0.085, color: window.T.inkSoft, lineHeight: 1, marginBottom: 2 }}>
            {family}
          </div>
          <div style={{ fontSize: width * 0.13, fontWeight: 800, lineHeight: 1.05,
            letterSpacing: -0.2, color: locked ? window.T.inkSoft : window.T.ink,
            overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {name}
          </div>
        </div>

        {locked ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4,
            fontSize: width * 0.085, fontWeight: 700, color: window.T.inkFaint }}>
            <Lock size={width * 0.1} stroke={window.T.inkFaint} width={2}/>
            <span>Not yet</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: width * 0.095, fontWeight: 700 }}>
            <div style={{
              padding: `${width*0.02}px ${width*0.07}px`, borderRadius: 999,
              background: BADGE_BG[tier], color: '#fff',
              fontSize: width * 0.085, fontWeight: 800, letterSpacing: 0.3,
            }}>{tier}</div>
            {count > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#C28847' }}>
                <Star size={width * 0.11} stroke="#C28847" fill="currentColor" width={1}/>
                <span className="tnum">{count}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, {
  BirdCard, BirdCardThumb,
  ConservationBadge, AudioBadge, SightingBadge, HabitatPill,
  FRAME, BADGE_BG, TIER_LABEL,
});


// ====== chrome.jsx ======
// Shared chrome: PhoneScreen wrapper, TabBar, Section headers.

const SCREEN_W = 402;
const SCREEN_H = 874;
const STATUS_H = 60;       // status bar visual height
const HOME_H = 34;         // home indicator zone
const TAB_H = 88;          // tab bar height (including home indicator overlap)

// PhoneScreen — wraps screen content with iOS device frame.
// Accepts dark prop for camera/dark surfaces.
function PhoneScreen({ children, dark = false, bg, tabBar = null, hideHomeIndicator = false }) {
  return (
    <IOSDevice dark={dark} width={SCREEN_W} height={SCREEN_H}>
      <div style={{
        position: 'absolute', inset: 0,
        background: bg || (dark ? '#0E0E0E' : window.T.cream),
        fontFamily: window.T.font,
        color: dark ? '#fff' : window.T.ink,
        overflow: 'hidden',
      }}>
        {children}
        {tabBar}
      </div>
    </IOSDevice>
  );
}

function TabBar({ active = 'capture', dark = false }) {
  const items = [
    { key: 'capture',    label: 'Capture',    Icon: Binocs },
    { key: 'collection', label: 'Collection', Icon: Book },
    { key: 'explore',    label: 'Explore',    Icon: Compass },
    { key: 'profile',    label: 'Profile',    Icon: User },
  ];
  // Themed: tint the cream surface with a hint of the active brand color
  // so the bar feels native to whichever palette is loaded.
  const themedBg = dark
    ? 'rgba(20,20,20,0.95)'
    : window.T.themeName === 'vivid'
      ? 'rgba(228,242,224,0.92)'   // pale mint wash
      : 'rgba(251, 249, 239, 0.92)'; // warm cream wash
  const borderColor = dark ? 'rgba(255,255,255,0.08)' : window.T.sage;
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: TAB_H,
      background: themedBg,
      backdropFilter: 'blur(20px)',
      borderTop: `2px solid ${borderColor}`,
      paddingBottom: HOME_H - 6,
      display: 'flex',
      zIndex: 30,
    }}>
      {items.map(({ key, label, Icon }) => {
        const isActive = key === active;
        const color = isActive ? window.T.sage : (dark ? 'rgba(255,255,255,0.55)' : window.T.inkFaint);
        return (
          <div key={key} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 4, position: 'relative',
          }}>
            {isActive && (
              <div style={{
                position: 'absolute', top: 6, width: 32, height: 3, borderRadius: 2,
                background: window.T.sage,
              }}/>
            )}
            <Icon size={26} stroke={color} width={2}/>
            <div style={{ fontSize: 11, color, fontWeight: isActive ? 600 : 500 }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

// AppHeader — a top zone with optional title + actions. Sits below status.
function AppHeader({ title, sub, leading, trailing, dark = false, large = false, style = {} }) {
  const color = dark ? '#fff' : window.T.ink;
  return (
    <div style={{
      paddingTop: STATUS_H + 4, paddingLeft: 20, paddingRight: 20,
      paddingBottom: 12,
      display: 'flex', alignItems: 'center', gap: 12,
      color,
      ...style,
    }}>
      {leading}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div style={{
            fontSize: large ? 32 : 22,
            fontWeight: large ? 800 : 700,
            letterSpacing: -0.4,
            lineHeight: 1.1,
          }}>{title}</div>
        )}
        {sub && (
          <div style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,0.7)' : window.T.inkSoft, marginTop: 2 }}>{sub}</div>
        )}
      </div>
      {trailing}
    </div>
  );
}

function CircleBtn({ children, onClick, dark = false, size = 38, bg }) {
  return (
    <button onClick={onClick} style={{
      width: size, height: size, borderRadius: '50%', border: 'none',
      background: bg || (dark ? 'rgba(255,255,255,0.12)' : '#fff'),
      color: dark ? '#fff' : window.T.ink,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: dark ? 'none' : '0 1px 2px rgba(40,30,20,0.08)',
    }}>{children}</button>
  );
}

function Pill({ children, color, bg, style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 999,
      background: bg || window.T.sageTint,
      color: color || window.T.sageDeep,
      fontSize: 12, fontWeight: 600,
      ...style,
    }}>{children}</span>
  );
}

function SegmentedControl({ options, value, onChange, dark = false }) {
  return (
    <div style={{
      display: 'flex',
      background: dark ? 'rgba(255,255,255,0.08)' : window.T.sageTint,
      borderRadius: 12, padding: 4, gap: 4,
    }}>
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button key={opt.value} onClick={() => onChange && onChange(opt.value)}
            style={{
              flex: 1, padding: '9px 12px',
              borderRadius: 9, border: 'none',
              background: isActive ? '#fff' : 'transparent',
              color: isActive ? window.T.sageDeep : (dark ? 'rgba(255,255,255,0.6)' : window.T.sageDeep),
              opacity: isActive ? 1 : 0.65,
              fontSize: 14, fontWeight: 700,
              boxShadow: isActive ? `0 1px 3px ${window.T.sage}30` : 'none',
              cursor: 'pointer',
            }}>{opt.label}</button>
        );
      })}
    </div>
  );
}

function PrimaryButton({ children, onClick, color = 'sage', size = 'md', style = {}, leading, trailing, disabled }) {
  const colorMap = {
    sage:    { bg: window.T.sageGrad || window.T.sage, fg: '#fff', shadow: window.T.sageGrad ? `0 6px 16px ${window.T.sage}40` : 'none' },
    saffron: { bg: window.T.saffron, fg: '#1A1A1A' },
    coral:   { bg: window.T.coral,   fg: '#fff' },
    ink:     { bg: window.T.ink,     fg: '#fff' },
    dark:    { bg: '#1A1A1A',        fg: '#fff' },
  };
  const c = colorMap[color] || colorMap.sage;
  const pad = size === 'lg' ? '17px 22px' : size === 'sm' ? '9px 14px' : '14px 20px';
  const fs = size === 'lg' ? 17 : size === 'sm' ? 14 : 16;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      background: c.bg, color: c.fg,
      padding: pad, borderRadius: 999,
      border: 'none', fontSize: fs, fontWeight: 700,
      letterSpacing: -0.2,
      cursor: 'pointer',
      boxShadow: c.shadow || undefined,
      opacity: disabled ? 0.5 : 1,
      ...style,
    }}>
      {leading}
      <span>{children}</span>
      {trailing}
    </button>
  );
}

function GhostButton({ children, onClick, style = {}, leading, trailing }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      background: '#fff',
      border: `1.5px solid ${window.T.line}`,
      color: window.T.ink, fontWeight: 600, fontSize: 15,
      padding: '12px 18px', borderRadius: 999, cursor: 'pointer',
      ...style,
    }}>
      {leading}
      <span>{children}</span>
      {trailing}
    </button>
  );
}

Object.assign(window, {
  PhoneScreen, TabBar, AppHeader, CircleBtn, Pill, SegmentedControl,
  PrimaryButton, GhostButton, SCREEN_W, SCREEN_H, STATUS_H, HOME_H, TAB_H,
});


// ====== screens-onboarding.jsx ======
// Onboarding screens (granular, per PRD §6.1):
//   1. Splash — brand moment, auto-advances after ~1s
//   2. Welcome carousel — 3 slides (Identify · Collect · Habit)
//   3. Sign in — OAuth-only (Apple/Google)
//   4. Permissions rationale
//   5. Tutorial intro — sample Cardinal + "Try it out" CTA
//   6. Tutorial card unlock — animated reveal of the sample card

// ─────────────────────────────────────────────────────────────
// 1. Splash
// ─────────────────────────────────────────────────────────────
function SplashScreen() {
  return (
    <PhoneScreen bg={window.T.sage}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden',
        background: `radial-gradient(circle at 50% 35%, ${window.T.sageLight || window.T.sage} 0%, ${window.T.sage} 50%, ${window.T.sageDeep} 100%)` }}>
        {/* concentric rings */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            position: 'absolute', left: '50%', top: '40%',
            width: 120 + i*80, height: 120 + i*80,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: `1px solid rgba(255,255,255,${0.05 + (5-i)*0.03})`,
          }}/>
        ))}
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 28, color: '#fff' }}>
        <div style={{
          width: 112, height: 112, borderRadius: 32,
          background: 'rgba(255,255,255,0.12)',
          border: '1.5px solid rgba(255,255,255,0.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(20px)',
        }}>
          <Binocs size={62} stroke="#fff" width={2}/>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>birdr</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', marginTop: 10, letterSpacing: 0.4 }}>
            a field guide that grows.
          </div>
        </div>
      </div>
    </PhoneScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. Welcome carousel — three slides
// ─────────────────────────────────────────────────────────────
function WelcomeFrame({ slideIndex, children, accentLabel, headline, sub }) {
  return (
    <PhoneScreen>
      <div style={{ position: 'absolute', top: STATUS_H + 8, right: 20, zIndex: 10 }}>
        <button style={{ background: 'transparent', border: 'none', color: window.T.inkSoft,
          fontSize: 15, fontWeight: 600, fontFamily: window.T.font, cursor: 'pointer' }}>
          Skip
        </button>
      </div>
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        padding: `${STATUS_H + 56}px 24px 100px`, position: 'relative',
      }}>
        {/* Hero slot */}
        <div style={{ flex: 1, position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 16 }}>
          {children}
        </div>

        {/* Copy */}
        <div style={{ paddingTop: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: window.T.saffronDeep,
            textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
            {accentLabel}
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.1, marginBottom: 12 }}>
            {headline}
          </div>
          <div style={{ fontSize: 15, color: window.T.inkSoft, lineHeight: 1.5 }}>
            {sub}
          </div>
        </div>

        {/* Dots + next */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: i === slideIndex ? 24 : 8, height: 8, borderRadius: 4,
                background: i === slideIndex ? window.T.ink : window.T.line,
                transition: 'width .2s',
              }}/>
            ))}
          </div>
          <PrimaryButton color="ink" trailing={<ArrowRight size={18} stroke="#fff"/>}>
            {slideIndex === 2 ? 'Get started' : 'Next'}
          </PrimaryButton>
        </div>
      </div>
    </PhoneScreen>
  );
}

function WelcomeIdentifyScreen() {
  return (
    <WelcomeFrame slideIndex={0}
      accentLabel="IDENTIFY ANY BIRD"
      headline="Point, shoot, identify."
      sub="Take a photo and birdr names the species — plus habitat, size, range, and what its call sounds like.">
      <div style={{ position: 'relative', width: 280, height: 360 }}>
        {/* Photo + scanning frame */}
        <div style={{ width: '100%', height: '100%', borderRadius: 22, overflow: 'hidden',
          boxShadow: '0 24px 50px rgba(40,30,20,0.20)' }}>
          <BirdPhoto species="cardinal" habitat="forest" style={{ width: '100%', height: '100%' }}/>
        </div>
        {/* AF brackets */}
        {[{ t: 16, l: 16, br: 0, bb: 0 }, { t: 16, r: 16, bl: 0, bb: 0 }, { b: 16, l: 16, br: 0, bt: 0 }, { b: 16, r: 16, bl: 0, bt: 0 }].map((c, i) => (
          <div key={i} style={{
            position: 'absolute', width: 28, height: 28,
            top: c.t, left: c.l, right: c.r, bottom: c.b,
            borderTop: c.bt === 0 ? 'none' : '3px solid #fff',
            borderBottom: c.bb === 0 ? 'none' : '3px solid #fff',
            borderLeft: c.bl === 0 ? 'none' : '3px solid #fff',
            borderRight: c.br === 0 ? 'none' : '3px solid #fff',
            borderRadius: 6,
          }}/>
        ))}
        {/* ID metadata banner */}
        <div style={{ position: 'absolute', left: 18, right: 18, bottom: 28,
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
          padding: '12px 14px', borderRadius: 16,
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 6px 18px rgba(40,30,20,0.20)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10,
            background: window.T.sageGrad || window.T.sage,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} stroke="#fff" width={2.2}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: -0.2 }}>Northern Cardinal</div>
            <div style={{ fontSize: 11, color: window.T.inkSoft }}>97% match · Songbird · LC</div>
          </div>
        </div>
      </div>
    </WelcomeFrame>
  );
}

function WelcomeCollectScreen() {
  return (
    <WelcomeFrame slideIndex={1}
      accentLabel="COLLECT EVERY SPECIES"
      headline="Unlock a card for every bird."
      sub="Each species becomes a collectible card with your photo as the hero. Build your personal aviary.">
      <div style={{ transform: 'rotate(-4deg)', filter: 'drop-shadow(0 30px 50px rgba(40,30,20,0.18))' }}>
        <BirdCard width={250}/>
      </div>
      <div style={{ position: 'absolute', right: -30, top: 140, transform: 'rotate(8deg)', opacity: 0.85 }}>
        <BirdCard width={180} name="Blue Jay" speciesKey="bluejay" family="Songbird" habitat="Forests"
          about="Bold, intelligent corvid known for bright blue plumage and a complex vocabulary of calls."
          firstSight="February 2, 2024, city park"
          tier="LC" size="9 - 12 in (23 - 30 cm)" count={3}/>
      </div>
    </WelcomeFrame>
  );
}

function WelcomeHabitScreen() {
  return (
    <WelcomeFrame slideIndex={2}
      accentLabel="WORK TOWARD MILESTONES"
      headline="Achievements that pull you outside."
      sub="Family masters, habitat masters, regional firsts — 160+ milestones nudge you to find the next species.">
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, padding: '0 4px' }}>
        {[
          { iconBg: window.T.sageGrad || window.T.sage,
            icon: <Trophy size={20} stroke="#fff" width={2.2}/>,
            label: 'Achievement earned', title: 'First Feather', meta: '1 of 9 collection milestones' },
          { iconBg: window.T.saffron,
            icon: <Star size={18} stroke="#fff" fill="currentColor" width={1}/>,
            label: 'Family progress', title: 'Songbirds · Apprentice', meta: '9 / 22 — next: Adept' },
          { iconBg: window.T.skyDeep,
            icon: <Pin size={20} stroke="#fff" width={2.2}/>,
            label: 'Regional', title: 'First spot in NC', meta: 'State #1 of 50' },
        ].map((r) => (
          <div key={r.title} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', borderRadius: 14,
            background: '#fff',
            border: `1px solid ${window.T.line}`,
            boxShadow: '0 2px 6px rgba(40,30,20,0.06)',
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: r.iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {r.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: window.T.inkSoft, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: 0.5 }}>{r.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: window.T.ink, marginTop: 1 }}>{r.title}</div>
              <div style={{ fontSize: 12, color: window.T.inkSoft, marginTop: 2 }}>{r.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </WelcomeFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. Sign in — OAuth only (Apple + Google). Aligned with the
// welcome-carousel template: hero illustration on top, copy + CTAs below.
// ─────────────────────────────────────────────────────────────
function SignInScreen() {
  return (
    <PhoneScreen>
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        padding: `${STATUS_H + 56}px 24px 84px`,
      }}>
        {/* Hero slot — matches WelcomeFrame proportions */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 124, height: 124, borderRadius: 36,
              background: window.T.sageGrad || `linear-gradient(135deg, ${window.T.sageLight || window.T.sage} 0%, ${window.T.sage} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 24px 50px ${window.T.sage}45`,
            }}>
              <Binocs size={64} stroke="#fff" width={2}/>
            </div>
            {/* Decorative card peek */}
            <div style={{ position: 'relative', height: 0 }}>
              <div style={{ position: 'absolute', left: -130, top: -36,
                transform: 'rotate(-12deg)', opacity: 0.95,
                filter: 'drop-shadow(0 16px 24px rgba(40,30,20,0.18))' }}>
                <BirdCardThumb name="Cardinal" family="Songbird" speciesKey="cardinal" habitatKey="forest" tier="LC" count={3} width={88}/>
              </div>
              <div style={{ position: 'absolute', right: -130, top: -32,
                transform: 'rotate(10deg)', opacity: 0.95,
                filter: 'drop-shadow(0 16px 24px rgba(40,30,20,0.18))' }}>
                <BirdCardThumb name="Blue Jay" family="Songbird" speciesKey="bluejay" habitatKey="forest" tier="LC" count={1} width={88}/>
              </div>
            </div>
          </div>
        </div>

        {/* Copy — matches welcome accent label + headline + sub rhythm */}
        <div style={{ paddingTop: 18, textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: window.T.sageDeep,
            textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
            WELCOME TO BIRDR
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.1, marginBottom: 10 }}>
            Sign in to start collecting.
          </div>
          <div style={{ fontSize: 15, color: window.T.inkSoft, lineHeight: 1.5 }}>
            Your aviary stays private — and syncs across devices.
          </div>
        </div>

        {/* OAuth buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 26 }}>
          <button style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', padding: '16px 18px', borderRadius: 14, border: 'none',
            background: '#000', color: '#fff',
            fontFamily: window.T.font, fontSize: 16, fontWeight: 600, cursor: 'pointer',
          }}>
            <Apple size={20} stroke="#fff"/>
            Continue with Apple
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', padding: '16px 18px', borderRadius: 14,
            background: '#fff', color: '#1F1F1F',
            border: `1.5px solid ${window.T.line}`,
            fontFamily: window.T.font, fontSize: 16, fontWeight: 600, cursor: 'pointer',
          }}>
            <Google size={20}/>
            Continue with Google
          </button>
        </div>

        <div style={{ fontSize: 12, color: window.T.inkFaint, textAlign: 'center', marginTop: 18, lineHeight: 1.5 }}>
          By continuing, you agree to our <u>Terms</u> and <u>Privacy Policy</u>.
        </div>
      </div>
    </PhoneScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. Permissions
// ─────────────────────────────────────────────────────────────
function PermissionsScreen() {
  const rows = [
    { icon: <Camera size={22} stroke="#fff" width={2.2}/>, bg: window.T.sage,
      title: 'Camera', meta: 'Required', checked: true,
      text: 'So you can photograph birds for identification.' },
    { icon: <Pin size={22} stroke="#fff" width={2.2}/>, bg: window.T.sky,
      title: 'Location', meta: 'Required', checked: true,
      text: 'To record where you spotted each bird. Used in your map and regional achievements.' },
    { icon: <Bell size={22} stroke="#fff" width={2.2}/>, bg: window.T.coral,
      title: 'Notifications', meta: 'Optional', checked: false,
      text: 'Streak reminders and achievement alerts.' },
  ];
  return (
    <PhoneScreen>
      <div style={{ padding: `${STATUS_H + 24}px 24px 80px`, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.6, lineHeight: 1.1, marginBottom: 8 }}>
          A few quick<br/>permissions.
        </div>
        <div style={{ fontSize: 15, color: window.T.inkSoft, marginBottom: 28 }}>
          Tap each permission to grant access. birdr needs them to work as a field guide.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
          {rows.map((r) => (
            <div key={r.title} style={{
              display: 'flex', gap: 14, padding: 16, alignItems: 'center',
              background: '#FBF9EF', borderRadius: 18,
              border: r.checked ? `1.5px solid ${window.T.sage}` : `1px solid ${window.T.line}`,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: r.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>{r.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{r.title}</div>
                  <div style={{ fontSize: 11, fontWeight: 600,
                    color: r.meta === 'Required' ? window.T.coralDeep : window.T.inkFaint,
                    background: r.meta === 'Required' ? window.T.coralTint : window.T.line,
                    padding: '2px 7px', borderRadius: 6 }}>{r.meta}</div>
                </div>
                <div style={{ fontSize: 13, color: window.T.inkSoft, marginTop: 4, lineHeight: 1.4 }}>{r.text}</div>
              </div>
              {/* Checkbox */}
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: r.checked ? (window.T.sageGrad || window.T.sage) : '#fff',
                border: r.checked ? 'none' : `2px solid ${window.T.line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: r.checked ? `0 4px 10px ${window.T.sage}40` : 'none',
              }}>
                {r.checked && <Check size={16} stroke="#fff" width={3}/>}
              </div>
            </div>
          ))}
        </div>

        <PrimaryButton color="sage" size="lg" style={{ width: '100%', marginTop: 24 }}
          trailing={<ArrowRight size={18} stroke="#fff"/>}>
          Continue
        </PrimaryButton>
      </div>
    </PhoneScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. Tutorial intro — sample Cardinal + "Try it out"
// ─────────────────────────────────────────────────────────────
function TutorialIntroScreen() {
  return (
    <PhoneScreen>
      <div style={{ position: 'absolute', top: STATUS_H + 8, right: 20, zIndex: 10 }}>
        <button style={{ background: 'transparent', border: 'none', color: window.T.inkSoft,
          fontSize: 15, fontWeight: 600, fontFamily: window.T.font, cursor: 'pointer' }}>
          Skip
        </button>
      </div>

      <div style={{ height: '100%', display: 'flex', flexDirection: 'column',
        padding: `${STATUS_H + 32}px 24px 80px` }}>

        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '4px 10px', borderRadius: 999,
            background: window.T.saffronTint, color: window.T.saffronDeep,
            fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase',
          }}>
            <Sparkles size={12} stroke={window.T.saffronDeep} width={2.4}/>
            Tutorial
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6, lineHeight: 1.1, marginTop: 10 }}>
            Try it out — let's identify your first bird.
          </div>
          <div style={{ fontSize: 14, color: window.T.inkSoft, marginTop: 8, lineHeight: 1.5 }}>
            The Cardinal was my favorite bird growing up in Missouri — big baseball fan,
            and we had them at our feeders all the time. Tap Identify to bring this one
            into your collection.
          </div>
        </div>

        {/* Sample photo with "Sample" badge */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 280, height: 320,
            borderRadius: 22, overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(40,30,20,0.18)' }}>
            <BirdPhoto species="cardinal" habitat="forest" style={{ width: '100%', height: '100%' }}/>
            <div style={{ position: 'absolute', top: 12, left: 12,
              background: 'rgba(0,0,0,0.65)', color: '#fff',
              padding: '4px 10px', borderRadius: 999,
              fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
              backdropFilter: 'blur(8px)',
            }}>
              SAMPLE
            </div>
          </div>
        </div>

        {/* Big Identify CTA — primary button */}
        <PrimaryButton color="sage" size="lg" style={{ width: '100%', marginTop: 24 }}
          leading={<Sparkles size={20} stroke="#fff" width={2.2}/>}>
          Identify
        </PrimaryButton>
      </div>
    </PhoneScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. Tutorial card reveal — with "Sample" badge + mock bonus chips
// ─────────────────────────────────────────────────────────────
function TutorialRevealScreen() {
  return (
    <PhoneScreen bg={window.T.cream}>
      {/* particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(28)].map((_, i) => {
          const a = (i * 137.5) % 360;
          const r = 110 + (i*23)%180;
          return (
            <div key={i} style={{
              position: 'absolute',
              top: `calc(38% + ${Math.sin(a*Math.PI/180)*r}px)`,
              left: `calc(50% + ${Math.cos(a*Math.PI/180)*r}px)`,
              width: 4 + (i%4), height: 4 + (i%4),
              borderRadius: '50%',
              background: [window.T.saffron, window.T.saffronLight, window.T.coral][i%3],
              opacity: 0.65,
            }}/>
          );
        })}
      </div>

      <div style={{ height: '100%', display: 'flex', flexDirection: 'column',
        padding: `${STATUS_H + 18}px 20px 70px`, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8 }}>Northern Cardinal</div>
          <div style={{ fontSize: 13, color: window.T.inkSoft }}>Songbird</div>
        </div>

        {/* Card + chips */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <div style={{ filter: 'drop-shadow(0 24px 40px rgba(40,30,20,0.18))' }}>
            <BirdCard width={250}/>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
            <div style={{
              padding: '12px 14px', borderRadius: 14, background: '#fff',
              border: `1px solid ${window.T.line}`,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: window.T.sageTint,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={18} stroke={window.T.sageDeep} width={2.2}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: window.T.inkSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Achievement earned</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>First Feather · 1 of 9 collection milestones</div>
              </div>
            </div>
            <div style={{ textAlign: 'center', fontSize: 12, color: window.T.inkSoft }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Flame size={12} stroke={window.T.coralDeep} fill="currentColor" width={2}/>
                <span className="tnum" style={{ fontWeight: 700, color: window.T.ink }}>1</span>
                <span>day streak started</span>
              </span>
            </div>
          </div>
        </div>

        <PrimaryButton color="ink" size="lg" style={{ width: '100%', marginTop: 18 }}
          trailing={<ArrowRight size={18} stroke="#fff"/>}>
          Start birding
        </PrimaryButton>
      </div>
    </PhoneScreen>
  );
}

Object.assign(window, {
  SplashScreen,
  WelcomeIdentifyScreen, WelcomeCollectScreen, WelcomeHabitScreen,
  SignInScreen, SignInAltScreen, PermissionsScreen,
  TutorialIntroScreen, TutorialRevealScreen,
});

// ─────────────────────────────────────────────────────────────
// Sign in — original centered layout (preserved for comparison).
// Not the active design template; kept on the canvas so the previous
// flow stays visible alongside the redesigned version.
// ─────────────────────────────────────────────────────────────
function SignInAltScreen() {
  return (
    <PhoneScreen>
      <div style={{ padding: `${STATUS_H + 40}px 28px 80px`, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
          <div style={{
            width: 96, height: 96, borderRadius: 28,
            background: window.T.sageGrad || window.T.sage,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 16px 40px ${window.T.sage}50`,
          }}>
            <Binocs size={50} stroke="#fff" width={2}/>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1 }}>birdr</div>
            <div style={{ fontSize: 15, color: window.T.inkSoft, marginTop: 8, maxWidth: 280, lineHeight: 1.4 }}>
              A field guide that grows with every bird you find.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', padding: '15px 18px', borderRadius: 14, border: 'none',
            background: '#000', color: '#fff',
            fontFamily: window.T.font, fontSize: 16, fontWeight: 600, cursor: 'pointer',
          }}>
            <Apple size={20} stroke="#fff"/>
            Continue with Apple
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', padding: '15px 18px', borderRadius: 14,
            background: '#fff', color: '#1F1F1F',
            border: `1.5px solid ${window.T.line}`,
            fontFamily: window.T.font, fontSize: 16, fontWeight: 600, cursor: 'pointer',
          }}>
            <Google size={20}/>
            Continue with Google
          </button>
        </div>

        <div style={{ fontSize: 12, color: window.T.inkFaint, textAlign: 'center', marginTop: 22, lineHeight: 1.5 }}>
          By continuing, you agree to our <u>Terms</u> and <u>Privacy Policy</u>.
        </div>
      </div>
    </PhoneScreen>
  );
}


// ====== screens-capture.jsx ======
// Capture flow screens: Hub, Camera, Photo preview, Identifying,
// Card unlock reveal, Top-3 picker.

// ─────────────────────────────────────────────────────────────
// Capture Hub — the default landing tab.
// ─────────────────────────────────────────────────────────────
function CaptureHubScreen() {
  return (
    <PhoneScreen tabBar={<TabBar active="capture"/>}>
      <div style={{ paddingTop: STATUS_H + 8, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top row: birdr wordmark + bell */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 4px' }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.6 }}>birdr</div>
          <CircleBtn size={36}><Bell size={18} stroke={window.T.ink} width={2}/></CircleBtn>
        </div>

        {/* Central capture button — sage primary, gentle pulse */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 220, height: 220 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%',
              background: `radial-gradient(circle, ${window.T.sage}1A 0%, transparent 70%)`,
              animation: 'birdr-capture-pulse 2.4s ease-in-out infinite',
            }}/>
            <div style={{ position: 'absolute', inset: 22, borderRadius: '50%',
              border: `1.5px dashed ${window.T.sageLight || window.T.sage}`, opacity: 0.4,
              animation: 'birdr-capture-ring 2.4s ease-in-out infinite',
            }}/>
            <div style={{
              position: 'absolute', inset: 36, borderRadius: '50%',
              background: window.T.sageGrad || `linear-gradient(180deg, ${window.T.sageLight || window.T.sage} 0%, ${window.T.sage} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 12px 28px ${window.T.sage}55, inset 0 -3px 6px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.30)`,
              cursor: 'pointer',
              animation: 'birdr-capture-pulse 2.4s ease-in-out infinite',
            }}>
              <Binocs size={64} stroke="#fff" width={1.8}/>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '0 24px 32px' }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.4 }}>Find a bird</div>
          <div style={{ fontSize: 14, color: window.T.inkSoft, marginTop: 6, lineHeight: 1.5 }}>
            Tap the binoculars to take a photo — birdr will tell you what you've spotted.
          </div>
        </div>
      </div>
    </PhoneScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// Camera viewfinder (live)
// ─────────────────────────────────────────────────────────────
function CameraScreen() {
  return (
    <PhoneScreen dark bg="#0E0E0E">
      {/* Live feed — gradient stand-in (real camera in production) */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #4C5C36 0%, #6A7E48 30%, #45562B 70%, #2A361A 100%)',
      }}>
        {/* subtle blurred bird silhouette in the frame */}
        <div style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%, -50%)', filter: 'blur(0.5px)', opacity: 0.95 }}>
          <svg width="160" height="160" viewBox="0 0 240 240">
            <g transform="translate(20,20) scale(0.9)">{window.birdSilhouettes.cardinal.shape}</g>
          </svg>
        </div>
        {/* leaves */}
        <div style={{ position: 'absolute', top: 80, left: 10, width: 80, height: 60,
          background: '#3B5523', borderRadius: '60% 40% 60% 40%', opacity: 0.5, filter: 'blur(3px)' }}/>
        <div style={{ position: 'absolute', bottom: 200, right: -10, width: 100, height: 70,
          background: '#3B5523', borderRadius: '60% 40% 60% 40%', opacity: 0.4, filter: 'blur(3px)' }}/>
      </div>

      {/* Top dark gradient */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 140,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)', pointerEvents: 'none' }}/>

      {/* Top controls */}
      <div style={{ position: 'absolute', top: STATUS_H + 4, left: 16, right: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <CircleBtn dark size={40} bg="rgba(0,0,0,0.45)"><X size={20} stroke="#fff"/></CircleBtn>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 999,
          background: 'rgba(0,0,0,0.55)', color: '#fff',
          fontSize: 13, fontWeight: 600,
          backdropFilter: 'blur(10px)',
        }}>
          <Bolt size={13} stroke={window.T.saffronLight} fill="currentColor" width={2}/>
          2 of 3 today
        </div>
        <CircleBtn dark size={40} bg="rgba(0,0,0,0.45)">
          <Flash size={20} stroke={window.T.saffronLight}/>
        </CircleBtn>
      </div>

      {/* Center brackets */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -55%)',
        width: 220, height: 220, opacity: 0.85, pointerEvents: 'none',
      }}>
        {[
          { top: 0, left: 0, br: 0, bb: 0 },
          { top: 0, right: 0, bl: 0, bb: 0 },
          { bottom: 0, left: 0, br: 0, bt: 0 },
          { bottom: 0, right: 0, bl: 0, bt: 0 },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute', width: 28, height: 28,
            borderTop: c.bt === 0 ? 'none' : `2.5px solid #fff`,
            borderBottom: c.bb === 0 ? 'none' : `2.5px solid #fff`,
            borderLeft: c.bl === 0 ? 'none' : `2.5px solid #fff`,
            borderRight: c.br === 0 ? 'none' : `2.5px solid #fff`,
            borderRadius: 6,
            top: c.top, left: c.left, right: c.right, bottom: c.bottom,
          }}/>
        ))}
      </div>

      {/* AF dot */}
      <div style={{ position: 'absolute', top: '36%', left: '60%',
        width: 60, height: 60, borderRadius: '50%',
        border: `1.5px solid ${window.T.saffronLight}`,
        boxShadow: `0 0 0 3px rgba(0,0,0,0.2)`,
      }}/>

      {/* Bottom dark gradient */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200,
        background: 'linear-gradient(0deg, rgba(0,0,0,0.55) 0%, transparent 100%)', pointerEvents: 'none' }}/>

      {/* Zoom pills */}
      <div style={{ position: 'absolute', bottom: 150, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 8 }}>
        {[{ z: '1×', a: true }, { z: '2×', a: false }, { z: '3×', a: false }].map((b) => (
          <div key={b.z} style={{
            padding: '8px 14px', borderRadius: 999,
            background: b.a ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.45)',
            color: b.a ? window.T.saffronDeep : '#fff',
            fontSize: 13, fontWeight: 700,
            backdropFilter: 'blur(8px)',
          }}>{b.z}</div>
        ))}
      </div>

      {/* Shutter */}
      <div style={{ position: 'absolute', bottom: 36, left: 0, right: 0,
        display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 78, height: 78, borderRadius: '50%',
          border: '5px solid #fff', padding: 6,
          background: 'rgba(255,255,255,0.15)',
        }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fff' }}/>
        </div>
      </div>
    </PhoneScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// Photo preview ("Looks good?")
// ─────────────────────────────────────────────────────────────
function PhotoPreviewScreen() {
  return (
    <PhoneScreen dark bg="#0E0E0E">
      <div style={{ position: 'absolute', inset: 0 }}>
        <BirdPhoto species="cardinal" habitat="forest" style={{ width: '100%', height: '100%' }}/>
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 140,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 100%)', pointerEvents: 'none' }}/>

      <div style={{ position: 'absolute', top: STATUS_H + 4, left: 16, right: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <CircleBtn dark size={40} bg="rgba(0,0,0,0.45)"><X size={20} stroke="#fff"/></CircleBtn>
        <div style={{ color: '#fff', fontSize: 16, fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
          Looks good?
        </div>
        <div style={{ width: 40 }}/>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200,
        background: 'linear-gradient(0deg, rgba(0,0,0,0.55) 0%, transparent 100%)', pointerEvents: 'none' }}/>

      {/* Bottom actions */}
      <div style={{ position: 'absolute', bottom: 40, left: 16, right: 16,
        display: 'flex', gap: 10 }}>
        <button style={{
          flex: '0 0 32%', padding: '15px 18px', borderRadius: 999,
          background: 'rgba(0,0,0,0.55)', color: '#fff', border: '1px solid rgba(255,255,255,0.18)',
          fontFamily: window.T.font, fontSize: 15, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          backdropFilter: 'blur(10px)', cursor: 'pointer',
        }}>
          <Refresh size={16} stroke="#fff" width={2}/>
          Retake
        </button>
        <PrimaryButton color="sage" size="md" style={{ flex: 1 }}
          leading={<Sparkles size={18} stroke="#fff" width={2}/>}>
          Identify
        </PrimaryButton>
      </div>
    </PhoneScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// Card unlock reveal — settled state (beat 5).
// Dark stage; the card sits center, then a vertical stack of
// horizontal-card rows lists the achievements + streak earned.
// ─────────────────────────────────────────────────────────────
function CardUnlockScreen() {
  return (
    <PhoneScreen dark bg="#16181A">
      {/* particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(34)].map((_, i) => {
          const a = (i * 137.5) % 360;
          const r = 110 + (i*23)%200;
          return (
            <div key={i} style={{
              position: 'absolute',
              top: `calc(40% + ${Math.sin(a*Math.PI/180)*r}px)`,
              left: `calc(50% + ${Math.cos(a*Math.PI/180)*r}px)`,
              width: 3 + (i%4), height: 3 + (i%4),
              borderRadius: '50%',
              background: [window.T.saffron, window.T.saffronLight, window.T.sageLight || window.T.sage, '#fff'][i%4],
              opacity: 0.55,
            }}/>
          );
        })}
      </div>

      <div style={{ height: '100%', display: 'flex', flexDirection: 'column',
        padding: `${STATUS_H + 22}px 20px 32px`, position: 'relative', color: '#fff' }}>
        {/* FIRST SIGHT label — left-aligned to match the card */}
        <div style={{ textAlign: 'left', marginBottom: 6, paddingLeft: 4 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,0.10)',
            border: `1px solid rgba(255,255,255,0.18)`,
            color: window.T.saffronLight,
            fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase',
          }}>
            <Sparkles size={12} stroke={window.T.saffronLight} width={2.4}/>
            FIRST SIGHT
          </div>
        </div>
        <div style={{ textAlign: 'left', marginBottom: 12, paddingLeft: 4 }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.8, color: '#fff' }}>Northern Cardinal</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>Songbird</div>
        </div>

        {/* Card */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.4))' }}>
            <BirdCard width={250}/>
          </div>
        </div>

        {/* Horizontal-card rows: achievement + family progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          <RevealRow
            iconBg={window.T.sageGrad || window.T.sage}
            icon={<Trophy size={20} stroke="#fff" width={2.2}/>}
            label="Achievement earned"
            title="First Feather"
            meta="1 of 9 collection milestones"
          />
          <RevealRow
            iconBg={window.T.skyDeep}
            icon={<Star size={18} stroke="#fff" fill="currentColor" width={1}/>}
            label="Family progress"
            title="Songbirds · Adept"
            meta="3 more to unlock"
            progress={0.88}
            progressColor={window.T.sageLight || window.T.sage}
          />
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button style={{
            flex: 1, padding: '14px 18px', borderRadius: 999,
            background: 'rgba(255,255,255,0.10)', color: '#fff',
            border: `1px solid rgba(255,255,255,0.22)`,
            fontFamily: window.T.font, fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}>Continue</button>
          <PrimaryButton color="sage" style={{ flex: 1 }} trailing={<ArrowRight size={16} stroke="#fff"/>}>
            View card
          </PrimaryButton>
        </div>
      </div>
    </PhoneScreen>
  );
}

function RevealRow({ iconBg, icon, label, title, meta, progress, progressColor }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 18px', borderRadius: 14,
      background: '#fff',
      border: `1px solid ${window.T.line}`,
      boxShadow: '0 4px 10px rgba(0,0,0,0.18)',
    }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <div style={{ fontSize: 11, color: window.T.inkSoft, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: window.T.ink, marginTop: 1 }}>{title}</div>
        {progress !== undefined ? (
          <div style={{ marginTop: 8, height: 4, background: window.T.line, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${progress * 100}%`, height: '100%', background: progressColor, borderRadius: 2 }}/>
          </div>
        ) : meta ? (
          <div style={{ fontSize: 12, color: window.T.inkSoft, marginTop: 2 }}>{meta}</div>
        ) : null}
      </div>
      {meta && progress !== undefined && (
        <div style={{ fontSize: 11, color: window.T.inkSoft, marginLeft: 4, flexShrink: 0 }}>{meta}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Top-3 candidate picker
// ─────────────────────────────────────────────────────────────
function Top3Screen() {
  const candidates = [
    { name: 'Northern Cardinal', meta: 'Songbird · Bright red, black face mask', sp: 'cardinal', hab: 'forest', mostLikely: true },
    { name: 'Pyrrhuloxia',        meta: 'Songbird · Gray body, red accents',       sp: 'cardinal', hab: 'desert' },
    { name: 'Summer Tanager',     meta: 'Songbird · All-red, pale bill',           sp: 'cardinal', hab: 'forest' },
  ];
  return (
    <PhoneScreen>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{ paddingTop: STATUS_H + 4, padding: `${STATUS_H + 4}px 16px 12px`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <CircleBtn size={36}><X size={18} stroke={window.T.ink}/></CircleBtn>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Identify</div>
          <CircleBtn size={36}><HelpCircle size={18} stroke={window.T.ink}/></CircleBtn>
        </div>

        {/* User photo */}
        <div style={{ margin: '0 16px', borderRadius: 18, overflow: 'hidden', position: 'relative', height: 200 }}>
          <BirdPhoto species="cardinal" habitat="forest" style={{ width: '100%', height: '100%' }}/>
          <div style={{ position: 'absolute', top: 10, left: 10,
            background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 10px', borderRadius: 999,
            fontSize: 11, fontWeight: 600, letterSpacing: 0.4, backdropFilter: 'blur(8px)' }}>
            Your photo
          </div>
        </div>

        {/* Heading */}
        <div style={{ padding: '20px 20px 12px' }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.4 }}>Pick the bird you spotted</div>
          <div style={{ fontSize: 13, color: window.T.inkSoft, marginTop: 4 }}>
            A few species look alike — tap the closest match.
          </div>
        </div>

        {/* Candidates */}
        <div style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'auto' }}>
          {candidates.map((c, i) => (
            <div key={i} style={{
              position: 'relative',
              display: 'flex', alignItems: 'center', gap: 12,
              padding: 14, borderRadius: 16,
              background: '#fff',
              border: c.mostLikely ? `1.5px solid ${window.T.saffron}` : `1px solid ${window.T.line}`,
            }}>
              {c.mostLikely && (
                <div style={{ position: 'absolute', top: -10, left: 12,
                  background: window.T.saffron, color: window.T.ink, padding: '2px 10px', borderRadius: 999,
                  fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
                  Most likely
                </div>
              )}
              <BirdThumb species={c.sp} habitat={c.hab} size={64} radius={12}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: window.T.inkSoft, marginTop: 2 }}>{c.meta}</div>
              </div>
              <Chevron size={20} stroke={window.T.inkFaint}/>
            </div>
          ))}

          <div style={{ height: 1, background: window.T.line, margin: '8px 4px' }}/>

          <button style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px 16px 4px', background: 'transparent', border: 'none',
            color: window.T.inkSoft, fontSize: 14, fontWeight: 600, fontFamily: window.T.font,
            cursor: 'pointer',
          }}>
            <Refresh size={16} stroke={window.T.inkSoft} width={2}/>
            None of these match
          </button>
          <div style={{ textAlign: 'center', fontSize: 12, color: window.T.inkFaint,
            paddingBottom: 12, lineHeight: 1.4 }}>
            We won't charge a snap if none of these match.
          </div>
        </div>
      </div>
    </PhoneScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// Identifying screen (loading)
// ─────────────────────────────────────────────────────────────
function IdentifyingScreen() {
  return (
    <PhoneScreen dark bg="#0E0E0E">
      <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
        <BirdPhoto species="cardinal" habitat="forest" style={{ width: '100%', height: '100%' }}/>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }}/>

      <div style={{ position: 'absolute', top: '40%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          border: `4px solid ${window.T.sage}`,
          borderTopColor: 'transparent',
          animation: 'birdr-spin 1s linear infinite',
        }}/>
        <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, letterSpacing: -0.3,
          textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>Identifying…</div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
          Checking against 900 North American species
        </div>
      </div>
    </PhoneScreen>
  );
}

Object.assign(window, {
  CaptureHubScreen, CameraScreen, PhotoPreviewScreen,
  CardUnlockScreen, Top3Screen, IdentifyingScreen,
});


// ====== screens-collection.jsx ======
// Collection tab screens: Spotted grid, All NA grid, Card detail (spotted + locked).

// Sample species for the grid
const SPOTTED = [
  { name: 'Cardinal',         family: 'Songbird',  sp: 'cardinal',   hab: 'forest',     tier: 'LC', count: 7 },
  { name: 'Blue Jay',         family: 'Songbird',  sp: 'bluejay',    hab: 'forest',     tier: 'LC', count: 3 },
  { name: 'Robin',            family: 'Songbird',  sp: 'robin',      hab: 'urban',      tier: 'LC', count: 12 },
  { name: 'Goldfinch',        family: 'Songbird',  sp: 'goldfinch',  hab: 'grassland',  tier: 'LC', count: 4 },
  { name: 'Mallard',          family: 'Waterfowl', sp: 'duck',       hab: 'freshwater', tier: 'LC', count: 5 },
  { name: "Cooper's Hawk",    family: 'Raptor',    sp: 'hawk',       hab: 'forest',     tier: 'LC', count: 1 },
  { name: 'Snowy Owl',        family: 'Raptor',    sp: 'owl',        hab: 'tundra',     tier: 'VU', count: 1 },
  { name: 'Yellow Warbler',   family: 'Songbird',  sp: 'warbler',    hab: 'wetland',    tier: 'LC', count: 2 },
  { name: "Anna's Hummer",    family: 'Aerial',    sp: 'hummingbird',hab: 'desert',     tier: 'LC', count: 8 },
  { name: 'Downy Woodpecker', family: 'Woodpecker',sp: 'woodpecker', hab: 'forest',     tier: 'LC', count: 6 },
  { name: 'Chickadee',        family: 'Songbird',  sp: 'warbler',    hab: 'forest',     tier: 'LC', count: 9 },
  { name: 'Burrowing Owl',    family: 'Raptor',    sp: 'owl',        hab: 'grassland',  tier: 'NT', count: 1 },
];

// ─────────────────────────────────────────────────────────────
// Collection — Spotted view (default)
// ─────────────────────────────────────────────────────────────
function CollectionSpottedScreen() {
  const first = SPOTTED.slice(0, 3);
  const rest  = SPOTTED.slice(3);

  return (
    <PhoneScreen tabBar={<TabBar active="collection"/>}>
      <div style={{ paddingTop: STATUS_H + 4, height: '100%', overflow: 'auto', paddingBottom: TAB_H + 16 }}>
        {/* Header */}
        <div style={{ padding: '12px 20px 6px' }}>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.6 }}>Collection</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <Pill style={{ background: window.T.coralTint, color: window.T.coralDeep }}>
              <Flame size={12} stroke={window.T.coralDeep} fill="currentColor" width={2}/>12
            </Pill>
            <div style={{ fontSize: 13, color: window.T.inkSoft }}>
              47 species · 134 captures
            </div>
          </div>
        </div>

        {/* Tab selector */}
        <div style={{ padding: '14px 20px 12px' }}>
          <SegmentedControl
            value="spotted"
            options={[
              { value: 'spotted', label: 'Spotted · 47' },
              { value: 'all',     label: 'All N. America · 900' },
            ]}/>
        </div>

        {/* Search + filter */}
        <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8,
            background: '#fff', borderRadius: 12, padding: '10px 12px',
            border: `1px solid ${window.T.line}` }}>
            <Search size={18} stroke={window.T.inkFaint}/>
            <div style={{ color: window.T.inkFaint, fontSize: 14 }}>Search species</div>
          </div>
          <button style={{
            width: 42, height: 42, borderRadius: 12, background: '#fff',
            border: `1px solid ${window.T.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <Filter size={20} stroke={window.T.ink}/>
          </button>
        </div>

        {/* Filter chips */}
        <div style={{ padding: '0 20px 14px', display: 'flex', gap: 6, overflowX: 'auto' }}>
          {['Recently spotted ↓', 'All families', 'All habitats'].map((t, i) => (
            <div key={t} style={{
              flexShrink: 0,
              padding: '6px 12px', borderRadius: 999,
              background: i === 0 ? window.T.ink : '#fff',
              color: i === 0 ? '#fff' : window.T.ink,
              fontSize: 12, fontWeight: 600,
              border: i === 0 ? 'none' : `1px solid ${window.T.line}`,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>{t}</div>
          ))}
        </div>

        {/* Spacer between filters and grid */}
        <div style={{ height: 14 }}/>

        {/* This week */}
        <div style={{ padding: '0 20px 8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: window.T.inkSoft, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            This week
          </div>
          <div style={{ fontSize: 12, color: window.T.inkFaint }}>3</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '0 20px 18px' }}>
          {first.map((s) => (
            <BirdCardThumb key={s.name} name={s.name} family={s.family} speciesKey={s.sp} habitatKey={s.hab} tier={s.tier} count={s.count} width={108}/>
          ))}
        </div>

        {/* Earlier */}
        <div style={{ padding: '0 20px 8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: window.T.inkSoft, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Earlier this month
          </div>
          <div style={{ fontSize: 12, color: window.T.inkFaint }}>9</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '0 20px' }}>
          {rest.map((s) => (
            <BirdCardThumb key={s.name} name={s.name} family={s.family} speciesKey={s.sp} habitatKey={s.hab} tier={s.tier} count={s.count} width={108}/>
          ))}
        </div>
      </div>
    </PhoneScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// Collection — All North America (Pokédex w/ locked silhouettes)
// ─────────────────────────────────────────────────────────────
function CollectionAllScreen() {
  const forests = [
    { name: 'Cardinal',     family: 'Songbird',  sp: 'cardinal', hab: 'forest', tier: 'LC', count: 7 },
    { name: 'Blue Jay',     family: 'Songbird',  sp: 'bluejay', hab: 'forest', tier: 'LC', count: 3 },
    { locked: true }, { locked: true },
    { name: 'Downy Wpkr',   family: 'Woodpecker',sp: 'woodpecker', hab: 'forest', tier: 'LC', count: 6 },
    { locked: true }, { locked: true }, { locked: true }, { locked: true },
  ];
  const wetlands = [
    { name: 'Yellow Warbler', family: 'Songbird', sp: 'warbler', hab: 'wetland', tier: 'LC', count: 2 },
    { locked: true }, { locked: true }, { locked: true }, { locked: true }, { locked: true },
  ];

  const Section = ({ title, count, total, items, color }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ padding: '0 20px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: window.T.ink }}>{title}</div>
        <div style={{ flex: 1, height: 4, background: window.T.line, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(count/total)*100}%`, background: color || window.T.sage, borderRadius: 2 }}/>
        </div>
        <div className="tnum" style={{ fontSize: 12, color: window.T.inkSoft, fontWeight: 600 }}>
          {count} <span style={{ opacity: 0.6 }}>of {total}</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '0 20px' }}>
        {items.map((s, i) => (
          <BirdCardThumb key={i} {...s} width={108}/>
        ))}
      </div>
    </div>
  );

  return (
    <PhoneScreen tabBar={<TabBar active="collection"/>}>
      <div style={{ paddingTop: STATUS_H + 4, height: '100%', overflow: 'auto', paddingBottom: TAB_H + 16 }}>
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.6 }}>Collection</div>
        </div>

        <div style={{ padding: '14px 20px 12px' }}>
          <SegmentedControl
            value="all"
            options={[
              { value: 'spotted', label: 'Spotted · 47' },
              { value: 'all',     label: 'All N. America · 900' },
            ]}/>
        </div>

        {/* progress band */}
        <div style={{ margin: '0 20px 16px', padding: 14, borderRadius: 16,
          background: `linear-gradient(135deg, ${window.T.sageTint} 0%, #DAE7CD 100%)`,
          display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: window.T.sage,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Book size={22} stroke="#fff" width={2}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.45)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: '5.2%', height: '100%', background: window.T.sage, borderRadius: 3 }}/>
            </div>
            <div className="tnum" style={{ marginTop: 6, fontSize: 12, color: window.T.sageDeep, fontWeight: 600 }}>
              47 / 900 collected
            </div>
          </div>
        </div>

        <Section title="Forests" count={15} total={92} items={forests}/>
        <Section title="Wetlands" count={4} total={33} items={wetlands} color={window.T.skyDeep}/>
      </div>
    </PhoneScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// Card detail (spotted variant) — photo-led layout.
// ─────────────────────────────────────────────────────────────
// Card detail (spotted) — the card IS the screen. Tap → expanded.
// A bottom sheet peeks in showing minimal context (sightings, last seen);
// drag/tap to expand for the full detail panel.
// ─────────────────────────────────────────────────────────────
function CardDetailScreen() {
  return (
    <PhoneScreen bg={window.T.paper}>
      <div style={{ height: '100%', position: 'relative' }}>
        {/* Top bar */}
        <div style={{ position: 'absolute', top: STATUS_H + 4, left: 16, right: 16, zIndex: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <CircleBtn size={38} bg="rgba(255,255,255,0.92)"><ChevronLeft size={20} stroke={window.T.ink}/></CircleBtn>
          <div style={{ width: 38 }}/>
        </div>

        {/* The card — fills the visible area */}
        <div style={{
          position: 'absolute', top: STATUS_H + 50, left: 0, right: 0, bottom: 130,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 64px',
        }}>
          <div style={{ filter: 'drop-shadow(0 28px 48px rgba(40,30,20,0.26))', transform: 'translateY(-8px)' }}>
            <BirdCard width={250} count={7}/>
          </div>
        </div>

        {/* Swipe chevrons — left/right between cards in the collection */}
        <SwipeChevron side="left"/>
        <SwipeChevron side="right"/>

        {/* Bottom sheet — peek state */}
        <BottomSheetPeek/>
      </div>
    </PhoneScreen>
  );
}

// Left/right chevron overlays for swiping between cards.
// Sage-filled circular buttons with a dark drop-shadow; padded off the card edge.
function SwipeChevron({ side, disabled = false }) {
  if (disabled) return null;
  return (
    <div style={{
      position: 'absolute', top: '46%', transform: 'translateY(-50%)',
      [side]: 22, zIndex: 3,
      width: 48, height: 48, borderRadius: '50%',
      background: window.T.sageGrad || window.T.sage,
      boxShadow: '0 10px 18px rgba(20,30,20,0.30), 0 4px 6px rgba(20,30,20,0.18)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
      color: '#fff',
    }}>
      {side === 'left'
        ? <ChevronLeft size={22} stroke="#fff" width={2.6}/>
        : <Chevron size={22} stroke="#fff" width={2.6}/>}
    </div>
  );
}

function BottomSheetPeek() {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: '#fff',
      borderTopLeftRadius: 26, borderTopRightRadius: 26,
      boxShadow: '0 -12px 32px rgba(40,30,20,0.18)',
      padding: '12px 20px 28px',
      zIndex: 5,
    }}>
      {/* Drag handle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <div style={{ width: 44, height: 5, borderRadius: 3, background: '#D6CFBE' }}/>
      </div>

      {/* Single-line summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: window.T.coralTint,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Pin size={20} stroke={window.T.coralDeep} width={2.2}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: window.T.inkSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Last spotted yesterday
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, marginTop: 1 }}>
            Backyard feeder · Asheville, NC
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 10px', borderRadius: 999, background: window.T.sageTint, color: window.T.sageDeep,
          fontSize: 12, fontWeight: 700,
        }}>
          <Star size={12} stroke={window.T.sageDeep} fill="currentColor" width={1}/>
          <span className="tnum">7 sightings</span>
        </div>
      </div>

      {/* Pull-up affordance */}
      <div style={{
        marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        fontSize: 12, color: window.T.inkFaint, fontWeight: 600,
      }}>
        <ArrowUp size={12} stroke={window.T.inkFaint} width={2.2}/>
        Swipe up for sightings · habitat · range
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Card detail (expanded sheet) — sheet pulled up, card stays
// behind it scaled down so the user still sees the collectible.
// ─────────────────────────────────────────────────────────────
function CardDetailExpandedScreen() {
  return (
    <PhoneScreen bg="#1B1916">
      <div style={{ height: '100%', position: 'relative' }}>
        {/* Top bar over the dimmed card area */}
        <div style={{ position: 'absolute', top: STATUS_H + 4, left: 16, right: 16, zIndex: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <CircleBtn size={38} bg="rgba(255,255,255,0.92)"><ChevronLeft size={20} stroke={window.T.ink}/></CircleBtn>
          <CircleBtn size={38} bg="rgba(255,255,255,0.92)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill={window.T.ink}>
              <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
            </svg>
          </CircleBtn>
        </div>

        {/* Background card — smaller, behind sheet */}
        <div style={{
          position: 'absolute', top: STATUS_H + 28, left: 0, right: 0,
          height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0.55,
        }}>
          <div style={{ transform: 'scale(0.85)' }}>
            <BirdCard width={300} compact={true} count={7}/>
          </div>
        </div>

        {/* Expanded sheet */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          top: STATUS_H + 220,
          background: '#fff',
          borderTopLeftRadius: 26, borderTopRightRadius: 26,
          boxShadow: '0 -18px 40px rgba(0,0,0,0.30)',
          overflow: 'auto',
          padding: '12px 20px 24px',
        }}>
          {/* Drag handle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <div style={{ width: 44, height: 5, borderRadius: 3, background: '#D6CFBE' }}/>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.4 }}>Your sightings</div>
            <div style={{ fontSize: 13, color: window.T.inkSoft, marginTop: 2 }}>7 spots across Asheville · since Jan 15</div>
          </div>

          {/* Recent sightings list */}
          <div style={{ marginBottom: 10, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: window.T.inkSoft, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Recent sightings
            </div>
            <button style={{ background: 'transparent', border: 'none', color: window.T.sage,
              fontSize: 12, fontWeight: 700, fontFamily: window.T.font, cursor: 'pointer' }}>
              View all 7 →
            </button>
          </div>
          <div style={{ background: '#FBF9EF', borderRadius: 14, overflow: 'hidden',
            border: `1px solid ${window.T.line}`, marginBottom: 18 }}>
            {[
              { date: 'Yesterday', time: '7:42 AM', loc: 'Backyard feeder' },
              { date: 'May 18', time: '5:18 PM', loc: 'Riverside Park' },
              { date: 'May 12', time: '8:03 AM', loc: 'Backyard feeder' },
            ].map((s, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${window.T.line}` }}>
                <BirdThumb species="cardinal" habitat="forest" size={44} radius={10}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{s.date} <span style={{ color: window.T.inkFaint, fontWeight: 500 }}>· {s.time}</span></div>
                  <div style={{ fontSize: 12, color: window.T.inkSoft, marginTop: 1 }}>{s.loc}</div>
                </div>
                <Chevron size={16} stroke={window.T.inkFaint}/>
              </div>
            ))}
          </div>

          {/* Compact map */}
          <div style={{ borderRadius: 14, overflow: 'hidden', position: 'relative',
            border: `1px solid ${window.T.line}`, height: 130 }}>
            <RangeMap habitat="forest" style={{ width: '100%', height: '100%' }}/>
            {[[60, 65], [62, 68], [58, 70], [64, 62], [72, 72]].map(([x, y], i) => (
              <div key={i} style={{
                position: 'absolute', left: `${x}%`, top: `${y}%`,
                transform: 'translate(-50%, -100%)',
              }}>
                <Pin size={18} stroke={window.T.coral} fill={window.T.coral} width={1}/>
              </div>
            ))}
            <div style={{ position: 'absolute', bottom: 8, left: 8,
              background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
              padding: '5px 10px', borderRadius: 999,
              fontSize: 11, fontWeight: 700, color: window.T.ink }}>
              Asheville, NC · 5 spots
            </div>
          </div>
        </div>
      </div>
    </PhoneScreen>
  );
}

function StatTile({ icon, label, value, sub, tint, ink }) {
  return (
    <div style={{ padding: '12px 12px', borderRadius: 16, background: tint }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {icon}
      </div>
      <div className="tnum" style={{ fontSize: 22, fontWeight: 800, color: ink, letterSpacing: -0.4, marginTop: 6, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: ink, opacity: 0.85, marginTop: 4, fontWeight: 600 }}>
        {label}{sub ? <span style={{ opacity: 0.7 }}> · {sub}</span> : null}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Card detail (locked / unspotted)
// ─────────────────────────────────────────────────────────────
function CardDetailLockedScreen() {
  return (
    <PhoneScreen bg={window.T.paper}>
      <div style={{ height: '100%', position: 'relative' }}>
        {/* Top bar */}
        <div style={{ position: 'absolute', top: STATUS_H + 4, left: 16, right: 16, zIndex: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <CircleBtn size={38} bg="rgba(255,255,255,0.92)"><ChevronLeft size={20} stroke={window.T.ink}/></CircleBtn>
          <div style={{ width: 38 }}/>
        </div>

        {/* The (locked) card — fills the visible area */}
        <div style={{
          position: 'absolute', top: STATUS_H + 50, left: 0, right: 0, bottom: 180,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 64px',
        }}>
          <div style={{ filter: 'drop-shadow(0 28px 48px rgba(40,30,20,0.22))', transform: 'translateY(-8px)' }}>
            <BirdCard width={250} locked
              name="Scarlet Tanager" family="Songbird" habitat="Forests"
              habitatKey="forest" speciesKey="cardinal" tier="LC" count={0}
              showSightingBadge={false}/>
          </div>
        </div>

        <SwipeChevron side="left"/>
        <SwipeChevron side="right"/>

        {/* Bottom sheet — "Where to find them" */}
        <LockedBottomSheet/>
      </div>
    </PhoneScreen>
  );
}

function LockedBottomSheet() {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: '#fff',
      borderTopLeftRadius: 26, borderTopRightRadius: 26,
      boxShadow: '0 -12px 32px rgba(40,30,20,0.18)',
      padding: '12px 20px 28px',
      zIndex: 5,
    }}>
      {/* Drag handle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
        <div style={{ width: 44, height: 5, borderRadius: 3, background: '#D6CFBE' }}/>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: window.T.inkSoft, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          Where to find them
        </div>
        <div style={{ fontSize: 12, color: window.T.inkSoft, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <ArrowUp size={12} stroke={window.T.inkSoft} width={2.2}/>
          Swipe up
        </div>
      </div>

      {/* US range map */}
      <div style={{ borderRadius: 14, overflow: 'hidden', position: 'relative',
        border: `1px solid ${window.T.line}`, height: 170 }}>
        <RangeMap habitat="forest" style={{ width: '100%', height: '100%' }}/>
        <div style={{ position: 'absolute', bottom: 8, left: 8,
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
          padding: '5px 10px', borderRadius: 999,
          fontSize: 11, fontWeight: 700, color: window.T.ink }}>
          Summer breeder · Eastern US
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  CollectionSpottedScreen, CollectionAllScreen,
  CardDetailScreen, CardDetailExpandedScreen, CardDetailLockedScreen,
});


// ====== screens-explore.jsx ======
// Explore tab screens: Near me list, My map.

// ─────────────────────────────────────────────────────────────
// Explore — Near me (default)
// ─────────────────────────────────────────────────────────────
function ExploreNearScreen() {
  const unspotted = [
    { name: 'Wood Thrush',         family: 'Songbird',     sp: 'warbler',    hab: 'forest' },
    { name: 'Pileated Woodpecker', family: 'Woodpecker',   sp: 'woodpecker', hab: 'forest' },
    { name: 'Red-shouldered Hawk', family: 'Bird of prey', sp: 'hawk',       hab: 'forest' },
    { name: 'Eastern Bluebird',    family: 'Songbird',     sp: 'goldfinch',  hab: 'grassland' },
  ];
  const spotted = [
    { name: 'Northern Cardinal',   family: 'Songbird',     sp: 'cardinal',   hab: 'forest' },
    { name: 'American Robin',      family: 'Songbird',     sp: 'robin',      hab: 'urban' },
  ];

  const Row = ({ name, family, sp, hab, status }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      borderBottom: `1px solid ${window.T.line}`,
    }}>
      <BirdThumb species={sp} habitat={hab} size={54} radius={12}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.2 }}>{name}</div>
        <div style={{ fontSize: 12, color: window.T.inkSoft, marginTop: 2 }}>{family}</div>
      </div>
      {status === 'spotted' ? (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '4px 8px', borderRadius: 999,
          background: window.T.sageTint, color: window.T.sageDeep,
          fontSize: 11, fontWeight: 700,
        }}>
          <Check size={12} stroke={window.T.sageDeep} width={2.5}/>
          Spotted
        </div>
      ) : (
        <div style={{
          padding: '4px 8px', borderRadius: 999,
          background: '#FBF0DA', color: window.T.saffronDeep,
          fontSize: 11, fontWeight: 700,
        }}>
          Not yet
        </div>
      )}
    </div>
  );

  return (
    <PhoneScreen tabBar={<TabBar active="explore"/>}>
      <div style={{ paddingTop: STATUS_H + 4, height: '100%', overflow: 'auto', paddingBottom: TAB_H + 16 }}>
        {/* Header */}
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.6 }}>Near me</div>
            <CircleBtn size={40}><MapIcon size={20} stroke={window.T.ink}/></CircleBtn>
          </div>
        </div>

        {/* Location selector */}
        <button style={{
          margin: '4px 20px 14px', padding: 14, borderRadius: 14,
          background: '#fff', border: `1px solid ${window.T.line}`,
          display: 'flex', alignItems: 'center', gap: 12, width: 'calc(100% - 40px)',
          fontFamily: window.T.font, cursor: 'pointer', textAlign: 'left',
        }}>
          <div style={{ width: 42, height: 42, borderRadius: 12,
            background: window.T.skyTint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Pin size={20} stroke={window.T.skyDeep} width={2}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: window.T.inkSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Location
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 1 }}>Asheville, NC</div>
          </div>
          <ChevronDown size={18} stroke={window.T.inkFaint}/>
        </button>

        {/* Unspotted list (default) */}
        <div style={{ background: '#fff', margin: '0 16px', borderRadius: 16, overflow: 'hidden',
          border: `1px solid ${window.T.line}` }}>
          {unspotted.map((s, i, a) => (
            <Row key={s.name} {...s} status="unspotted"/>
          ))}
        </div>

        {/* Spotted divider */}
        <div style={{ padding: '20px 16px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: window.T.sage }}/>
          <div style={{ fontSize: 12, fontWeight: 700, color: window.T.inkSoft, textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Already spotted — 6 species
          </div>
        </div>
        <div style={{ background: '#fff', margin: '0 16px 16px', borderRadius: 16, overflow: 'hidden',
          border: `1px solid ${window.T.line}` }}>
          {spotted.map((s) => <Row key={s.name} {...s} status="spotted"/>)}
        </div>
      </div>
    </PhoneScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// Explore — My map (default landing for the Explore tab)
// Search icon top-right switches to the Near me view.
// ─────────────────────────────────────────────────────────────
function ExploreMapScreen() {
  return (
    <PhoneScreen tabBar={<TabBar active="explore"/>}>
      <div style={{ paddingTop: STATUS_H + 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '12px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.6 }}>Explore</div>
          <CircleBtn size={40}><Search size={20} stroke={window.T.ink}/></CircleBtn>
        </div>

        {/* Stats trio */}
        <div style={{ padding: '16px 16px 14px', display: 'flex', gap: 8 }}>
          {[
            { v: 134, l: 'Captures' },
            { v: 47,  l: 'Species' },
            { v: 6,   l: 'Habitats' },
          ].map((s) => (
            <div key={s.l} style={{
              flex: 1, padding: '12px 12px', borderRadius: 14,
              background: '#fff', border: `1px solid ${window.T.line}`,
            }}>
              <div className="tnum" style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.4 }}>{s.v}</div>
              <div style={{ fontSize: 11, color: window.T.inkSoft, marginTop: 1, fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(180deg, #DCEAF2 0%, #C7DCEC 100%)',
          margin: `0 16px ${TAB_H + 20}px`, borderRadius: 22,
          border: `1px solid ${window.T.line}`,
        }}>
          {/* Stylized brand-palette NA map */}
          <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
            <defs>
              <linearGradient id="landGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E4ECDB"/>
                <stop offset="60%" stopColor="#D9E0BC"/>
                <stop offset="100%" stopColor="#C8C99A"/>
              </linearGradient>
            </defs>
            {/* land */}
            <path d="M40 80 Q70 50 130 50 Q180 38 240 50 Q290 45 330 75 Q368 110 360 165 Q372 215 350 260 Q372 320 332 380 Q300 425 250 430 Q230 460 200 450 Q150 470 120 440 Q70 440 50 380 Q20 320 35 250 Q15 195 30 155 Q22 110 40 80 Z"
              fill="url(#landGrad)" stroke="#9CAB6E" strokeWidth="1.2"/>
            {/* mountain hints */}
            <path d="M60 220 L75 200 L90 230 L105 210 L120 240 Z" fill="#A8B57D" opacity="0.6"/>
            <path d="M280 180 L295 160 L310 195 L325 175 L340 205 Z" fill="#A8B57D" opacity="0.5"/>
            {/* rivers */}
            <path d="M180 90 Q200 200 220 300 Q210 380 180 430" stroke="#85B7C8" strokeWidth="2" fill="none"/>
            <path d="M70 260 Q120 280 170 270" stroke="#85B7C8" strokeWidth="1.5" fill="none"/>
            {/* state borders, faint */}
            <g stroke="#7A8A5A" strokeWidth="0.5" fill="none" opacity="0.45">
              <path d="M100 60 V200 H200 V300 H120"/>
              <path d="M260 70 V180 H340"/>
              <path d="M180 200 V340"/>
              <path d="M120 360 H280"/>
            </g>
          </svg>

          {/* Pin clusters */}
          <Cluster x="42%" y="36%" count={89}/>
          <Cluster x="58%" y="42%" count={31}/>
          <SinglePin x="72%" y="58%"/>
          <SinglePin x="68%" y="56%"/>
          <SinglePin x="44%" y="62%"/>
          <Cluster x="34%" y="56%" count={14}/>

          {/* Bottom location + zoom */}
          <div style={{ position: 'absolute', top: 16, left: 16, right: 16,
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
              padding: '8px 12px', borderRadius: 999,
              background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
              fontSize: 12, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}>
              <Pin size={13} stroke={window.T.coral} width={2}/>
              North Carolina, USA
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <CircleBtn size={36} bg="rgba(255,255,255,0.95)"><Plus size={18} stroke={window.T.ink}/></CircleBtn>
              <CircleBtn size={36} bg="rgba(255,255,255,0.95)">
                <svg width="14" height="2" viewBox="0 0 14 2" fill="none"><rect width="14" height="2" rx="1" fill={window.T.ink}/></svg>
              </CircleBtn>
            </div>
          </div>
        </div>
      </div>
    </PhoneScreen>
  );
}

function Cluster({ x, y, count }) {
  const size = Math.min(64, 28 + Math.log(count + 1) * 7);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)' }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: window.T.coral, border: '3px solid #fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: size * 0.34,
        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
      }}>{count}</div>
    </div>
  );
}

function SinglePin({ x, y }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -100%)' }}>
      <Pin size={22} stroke={window.T.coral} fill={window.T.coral} width={1}/>
    </div>
  );
}

Object.assign(window, { ExploreNearScreen, ExploreMapScreen });


// ====== screens-profile.jsx ======
// Profile tab + sub-screens: Profile home, Achievements hub, Streak detail, Paywall.

// ─────────────────────────────────────────────────────────────
// Profile home
// ─────────────────────────────────────────────────────────────
function ProfileHomeScreen() {
  return (
    <PhoneScreen tabBar={<TabBar active="profile"/>}>
      <div style={{ paddingTop: STATUS_H + 4, height: '100%', overflow: 'auto', paddingBottom: TAB_H + 16 }}>
        {/* Title */}
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.6 }}>Profile</div>
        </div>

        {/* Identity */}
        <div style={{ padding: '20px 20px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: window.T.sageTint, color: window.T.sageDeep,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, fontWeight: 800, letterSpacing: -1,
            border: `2px solid #fff`, boxShadow: '0 4px 12px rgba(40,30,20,0.08)',
          }}>B</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.3 }}>Brandon</div>
            <div style={{ fontSize: 13, color: window.T.inkSoft, marginTop: 2 }}>Birding since January 2024</div>
          </div>
        </div>

        {/* Stats trio */}
        <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
          {[
            { v: 47, l: 'Species', tint: window.T.sageTint, ink: window.T.sageDeep, border: window.T.sage },
            { v: 12, l: 'Streak',  tint: window.T.coralTint, ink: window.T.coralDeep, border: window.T.coral },
            { v: 134, l: 'Captures', tint: '#F0EAD8', ink: window.T.ink, border: 'rgba(40,30,20,0.15)' },
          ].map((s) => (
            <div key={s.l} style={{
              flex: 1, padding: 14, borderRadius: 16,
              background: s.tint,
              border: `1.5px solid ${s.border}`,
              textAlign: 'left',
            }}>
              <div className="tnum" style={{ fontSize: 28, fontWeight: 800, color: s.ink, letterSpacing: -0.6, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 12, color: s.ink, opacity: 0.85, marginTop: 4, fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Subscription banner */}
        <div style={{ margin: '0 16px 18px', padding: 16, borderRadius: 18,
          background: window.T.sageGrad || `linear-gradient(135deg, ${window.T.sageLight || window.T.sage} 0%, ${window.T.sage} 100%)`,
          color: '#fff', position: 'relative', overflow: 'hidden',
          boxShadow: `0 8px 20px ${window.T.sage}40`,
        }}>
          <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.22 }}>
            <Crown size={120} stroke="#fff" width={1.2}/>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 }}>
              Try birdr+
            </div>
            <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: -0.3 }}>Unlimited captures</div>
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>Member perks · From $2.50/mo</div>
            <button style={{
              marginTop: 12,
              padding: '8px 14px',
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
              color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 999, fontFamily: window.T.font, fontSize: 14, fontWeight: 700,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              Upgrade <ArrowRight size={14} stroke="#fff"/>
            </button>
          </div>
        </div>

        {/* Activity */}
        <SectionLabel>Activity</SectionLabel>
        <ProfileGroup>
          <ProfileRow icon={<Trophy size={20} stroke={window.T.saffronDeep} width={2.2}/>} tint="#FBF0DA"
            title="Achievements" meta="14 of 160"/>
          <ProfileRow icon={<MapIcon size={20} stroke={window.T.skyDeep} width={2.2}/>} tint={window.T.skyTint}
            title="Sightings map" meta="134 captures · 6 habitats" last/>
        </ProfileGroup>

        {/* Support */}
        <SectionLabel>Support</SectionLabel>
        <ProfileGroup>
          <ProfileRow icon={<HelpCircle size={20} stroke={window.T.ink} width={2.2}/>} tint="#EFE9D8" title="Help & FAQ"/>
          <ProfileRow icon={<Heart size={20} stroke={window.T.coralDeep} width={2.2}/>} tint={window.T.coralTint} title="Send feedback"/>
          <ProfileRow icon={<Info size={20} stroke={window.T.skyDeep} width={2.2}/>} tint={window.T.skyTint} title="About" meta="v1.0.0" last/>
        </ProfileGroup>

        {/* Account actions */}
        <div style={{ padding: '24px 20px 12px' }}>
          <button style={{ width: '100%', padding: 14, background: '#fff', border: `1px solid ${window.T.line}`,
            borderRadius: 14, color: '#C25E3A', fontFamily: window.T.font, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            Sign out
          </button>
          <button style={{ width: '100%', padding: 14, background: 'transparent', border: 'none',
            color: window.T.inkFaint, fontFamily: window.T.font, fontSize: 13, fontWeight: 500, cursor: 'pointer', marginTop: 4 }}>
            Delete account
          </button>
        </div>
      </div>
    </PhoneScreen>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ padding: '4px 24px 8px', fontSize: 11, fontWeight: 700,
      color: window.T.inkSoft, textTransform: 'uppercase', letterSpacing: 0.8 }}>
      {children}
    </div>
  );
}
function ProfileGroup({ children }) {
  return (
    <div style={{ margin: '0 16px 12px', background: '#fff', borderRadius: 16,
      border: `1px solid ${window.T.line}`, overflow: 'hidden' }}>{children}</div>
  );
}
function ProfileRow({ icon, tint, title, meta, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      borderBottom: last ? 'none' : `1px solid ${window.T.line}` }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: tint || '#F0EAD8',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
        {meta && <div style={{ fontSize: 12, color: window.T.inkSoft, marginTop: 1 }}>{meta}</div>}
      </div>
      <Chevron size={16} stroke={window.T.inkFaint}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Achievements hub — overall progress + listed achievements
// (icon left · progress right)
// ─────────────────────────────────────────────────────────────
function AchievementsScreen() {
  const unlocked = [
    { name: 'First Feather',        cat: 'Collection',    accent: window.T.cat.collection, icon: '🪶', when: 'Jan 15, 2024' },
    { name: '10 Species',           cat: 'Collection',    accent: window.T.cat.collection, icon: '📚', when: 'Feb 02, 2024' },
    { name: '25 Species',           cat: 'Collection',    accent: window.T.cat.collection, icon: '📚', when: 'Mar 18, 2024' },
    { name: '3-day streak',         cat: 'Streaks',       accent: window.T.cat.streaks,    icon: '🔥', when: 'Jan 17, 2024' },
    { name: '7-day streak',         cat: 'Streaks',       accent: window.T.cat.streaks,    icon: '🔥', when: 'Yesterday' },
    { name: 'First spot in NC',     cat: 'Regional',      accent: window.T.cat.regional,   icon: '📍', when: 'Jan 15, 2024' },
    { name: 'Songbirds · Spotter',  cat: 'Family',        accent: window.T.cat.family,     icon: '🎵', when: 'Jan 22, 2024' },
    { name: 'Songbirds · Apprentice', cat: 'Family',      accent: window.T.cat.family,     icon: '🎵', when: '2 days ago' },
  ];

  const inProgress = [
    { name: 'Songbirds · Adept',    cat: 'Family',        accent: window.T.cat.family,     icon: '🎵', count: 22, total: 25 },
    { name: 'Forest · Apprentice',  cat: 'Habitat',       accent: window.T.cat.habitat,    icon: '🌲', count: 6, total: 9 },
    { name: '14-day streak',        cat: 'Streaks',       accent: window.T.cat.streaks,    icon: '🔥', count: 12, total: 14 },
    { name: '50 Species',           cat: 'Collection',    accent: window.T.cat.collection, icon: '📚', count: 47, total: 50 },
    { name: 'Bird tour · 5 states', cat: 'Regional',      accent: window.T.cat.regional,   icon: '📍', count: 3, total: 5 },
  ];

  return (
    <PhoneScreen>
      <div style={{ height: '100%', overflow: 'auto', paddingBottom: 20 }}>
        {/* Top bar */}
        <div style={{ paddingTop: STATUS_H + 4, padding: `${STATUS_H + 4}px 16px 12px`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <CircleBtn size={38}><ChevronLeft size={20} stroke={window.T.ink}/></CircleBtn>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Achievements</div>
          <div style={{ width: 38 }}/>
        </div>

        {/* Overall progress hero */}
        <div style={{ margin: '0 16px 20px', padding: 20, borderRadius: 20,
          background: window.T.sageGrad || `linear-gradient(135deg, ${window.T.sageLight || window.T.sage} 0%, ${window.T.sage} 100%)`,
          color: '#fff', position: 'relative', overflow: 'hidden',
          boxShadow: `0 8px 24px ${window.T.sage}40` }}>
          <div style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.18 }}>
            <Trophy size={140} stroke="#fff" width={1.2}/>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.92 }}>
            Overall progress
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <div className="tnum" style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1 }}>14</div>
            <div style={{ fontSize: 18, fontWeight: 600, opacity: 0.9 }}>of 160 unlocked</div>
          </div>
          <div style={{ marginTop: 14, height: 6, background: 'rgba(255,255,255,0.25)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: '9%', height: '100%', background: '#fff', borderRadius: 3 }}/>
          </div>
        </div>

        {/* Unlocked achievements */}
        <div style={{ padding: '0 20px 8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: window.T.inkSoft, textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Unlocked
          </div>
          <div className="tnum" style={{ fontSize: 13, color: window.T.inkSoft, fontWeight: 700 }}>14</div>
        </div>
        <div style={{ margin: '0 16px 22px', background: '#fff', borderRadius: 16, overflow: 'hidden',
          border: `1px solid ${window.T.line}` }}>
          {unlocked.map((a, i, arr) => (
            <AchievementRow key={a.name} {...a} unlocked
              last={i === arr.length - 1}/>
          ))}
        </div>

        {/* In progress */}
        <div style={{ padding: '0 20px 8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: window.T.inkSoft, textTransform: 'uppercase', letterSpacing: 0.6 }}>
            In progress
          </div>
          <div className="tnum" style={{ fontSize: 13, color: window.T.inkSoft, fontWeight: 700 }}>{inProgress.length}</div>
        </div>
        <div style={{ margin: '0 16px 12px', background: '#fff', borderRadius: 16, overflow: 'hidden',
          border: `1px solid ${window.T.line}` }}>
          {inProgress.map((a, i, arr) => (
            <AchievementRow key={a.name} {...a}
              last={i === arr.length - 1}/>
          ))}
        </div>
      </div>
    </PhoneScreen>
  );
}

// One row in the achievements list.
//   • icon (left, colored square)
//   • name + cat (middle)
//   • progress (right):
//       - unlocked: "Earned <when>" + green check
//       - in progress: small progress bar + "N/M"
function AchievementRow({ name, cat, accent, icon, when, count, total, unlocked, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      borderBottom: last ? 'none' : `1px solid ${window.T.line}` }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </div>
        <div style={{ fontSize: 12, color: window.T.inkSoft, marginTop: 1 }}>
          {unlocked ? `${cat} · Earned ${when}` : cat}
        </div>
      </div>
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, minWidth: 86 }}>
        {unlocked ? (
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: window.T.sage, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Check size={16} stroke="#fff" width={3}/>
          </div>
        ) : (
          <>
            <div className="tnum" style={{ fontSize: 12, fontWeight: 700, color: window.T.ink }}>{count} / {total}</div>
            <div style={{ width: 76, height: 4, background: window.T.line, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${(count/total)*100}%`, height: '100%', background: accent, borderRadius: 2 }}/>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Streak detail
// ─────────────────────────────────────────────────────────────
function StreakDetailScreen() {
  // 4 weeks calendar; today index = 27 (4th week last column-ish). Show captured days.
  // captured days: pseudo-random based on streak length
  const captured = new Set([0,1,4,5,6, 7,9,10,11,13, 14,16,17,18,20, 21,22,23,24,25,26]);
  const todayIdx = 27;

  return (
    <PhoneScreen>
      <div style={{ height: '100%', overflow: 'auto' }}>
        <div style={{ paddingTop: STATUS_H + 4, padding: `${STATUS_H + 4}px 16px 12px`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <CircleBtn size={38}><ChevronLeft size={20} stroke={window.T.ink}/></CircleBtn>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Streak history</div>
          <div style={{ width: 38 }}/>
        </div>

        {/* Big streak card */}
        <div style={{ margin: '0 16px 18px', padding: 24, borderRadius: 24,
          background: `linear-gradient(135deg, ${window.T.coral} 0%, ${window.T.coralDeep} 100%)`,
          color: '#fff', position: 'relative', overflow: 'hidden',
          boxShadow: '0 12px 28px rgba(216,90,48,0.35)',
        }}>
          <div style={{ position: 'absolute', right: -30, bottom: -30, opacity: 0.18 }}>
            <Flame size={240} stroke="#fff" fill="currentColor" width={1.2}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700,
            letterSpacing: 1, textTransform: 'uppercase', opacity: 0.9, marginBottom: 8 }}>
            <Flame size={14} stroke="#fff" fill="currentColor"/>
            Current streak
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <div className="tnum" style={{ fontSize: 88, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>12</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>days</div>
          </div>
          <div style={{ marginTop: 16, fontSize: 14, fontWeight: 600 }}>Streak safe today — captured at 7:42 AM</div>
        </div>

        {/* Stats trio */}
        <div style={{ padding: '0 16px 18px', display: 'flex', gap: 8 }}>
          {[
            { v: 28, l: 'Longest streak' },
            { v: 42, l: 'Capture days' },
            { v: '83%', l: 'Last 30 days' },
          ].map((s) => (
            <div key={s.l} style={{ flex: 1, padding: 12, borderRadius: 14, background: '#fff',
              border: `1px solid ${window.T.line}` }}>
              <div className="tnum" style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.4 }}>{s.v}</div>
              <div style={{ fontSize: 11, color: window.T.inkSoft, marginTop: 2, fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <SectionLabel>Last 4 weeks</SectionLabel>
        <div style={{ margin: '0 16px 24px', padding: 16, borderRadius: 18, background: '#fff',
          border: `1px solid ${window.T.line}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8 }}>
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, color: window.T.inkFaint, fontWeight: 600 }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {[...Array(28)].map((_, i) => {
              const isCaptured = captured.has(i);
              const isToday = i === todayIdx;
              return (
                <div key={i} style={{
                  aspectRatio: 1, borderRadius: 8,
                  background: isCaptured ? window.T.coral : '#F4EFE4',
                  border: isToday ? `2px dashed ${window.T.coralDeep}` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isCaptured ? '#fff' : window.T.inkFaint,
                  fontSize: 11, fontWeight: 700,
                  position: 'relative',
                }}>
                  {isCaptured && <Flame size={12} stroke="#fff" fill="currentColor" width={2}/>}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: window.T.inkSoft, textAlign: 'center' }}>
            Captured today. Keep going for the 14-day badge — 2 to go.
          </div>
        </div>
      </div>
    </PhoneScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// Hard paywall (modal style)
// ─────────────────────────────────────────────────────────────
function PaywallScreen() {
  return (
    <PhoneScreen bg="#FBF9EF">
      {/* close X */}
      <div style={{ position: 'absolute', top: STATUS_H + 4, right: 16, zIndex: 10 }}>
        <CircleBtn size={38}><X size={20} stroke={window.T.ink}/></CircleBtn>
      </div>

      <div style={{ paddingTop: STATUS_H + 56, padding: `${STATUS_H + 56}px 24px 24px`,
        height: '100%', overflow: 'auto' }}>
        {/* Hero icon — themed green */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <div style={{
            width: 88, height: 88, borderRadius: 28,
            background: window.T.sageGrad || `linear-gradient(135deg, ${window.T.sageLight || window.T.sage} 0%, ${window.T.sage} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 12px 28px ${window.T.sage}50`,
          }}>
            <Crown size={44} stroke="#fff" width={1.8}/>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.6, lineHeight: 1.1 }}>You're out of captures today.</div>
          <div style={{ fontSize: 15, color: window.T.inkSoft, marginTop: 10, lineHeight: 1.5 }}>
            Upgrade for unlimited identifications<br/>— and support a small team.
          </div>
        </div>

        {/* Tier picker — themed green */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          <div style={{
            padding: 18, borderRadius: 18,
            background: '#fff', border: `2px solid ${window.T.sage}`,
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: -10, right: 14,
              background: window.T.sage, color: '#fff', padding: '3px 10px', borderRadius: 999,
              fontSize: 10, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              Best value · Save 58%
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%',
                border: `2px solid ${window.T.sage}`, padding: 3 }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: window.T.sage }}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>Yearly</div>
                  <div style={{ fontSize: 13, color: window.T.inkSoft }}>$2.50/mo</div>
                </div>
                <div style={{ fontSize: 13, color: window.T.inkSoft, marginTop: 2 }}>$29.99 billed annually</div>
              </div>
            </div>
          </div>

          <div style={{ padding: 18, borderRadius: 18, background: '#fff', border: `1.5px solid ${window.T.line}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${window.T.line}` }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Weekly</div>
                <div style={{ fontSize: 13, color: window.T.inkSoft }}>$3.99 per week</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{ padding: 16, background: window.T.sageTint, borderRadius: 16, marginBottom: 18 }}>
          {[
            'Unlimited bird identifications',
            'Chase every achievement without limits',
            'Early access to upcoming features',
          ].map((f) => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
              <Check size={18} stroke={window.T.sageDeep} width={2.5}/>
              <div style={{ fontSize: 14, color: window.T.sageDeep, fontWeight: 600 }}>{f}</div>
            </div>
          ))}
        </div>

        <PrimaryButton color="sage" size="lg" style={{ width: '100%' }}>
          Start birdr+ — $29.99/year
        </PrimaryButton>
        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: window.T.inkFaint }}>
          Cancel anytime · <u>Restore purchases</u>
        </div>
      </div>
    </PhoneScreen>
  );
}

Object.assign(window, { ProfileHomeScreen, AchievementsScreen, StreakDetailScreen, PaywallScreen });


// ====== app.jsx ======
// Main app — composes all screens into the design canvas.

function ThemeToggle({ active }) {
  const isVivid = active === 'vivid';
  const swatchPairs = isVivid
    ? ['#3B6D11', '#EF9F27', '#D85A30']   // peek at the *other* theme
    : ['#008D8F', '#FFB347', '#E84B4B'];
  return (
    <div style={{
      position: 'fixed', top: 18, right: 20, zIndex: 1000,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 8px 8px 14px', borderRadius: 999,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)',
      fontFamily: window.T.font, fontSize: 13, fontWeight: 600, color: '#2C2C2A',
    }}>
      <span style={{ opacity: 0.7 }}>Theme</span>
      <div style={{
        display: 'flex', background: '#F0EEE9', borderRadius: 999, padding: 3, gap: 2,
      }}>
        <button onClick={() => window.applyTheme('fieldguide')} style={{
          padding: '6px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: !isVivid ? '#fff' : 'transparent',
          color: !isVivid ? '#2C2C2A' : 'rgba(0,0,0,0.5)',
          fontWeight: !isVivid ? 700 : 500,
          boxShadow: !isVivid ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          fontFamily: 'inherit', fontSize: 13,
        }}>Field guide</button>
        <button onClick={() => window.applyTheme('vivid')} style={{
          padding: '6px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: isVivid ? '#fff' : 'transparent',
          color: isVivid ? '#2C2C2A' : 'rgba(0,0,0,0.5)',
          fontWeight: isVivid ? 700 : 500,
          boxShadow: isVivid ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          fontFamily: 'inherit', fontSize: 13,
        }}>Mint game</button>
      </div>
    </div>
  );
}

function BirdrApp() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const h = () => force();
    window.addEventListener('birdr-theme', h);
    return () => window.removeEventListener('birdr-theme', h);
  }, []);

  const ARTBOARD_W = 432;
  const ARTBOARD_H = 904;
  const themeName = window.T.themeName || 'fieldguide';

  return (
    <React.Fragment>
      <ThemeToggle active={themeName}/>
      <DesignCanvas style={{ background: themeName === 'vivid' ? '#D6EBD3' : '#f0eee9' }}>
        <DCPostIt top={-10} left={60} rotate={-2.5} width={300}>
          <b>birdr — v1 hi-fi</b><br/>
          23 screens · four-tab MVP from the PRD.<br/>
          Toggle the theme in the top-right.
        </DCPostIt>

        <DCSection id="onboarding" title="Onboarding" subtitle="Splash → carousel → sign in → permissions → tutorial">
          <DCArtboard id="splash" label="1. Splash" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><SplashScreen/></div>
          </DCArtboard>
          <DCArtboard id="welcome-1" label="2. Welcome · Identify" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><WelcomeIdentifyScreen/></div>
          </DCArtboard>
          <DCArtboard id="welcome-2" label="3. Welcome · Collect" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><WelcomeCollectScreen/></div>
          </DCArtboard>
          <DCArtboard id="welcome-3" label="4. Welcome · Habit" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><WelcomeHabitScreen/></div>
          </DCArtboard>
          <DCArtboard id="signin" label="5. Sign in (OAuth)" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><SignInScreen/></div>
          </DCArtboard>
          <DCArtboard id="signin-alt" label="5b. Sign in · previous flow" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><SignInAltScreen/></div>
          </DCArtboard>
          <DCArtboard id="permissions" label="6. Permissions" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><PermissionsScreen/></div>
          </DCArtboard>
          <DCArtboard id="tutorial-intro" label="7. Tutorial · Try it out" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><TutorialIntroScreen/></div>
          </DCArtboard>
          <DCArtboard id="tutorial-reveal" label="8. Tutorial · Reveal" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><TutorialRevealScreen/></div>
          </DCArtboard>
        </DCSection>

        <DCSection id="capture" title="Capture flow" subtitle="Hub → camera → identify → unlock — the core loop">
          <DCArtboard id="hub" label="Capture hub (tab default)" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><CaptureHubScreen/></div>
          </DCArtboard>
          <DCArtboard id="camera" label="Camera viewfinder" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><CameraScreen/></div>
          </DCArtboard>
          <DCArtboard id="preview" label="Photo preview" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><PhotoPreviewScreen/></div>
          </DCArtboard>
          <DCArtboard id="identifying" label="Identifying…" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><IdentifyingScreen/></div>
          </DCArtboard>
          <DCArtboard id="unlock" label="Card unlock (First Sight)" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><CardUnlockScreen/></div>
          </DCArtboard>
          <DCArtboard id="picker" label="Top-3 picker (low-confidence)" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><Top3Screen/></div>
          </DCArtboard>
        </DCSection>

        <DCSection id="collection" title="Collection" subtitle="Browse spotted + Pokédex of 900 NA species">
          <DCArtboard id="spotted" label="Spotted view (default)" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><CollectionSpottedScreen/></div>
          </DCArtboard>
          <DCArtboard id="all-na" label="All North America" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><CollectionAllScreen/></div>
          </DCArtboard>
          <DCArtboard id="detail" label="Card detail (card view)" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><CardDetailScreen/></div>
          </DCArtboard>
          <DCArtboard id="detail-expanded" label="Card detail (sheet expanded)" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><CardDetailExpandedScreen/></div>
          </DCArtboard>
          <DCArtboard id="detail-locked" label="Card detail (locked)" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><CardDetailLockedScreen/></div>
          </DCArtboard>
        </DCSection>

        <DCSection id="explore" title="Explore" subtitle="Map (default) · search → near me list">
          <DCArtboard id="map" label="Map (default)" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><ExploreMapScreen/></div>
          </DCArtboard>
          <DCArtboard id="near" label="Near me (search)" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><ExploreNearScreen/></div>
          </DCArtboard>
        </DCSection>

        <DCSection id="profile" title="Profile + monetization" subtitle="Identity · achievements · paywall">
          <DCArtboard id="profile-home" label="Profile home" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><ProfileHomeScreen/></div>
          </DCArtboard>
          <DCArtboard id="achievements" label="Achievements hub" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><AchievementsScreen/></div>
          </DCArtboard>
          <DCArtboard id="paywall" label="Hard paywall" width={ARTBOARD_W} height={ARTBOARD_H} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div style={{ padding: 15 }}><PaywallScreen/></div>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<BirdrApp/>);

