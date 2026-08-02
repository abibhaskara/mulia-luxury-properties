"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import MarketplaceView from "@/components/MarketplaceView";
import ListingsManager from "@/components/ListingsManager";
import BuyersManager from "@/components/BuyersManager";
import AIMatchModal from "@/components/AIMatchModal";
import AnalyticsView from "@/components/AnalyticsView";
import { Listing, Buyer } from "@/db/schema";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });

export default function Home() {
  const [activeTab, setActiveTab] = useState("marketplace");
  const [listings, setListings] = useState<Listing[]>([]);
  const [buyersList, setBuyersList] = useState<Buyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // AI Match Modal state
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
      const jsonBuyers = await resBuyers.json();

      if (jsonListings.success) setListings(jsonListings.data || []);
      if (jsonBuyers.success) setBuyersList(jsonBuyers.data || []);
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAiMatchForBuyer = (buyer: Buyer) => {
    setSelectedBuyerForMatch(buyer);
    setIsAiMatchOpen(true);
  };

  const handleOpenAiMatchForListing = (listing: Listing) => {
    setSelectedBuyerForMatch(null);
    setIsAiMatchOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onRefreshData={fetchData} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="text-sm font-bold text-slate-300">Memuat Data CRM Harsalab Studio...</div>
          </div>
        ) : (
          <>
            {activeTab === "marketplace" && (
              <MarketplaceView
                listings={listings}
                onOpenMatchModal={handleOpenAiMatchForListing}
              />
            )}

            {activeTab === "listings" && (
              <ListingsManager
                listings={listings}
                onRefresh={fetchData}
                onOpenMatchModal={handleOpenAiMatchForListing}
              />
            )}

            {activeTab === "buyers" && (
              <BuyersManager
                buyersList={buyersList}
                onRefresh={fetchData}
                onRunAiMatch={handleOpenAiMatchForBuyer}
              />
            )}

            {activeTab === "ai-matcher" && (
              <div className="py-6 text-center space-y-4">
                <button
                  onClick={() => {
                    setSelectedBuyerForMatch(null);
                    setIsAiMatchOpen(true);
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 hover:scale-105 transition transform"
                >
                  ✨ Buka Gemini AI Matcher Studio
                </button>
              </div>
            )}

            {activeTab === "map" && (
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-white">Peta Sebaran Properti (Geospatial View)</h2>
                    <p className="text-xs text-slate-400">
                      Pin hijau: Available | Pin Oranye: Booking | Pin Merah: Sold
                    </p>
                  </div>
                  <div className="text-xs font-mono px-3 py-1 rounded bg-slate-950 border border-slate-800 text-emerald-400">
                    {listings.length} Pins Terpasang
                  </div>
                </div>

                <MapComponent listings={listings} height="600px" zoom={9} />
              </div>
            )}

            {activeTab === "analytics" && <AnalyticsView />}
          </>
        )}
      </main>

      {/* AI Matcher Modal */}
      {isAiMatchOpen && (
        <AIMatchModal
          initialBuyer={selectedBuyerForMatch}
          buyersList={buyersList}
          onClose={() => setIsAiMatchOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>© {new Date().getFullYear()} Harsalab Studio Property Agency CRM</div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Next.js 14 App Router</span>
            <span>•</span>
            <span>Drizzle ORM + Turso</span>
            <span>•</span>
            <span>Gemini AI Vector Embedding</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
