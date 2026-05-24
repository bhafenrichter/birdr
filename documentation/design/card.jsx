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
