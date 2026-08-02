"use client";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// ─── Inline SVG Icons ───────────────────────────────────────────────────────
const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
  </svg>
);

const BuildingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
    <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const BarChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
    <line x1="3" y1="20" x2="21" y2="20"/>
  </svg>
);

const RefreshIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-4.54"/>
  </svg>
);

// ─── Nav Items ───────────────────────────────────────────────────────────────
const navItems = [
  { id: "marketplace",  label: "Katalog Properti", icon: <GridIcon />,     badge: null },
  { id: "listings",     label: "Kelola Properti",  icon: <BuildingIcon />, badge: null },
  { id: "buyers",       label: "Database Buyer",   icon: <UsersIcon />,    badge: null },
  { id: "ai-matcher",   label: "AI Matcher",       icon: <SparkleIcon />,  badge: "AI" },
  { id: "map",          label: "Peta Properti",    icon: <MapPinIcon />,   badge: null },
  { id: "analytics",    label: "Analytics",        icon: <BarChartIcon />, badge: null },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside
      className="hidden md:flex flex-col shrink-0 h-screen sticky top-0 overflow-hidden transition-all duration-200"
      style={{ backgroundColor: "#111111", color: "white", width: "clamp(64px, 16vw, 224px)" }}
    >
      {/* Brand */}
      <div className="h-16 flex items-center gap-3 px-4 shrink-0 border-b border-white/10">
        <div
          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm select-none"
          style={{ backgroundColor: "white", color: "#111111" }}
        >
          M
        </div>
        <div className="hidden lg:block overflow-hidden">
          <div className="text-[13px] font-bold text-white leading-tight truncate">Mulia Luxury</div>
          <div className="text-[10px] text-white/40 truncate">Property CRM</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto scrollbar-none space-y-0.5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`relative w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors ${
                isActive
                  ? "text-white"
                  : "text-white/45 hover:text-white/80"
              }`}
              style={isActive ? { backgroundColor: "rgba(255,255,255,0.10)" } : undefined}
            >
              {isActive && <div className="sidebar-active-bar" />}
              <span className="shrink-0">{item.icon}</span>
              <span className="hidden lg:block flex-1 text-left truncate">{item.label}</span>
              {item.badge && (
                <span className="hidden lg:inline-block shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/20 text-white/50">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
