"use client";

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// ─── Inline SVG Icons ───────────────────────────────────────────────────────
const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
  </svg>
);

const BuildingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
    <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const mobileItems = [
  { id: "marketplace", label: "Katalog",  icon: <GridIcon /> },
  { id: "listings",    label: "Properti", icon: <BuildingIcon /> },
  { id: "buyers",      label: "Buyer",    icon: <UsersIcon /> },
  { id: "ai-matcher",  label: "AI Match", icon: <SparkleIcon /> },
  { id: "map",         label: "Peta",     icon: <MapPinIcon /> },
];

export default function MobileBottomNav({ activeTab, setActiveTab }: MobileBottomNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t"
      style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb" }}
    >
      <div className="flex items-center justify-around h-[60px] px-2">
        {mobileItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center gap-1 flex-1 py-1.5 transition-colors"
            >
              <div
                className="p-1.5 rounded-xl transition-all"
                style={
                  isActive
                    ? { backgroundColor: "#111111", color: "#ffffff" }
                    : { color: "#9ca3af" }
                }
              >
                {item.icon}
              </div>
              <span
                className="text-[9px] font-semibold"
                style={{ color: isActive ? "#111111" : "#9ca3af" }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area spacer for iOS */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}
