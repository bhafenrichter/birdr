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
