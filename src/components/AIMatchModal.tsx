"use client";

import { useEffect, useState } from "react";
import { Buyer, Listing } from "@/db/schema";
import { Sparkles, X, Building2, CheckCircle2, ChevronRight, Filter, AlertCircle, Phone, ArrowUpRight } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                Gemini AI Property Matcher
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  text-embedding-004
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Pencocokan AI Vector Similarity antara preferensi buyer & listing properti
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selection Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  name="matchType"
                  checked={!useCustomQuery}
                  onChange={() => setUseCustomQuery(false)}
                  className="accent-emerald-500"
                />
                Pilih Buyer dari Database CRM
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  name="matchType"
                  checked={useCustomQuery}
                  onChange={() => setUseCustomQuery(true)}
                  className="accent-emerald-500"
                />
                Input Kriteria Bebas (Custom Query)
              </label>
            </div>

            <button
              onClick={runMatch}
              disabled={isLoading}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Memproses Embedding..." : "Jalankan AI Match"}</span>
            </button>
          </div>

          {!useCustomQuery ? (
            <div className="flex items-center gap-3">
              <select
                value={selectedBuyerId}
                onChange={(e) => setSelectedBuyerId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {buyersList.map((b) => (
                  <option key={b.id} value={b.id}>
                    👤 {b.nama_klien} — {b.jenis_dicari} di {b.lokasi_dicari} (Budget: Rp{" "}
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
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Active Buyer Requirement Info */}
          {activeBuyerInfo && !useCustomQuery && (
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
              <div>
                Klien: <span className="font-bold text-white">{activeBuyerInfo.nama_klien}</span> | Tipe:{" "}
                <span className="font-bold text-emerald-400">{activeBuyerInfo.jenis_dicari}</span> | Lokasi:{" "}
                <span className="font-bold text-white">{activeBuyerInfo.lokasi_dicari}</span>
              </div>
              <div className="text-slate-400">
                Catatan: <span className="italic text-slate-300">"{activeBuyerInfo.catatan || "Tidak ada"}"</span>
              </div>
            </div>
          )}
        </div>

        {/* Match Results List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="text-sm font-bold text-slate-200">Menghitung AI Vector Embedding & Pitch...</div>
              <p className="text-xs text-slate-500">Menganalisis kemiripan spasial dan kriteria properti...</p>
            </div>
          ) : matchResults.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
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
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg hover:border-emerald-500/40 transition"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Left Info */}
                    <div className="flex items-center gap-4">
                      <img
                        src={photoUrl}
                        alt={item.listing.kode}
                        className="w-20 h-20 rounded-lg object-cover border border-slate-800 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-400">
                            #{idx + 1} {item.listing.kode}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            {item.listing.jenis} • {item.listing.lokasi_area}
                          </span>
                        </div>
                        <div className="text-base font-extrabold text-white mt-0.5">
                          {formatPrice(item.listing.harga)}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          LT {item.listing.luas_tanah}m² | LB {item.listing.luas_bangunan}m² | {item.listing.kamar_tidur} KT | {item.listing.furnished}
                        </div>
                      </div>
                    </div>

                    {/* Right Match Score */}
                    <div className="w-full sm:w-auto flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">Kesesuaian (Match):</span>
                        <span
                          className={`text-xl font-black ${
                            item.matchPercentage >= 80
                              ? "text-emerald-400"
                              : item.matchPercentage >= 60
                              ? "text-amber-400"
                              : "text-slate-400"
                          }`}
                        >
                          {item.matchPercentage}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.matchPercentage >= 80
                              ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                              : item.matchPercentage >= 60
                              ? "bg-amber-500"
                              : "bg-slate-600"
                          }`}
                          style={{ width: `${item.matchPercentage}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Vector Sim: {item.vectorScore}% | Rules: {item.ruleScore}%
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendation Pitch Box */}
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      Gemini AI Recommendation Pitch:
                    </div>
                    <p className="text-slate-300 leading-relaxed font-sans">{item.aiPitch}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <div className="text-slate-400">
                      Owner: <span className="text-slate-200">{item.listing.nama_pemilik} ({item.listing.no_hp})</span>
                    </div>

                    <button
                      onClick={() => setSelectedListingModal(item.listing)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-emerald-400 hover:bg-slate-700 font-bold flex items-center gap-1"
                    >
                      Lihat Full Detail Unit
                      <ArrowUpRight className="w-3.5 h-3.5" />
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
