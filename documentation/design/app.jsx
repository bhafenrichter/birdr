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
