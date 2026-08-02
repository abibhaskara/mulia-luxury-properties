"use client";

import { useEffect, useState } from "react";
import { Buyer, Listing } from "@/db/schema";
import PropertyDetailModal from "./PropertyDetailModal";

interface MatchResult {
  listing: Listing;
  matchPercentage: number;
  vectorScore: number;
  ruleScore: number;
  aiPitch: string;
}

interface AIMatchModalProps {
  initialBuyer?: Buyer | null;
  buyersList: Buyer[];
  onClose: () => void;
}

export default function AIMatchModal({ initialBuyer, buyersList, onClose }: AIMatchModalProps) {
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>(initialBuyer?.id || (buyersList[0]?.id || ""));
  const [customQuery, setCustomQuery] = useState("");
  const [useCustomQuery, setUseCustomQuery] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [activeBuyerInfo, setActiveBuyerInfo] = useState<Buyer | null>(initialBuyer || null);

  const [selectedListingModal, setSelectedListingModal] = useState<Listing | null>(null);

  const runMatch = async () => {
    setIsLoading(true);
    try {
      const payload = useCustomQuery
        ? { customQuery }
        : { buyerId: selectedBuyerId };

      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setMatchResults(json.data || []);
        setActiveBuyerInfo(json.buyer || null);
      }
    } catch (e) {
      console.error("Match error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runMatch();
  }, [selectedBuyerId, useCustomQuery]);

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `Rp ${(price / 1000000000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} M`;
    }
    return `Rp ${(price / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} Jt`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ backgroundColor: "rgba(17,17,17,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="relative w-full max-w-4xl overflow-hidden my-8 max-h-[92vh] flex flex-col rounded-2xl border" style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: "#ebebeb" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#111" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: "#111" }}>AI Property Matcher</h3>
              <p className="text-[11px]" style={{ color: "#9ca3af" }}>
                Pencocokan AI similarity antara preferensi buyer &amp; listing properti
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 text-gray-400 hover:text-gray-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Selection Bar */}
        <div className="p-4 border-b space-y-3" style={{ borderColor: "#ebebeb", backgroundColor: "#f9f9f9" }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-black">
                <input
                  type="radio"
                  name="matchType"
                  checked={!useCustomQuery}
                  onChange={() => setUseCustomQuery(false)}
                  className="accent-black"
                />
                Pilih Buyer dari Database CRM
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-black">
                <input
                  type="radio"
                  name="matchType"
                  checked={useCustomQuery}
                  onChange={() => setUseCustomQuery(true)}
                  className="accent-black"
                />
                Input Kriteria Bebas (Custom Query)
              </label>
            </div>

            <button
              onClick={runMatch}
              disabled={isLoading}
              className="px-4 py-1.5 bg-black text-white font-bold text-xs"
            >
              <span>{isLoading ? "Memproses..." : "Jalankan AI Match"}</span>
            </button>
          </div>

          {!useCustomQuery ? (
            <div className="flex items-center gap-3">
              <select
                value={selectedBuyerId}
                onChange={(e) => setSelectedBuyerId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-black text-xs text-black focus:outline-none"
              >
                {buyersList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nama_klien} — {b.jenis_dicari} di {b.lokasi_dicari} (Budget: Rp{" "}
                    {((b.budget_max || 0) / 1000000000).toFixed(1)} M)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="Misal: Saya cari villa tropical di Bali budget 8 Miliar dekat pantai batu bolong..."
                className="flex-1 px-3 py-2 bg-white border border-black text-xs text-black focus:outline-none"
              />
            </div>
          )}

          {/* Active Buyer Requirement Info */}
          {activeBuyerInfo && !useCustomQuery && (
            <div className="p-3 bg-white border border-black text-xs text-black flex flex-wrap items-center justify-between gap-2">
              <div>
                Klien: <span className="font-bold">{activeBuyerInfo.nama_klien}</span> | Tipe:{" "}
                <span className="font-bold">{activeBuyerInfo.jenis_dicari}</span> | Lokasi:{" "}
                <span className="font-bold">{activeBuyerInfo.lokasi_dicari}</span>
              </div>
              <div>
                Catatan: <span className="italic">"{activeBuyerInfo.catatan || "Tidak ada"}"</span>
              </div>
            </div>
          )}
        </div>

        {/* Match Results List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="py-16 text-center text-black font-bold text-sm">
              Menghitung AI Vector Embedding & Pitch...
            </div>
          ) : matchResults.length === 0 ? (
            <div className="py-12 text-center text-black text-xs font-bold">
              Belum ada hasil match. Silakan pilih buyer atau masukkan kriteria pencarian.
            </div>
          ) : (
            matchResults.map((item, idx) => {
              const photoUrl =
                Array.isArray(item.listing.link_foto) && item.listing.link_foto.length > 0
                  ? item.listing.link_foto[0]
                  : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80";

              return (
                <div
                  key={item.listing.id}
                  className="bg-white border border-black p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Left Info */}
                    <div className="flex items-center gap-4">
                      <img
                        src={photoUrl}
                        alt={item.listing.kode}
                        className="w-20 h-20 object-cover border border-black shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-black">
                            #{idx + 1} {item.listing.kode}
                          </span>
                          <span className="text-xs font-bold text-black">
                            {item.listing.jenis} • {item.listing.lokasi_area}
                          </span>
                        </div>
                        <div className="text-base font-bold text-black mt-0.5">
                          {formatPrice(item.listing.harga)}
                        </div>
                        <div className="text-xs text-black mt-1">
                          LT {item.listing.luas_tanah}m² | LB {item.listing.luas_bangunan}m² | {item.listing.kamar_tidur} KT | {item.listing.furnished}
                        </div>
                      </div>
                    </div>

                    {/* Right Match Score */}
                    <div className="w-full sm:w-auto flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-black font-bold">Kesesuaian:</span>
                        <span className="text-xl font-bold text-black">
                          {item.matchPercentage}%
                        </span>
                      </div>
                      <div className="text-[10px] text-black font-mono">
                        Vector Sim: {item.vectorScore}% | Rules: {item.ruleScore}%
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendation Pitch Box */}
                  <div className="p-3 bg-white border border-black text-xs text-black space-y-1">
                    <div className="font-bold">
                      Recommendation Pitch:
                    </div>
                    <p className="text-black">{item.aiPitch}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <div className="text-black">
                      Owner: <span className="font-bold">{item.listing.nama_pemilik} ({item.listing.no_hp})</span>
                    </div>

                    <button
                      onClick={() => setSelectedListingModal(item.listing)}
                      className="font-bold text-[10px] uppercase hover:underline"
                    >
                      [Detail Unit]
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Property Detail Modal */}
      {selectedListingModal && (
        <PropertyDetailModal
          listing={selectedListingModal}
          onClose={() => setSelectedListingModal(null)}
        />
      )}
    </div>
  );
}
