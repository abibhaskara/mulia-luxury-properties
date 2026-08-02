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
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onRefreshData={fetchData} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <div className="text-sm font-bold text-black">Loading...</div>
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
                  className="px-6 py-3 border border-black text-black font-bold text-sm bg-white hover:bg-gray-100"
                >
                  Open AI Matcher Studio
                </button>
              </div>
            )}

            {activeTab === "map" && (
              <div className="space-y-4">
                <div className="border border-black p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                  <div>
                    <h2 className="text-base font-bold text-black">Peta Sebaran Properti (Geospatial View)</h2>
                    <p className="text-xs text-gray-600">
                      Available | Booking | Sold
                    </p>
                  </div>
                  <div className="text-xs font-mono px-3 py-1 border border-black text-black">
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
      <footer className="border-t border-black bg-white py-6 text-center text-xs text-black">
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
