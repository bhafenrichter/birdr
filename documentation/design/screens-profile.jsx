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
