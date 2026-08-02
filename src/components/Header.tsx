"use client";

import { Building2, Sparkles, MapPin, Users, BarChart3, Store, RefreshCw } from "lucide-react";
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
    { id: "marketplace", label: "Katalog Pembeli", icon: Store },
    { id: "listings", label: "Kelola Properti", icon: Building2 },
    { id: "buyers", label: "Database Client (Buyers)", icon: Users },
    { id: "ai-matcher", label: "AI Property Matcher", icon: Sparkles, badge: "Gemini AI" },
    { id: "map", label: "Peta Properti", icon: MapPin },
    { id: "analytics", label: "Analytics & Laporan", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
              <Building2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg text-white tracking-tight">Harsalab Studio</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  CRM Properti
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Sistem Manajemen Properti & Client Matching Cerdas
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition disabled:opacity-50"
              title="Reset & Isi Ulang Data Sampel Database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? "animate-spin text-emerald-400" : ""}`} />
              <span className="hidden md:inline">{isSeeding ? "Seeding..." : "Reset Data Sampel"}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-inner"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950">
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
