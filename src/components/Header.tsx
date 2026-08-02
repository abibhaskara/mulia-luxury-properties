"use client";

import { useState } from "react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefreshData?: () => void;
}

export default function Header({ activeTab, setActiveTab, onRefreshData }: HeaderProps) {
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    if (!confirm("Re-seed database dengan data properti sampel Harsalab Studio?")) return;
    setIsSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        alert("Database berhasil di-reset & di-seed!");
        if (onRefreshData) onRefreshData();
      }
    } catch (e) {
      alert("Gagal re-seed database");
    } finally {
      setIsSeeding(false);
    }
  };

  const tabs = [
    { id: "marketplace", label: "Katalog Pembeli" },
    { id: "listings", label: "Kelola Properti" },
    { id: "buyers", label: "Database Client (Buyers)" },
    { id: "ai-matcher", label: "AI Property Matcher", badge: "Gemini AI" },
    { id: "map", label: "Peta Properti" },
    { id: "analytics", label: "Analytics & Laporan" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-xl text-black tracking-tight">Harsalab Studio</h1>
              </div>

            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="px-3 py-1.5 text-xs font-bold text-black border border-black bg-white hover:bg-gray-100 disabled:opacity-50"
              title="Reset & Isi Ulang Data Sampel Database"
            >
              <span>{isSeeding ? "Seeding..." : "Reset Data Sampel"}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold whitespace-nowrap border ${
                  isActive
                    ? "border-black bg-black text-white"
                    : "border-transparent text-black hover:border-black"
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] font-bold px-1 border border-current">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
