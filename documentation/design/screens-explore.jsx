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
