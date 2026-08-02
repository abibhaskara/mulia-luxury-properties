"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import MarketplaceView from "@/components/MarketplaceView";
import ListingsManager from "@/components/ListingsManager";
import BuyersManager from "@/components/BuyersManager";
import AIMatchModal from "@/components/AIMatchModal";
import AnalyticsView from "@/components/AnalyticsView";
import { Listing, Buyer } from "@/db/schema";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });

const PAGE_TITLES: Record<string, string> = {
  marketplace:  "Katalog Properti",
  listings:     "Kelola Properti",
  buyers:       "Database Buyer",
  "ai-matcher": "AI Property Matcher",
  map:          "Peta Properti",
  analytics:    "Analytics & Laporan",
};

// ─── Refresh Icon ────────────────────────────────────────────────────────────
const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-4.54"/>
  </svg>
);

export default function Home() {
  const [activeTab, setActiveTab] = useState("marketplace");
  const [listings, setListings]   = useState<Listing[]>([]);
  const [buyersList, setBuyersList] = useState<Buyer[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [isAiMatchOpen, setIsAiMatchOpen] = useState(false);
  const [selectedBuyerForMatch, setSelectedBuyerForMatch] = useState<Buyer | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resListings, resBuyers] = await Promise.all([
        fetch("/api/listings"),
        fetch("/api/buyers"),
      ]);
      const jsonListings = await resListings.json();
      const jsonBuyers   = await resBuyers.json();
      if (jsonListings.success) setListings(jsonListings.data || []);
      if (jsonBuyers.success)   setBuyersList(jsonBuyers.data || []);
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#f5f5f5" }}>

      {/* ── Sidebar (hidden on mobile) ──────────────────────────────────── */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* ── Main Column ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Top Bar */}
        <div
          className="md:hidden shrink-0 h-14 flex items-center justify-between px-4 border-b"
          style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0"
              style={{ backgroundColor: "#111111", color: "#ffffff" }}
            >
              M
            </div>
            <span className="font-bold text-sm" style={{ color: "#111111" }}>Mulia Luxury Property</span>
          </div>
          <button
            onClick={fetchData}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "#9ca3af" }}
            title="Refresh data"
          >
            <RefreshIcon />
          </button>
        </div>

        {/* Desktop Top Bar */}
        <div
          className="hidden md:flex shrink-0 h-14 items-center justify-between px-6 border-b"
          style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb" }}
        >
          <h1 className="font-bold text-[15px]" style={{ color: "#111111" }}>
            {PAGE_TITLES[activeTab] || "Overview"}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ color: "#9ca3af", backgroundColor: "#f5f5f5" }}>
              {listings.length} Properti · {buyersList.length} Buyer
            </span>
            <button
              onClick={fetchData}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100"
              style={{ color: "#9ca3af" }}
              title="Refresh data"
            >
              <RefreshIcon />
            </button>
          </div>
        </div>

        {/* ── Scrollable Content ──────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24 md:pb-8">

            {isLoading ? (
              /* Loading Spinner */
              <div className="flex items-center justify-center py-32">
                <div className="text-center space-y-4">
                  <div
                    className="w-9 h-9 border-[2.5px] border-t-transparent rounded-full animate-spin mx-auto"
                    style={{ borderColor: "#111111", borderTopColor: "transparent" }}
                  />
                  <p className="text-sm font-medium" style={{ color: "#9ca3af" }}>Memuat data...</p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === "marketplace" && (
                  <MarketplaceView
                    listings={listings}
                    onOpenMatchModal={() => setIsAiMatchOpen(true)}
                  />
                )}

                {activeTab === "listings" && (
                  <ListingsManager
                    listings={listings}
                    onRefresh={fetchData}
                    onOpenMatchModal={() => setIsAiMatchOpen(true)}
                  />
                )}

                {activeTab === "buyers" && (
                  <BuyersManager
                    buyersList={buyersList}
                    onRefresh={fetchData}
                    onRunAiMatch={(b) => {
                      setSelectedBuyerForMatch(b);
                      setIsAiMatchOpen(true);
                    }}
                  />
                )}

                {activeTab === "ai-matcher" && (
                  <div className="flex items-center justify-center py-12 px-4">
                    <div
                      className="rounded-2xl p-8 max-w-sm w-full text-center space-y-5"
                      style={{ backgroundColor: "#111111", color: "#ffffff" }}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                        style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
                      >
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">AI Property Matcher</h2>
                        <p className="text-[13px] mt-1.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                          Cocokkan buyer dengan properti menggunakan Gemini AI vector embedding — presisi tinggi, real-time.
                        </p>
                      </div>
                      <button
                        onClick={() => { setSelectedBuyerForMatch(null); setIsAiMatchOpen(true); }}
                        className="w-full py-3 rounded-xl font-bold text-sm transition-colors hover:bg-gray-100"
                        style={{ backgroundColor: "#ffffff", color: "#111111" }}
                      >
                        Buka AI Matcher Studio
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "map" && (
                  <div className="space-y-4">
                    <div
                      className="rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border"
                      style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb" }}
                    >
                      <div>
                        <h2 className="font-bold text-[15px]" style={{ color: "#111111" }}>Peta Sebaran Properti</h2>
                        <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                          {listings.length} properti terpasang · Geospatial View
                        </p>
                      </div>
                      <div className="flex gap-2 text-[11px] font-medium">
                        {[
                          { label: "Available", color: "#16a34a" },
                          { label: "Booking",   color: "#d97706" },
                          { label: "Sold",      color: "#6b7280" },
                        ].map((s) => (
                          <span
                            key={s.label}
                            className="px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: "#f5f5f5", color: s.color }}
                          >
                            {s.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "#ebebeb" }}>
                      <MapComponent listings={listings} height="580px" zoom={9} />
                    </div>
                  </div>
                )}

                {activeTab === "analytics" && <AnalyticsView />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* ── Mobile Bottom Navigation ────────────────────────────────────── */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ── AI Matcher Modal ────────────────────────────────────────────── */}
      {isAiMatchOpen && (
        <AIMatchModal
          initialBuyer={selectedBuyerForMatch}
          buyersList={buyersList}
          onClose={() => setIsAiMatchOpen(false)}
        />
      )}
    </div>
  );
}
