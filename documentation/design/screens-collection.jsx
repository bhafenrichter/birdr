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
