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
