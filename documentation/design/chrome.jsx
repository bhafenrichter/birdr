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
