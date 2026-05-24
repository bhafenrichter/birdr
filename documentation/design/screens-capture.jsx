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
