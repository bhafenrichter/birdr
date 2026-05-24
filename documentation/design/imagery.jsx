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
