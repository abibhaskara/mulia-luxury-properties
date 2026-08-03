"use client";

import { useState } from "react";
import { Listing } from "@/db/schema";
import PropertyDetailModal from "./PropertyDetailModal";

interface MarketplaceViewProps {
  listings: Listing[];
  onOpenMatchModal?: (listing: Listing) => void;
}

// ─── Pastel palette by property type ────────────────────────────────────────
const PASTEL_BG: Record<string, string> = {
  VILLA:   "#e5f4e8",
  RUMAH:   "#fdf5e4",
  RUKO:    "#ede8fd",
  TANAH:   "#e3edfd",
};
const PASTEL_ACCENT: Record<string, string> = {
  VILLA:   "#16a34a",
  RUMAH:   "#d97706",
  RUKO:    "#7c3aed",
  TANAH:   "#2563eb",
};

// ─── Status config ───────────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  AVAILABLE: { bg: "#dcfce7", color: "#16a34a", label: "Tersedia" },
  BOOKING:   { bg: "#fef3c7", color: "#d97706", label: "Booking" },
  SOLD:      { bg: "#f3f4f6", color: "#6b7280", label: "Terjual" },
};

export default function MarketplaceView({ listings, onOpenMatchModal }: MarketplaceViewProps) {
  const [searchTerm, setSearchTerm]             = useState("");
  const [selectedJenis, setSelectedJenis]       = useState("ALL");
  const [selectedStatus, setSelectedStatus]     = useState("ALL");
  const [selectedSewaJual, setSelectedSewaJual] = useState("ALL");
  const [activeListingModal, setActiveListingModal] = useState<Listing | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<Record<string, number>>({});

  const handleNextImage = (id: string, total: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((p) => ({ ...p, [id]: ((p[id] || 0) + 1) % total }));
  };
  const handlePrevImage = (id: string, total: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((p) => ({ ...p, [id]: ((p[id] || 0) - 1 + total) % total }));
  };

  const filteredListings = listings.filter((item) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.kode.toLowerCase().includes(q) ||
      item.lokasi_area.toLowerCase().includes(q) ||
      (item.alamat_lengkap && item.alamat_lengkap.toLowerCase().includes(q)) ||
      (item.catatan && item.catatan.toLowerCase().includes(q)) ||
      (item.nama_pemilik && item.nama_pemilik.toLowerCase().includes(q));

    return (
      matchesSearch &&
      (selectedJenis    === "ALL" || item.jenis     === selectedJenis) &&
      (selectedStatus   === "ALL" || item.status    === selectedStatus) &&
      (selectedSewaJual === "ALL" || item.sewa_jual === selectedSewaJual)
    );
  });

  const formatPrice = (price: number) => {
    if (price >= 1_000_000_000)
      return `Rp ${(price / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} M`;
    return `Rp ${(price / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} Jt`;
  };

  const resetFilters = () => {
    setSearchTerm(""); setSelectedJenis("ALL");
    setSelectedStatus("ALL"); setSelectedSewaJual("ALL");
  };
  const hasFilter = searchTerm || selectedJenis !== "ALL" || selectedStatus !== "ALL" || selectedSewaJual !== "ALL";

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total:     listings.length,
    available: listings.filter((l) => l.status === "AVAILABLE").length,
    booking:   listings.filter((l) => l.status === "BOOKING").length,
    sold:      listings.filter((l) => l.status === "SOLD").length,
  };

  return (
    <div className="space-y-5">

      {/* ── Stats Summary Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Properti",  value: stats.total,     color: "#111111" },
          { label: "Available",       value: stats.available,  color: "#16a34a" },
          { label: "Dalam Booking",   value: stats.booking,    color: "#d97706" },
          { label: "Terjual",         value: stats.sold,       color: "#6b7280" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4 border"
            style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb" }}
          >
            <div className="text-[11px] font-medium mb-1" style={{ color: "#9ca3af" }}>{s.label}</div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ───────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border p-4 space-y-3"
        style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb" }}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Cari lokasi, alamat, kode properti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
              style={{ borderColor: "#ebebeb", backgroundColor: "#f9f9f9", color: "#111" }}
            />
          </div>

          {/* Dropdowns */}
          {([
            { value: selectedJenis,    setter: setSelectedJenis,    options: [["ALL","Semua Jenis"],["RUMAH","Rumah"],["VILLA","Villa"],["RUKO","Ruko"],["TANAH","Tanah"]] },
            { value: selectedSewaJual, setter: setSelectedSewaJual, options: [["ALL","Jual / Sewa"],["JUAL","Dijual"],["SEWA","Disewakan"]] },
            { value: selectedStatus,   setter: setSelectedStatus,   options: [["ALL","Semua Status"],["AVAILABLE","Available"],["BOOKING","Booking"],["SOLD","Sold"]] },
          ] as { value: string; setter: (v: string) => void; options: [string, string][] }[]).map((f, i) => (
            <select
              key={i}
              value={f.value}
              onChange={(e) => f.setter(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
              style={{ borderColor: "#ebebeb", backgroundColor: "#f9f9f9", color: "#111" }}
            >
              {f.options.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          ))}
        </div>

        {/* Result Counter + Reset */}
        <div className="flex items-center justify-between text-xs" style={{ color: "#9ca3af" }}>
          <span>
            Menampilkan <span className="font-semibold" style={{ color: "#111" }}>{filteredListings.length}</span> dari {listings.length} properti
          </span>
          {hasFilter && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold hover:underline transition"
              style={{ color: "#111" }}
            >
              Reset filter
            </button>
          )}
        </div>
      </div>

      {/* ── Property Cards Grid ──────────────────────────────────────── */}
      {filteredListings.length === 0 ? (
        <div
          className="rounded-2xl border p-12 text-center space-y-2"
          style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb" }}
        >
          <div className="text-4xl">🏘️</div>
          <h3 className="font-bold text-base" style={{ color: "#111" }}>Tidak Ada Properti yang Sesuai</h3>
          <p className="text-sm max-w-sm mx-auto" style={{ color: "#9ca3af" }}>
            Coba ubah kata kunci atau reset filter untuk melihat properti lainnya.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map((item) => {
            const photos     = Array.isArray(item.link_foto) && item.link_foto.length > 0
              ? item.link_foto
              : ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"];
            const currentIdx  = activeImageIndex[item.id] || 0;
            const cardBg      = PASTEL_BG[item.jenis as string]     ?? "#f9f9f9";
            const accentColor = PASTEL_ACCENT[item.jenis as string] ?? "#111111";
            const statusStyle = STATUS_STYLE[item.status as string] ?? STATUS_STYLE.AVAILABLE;

            return (
              <div
                key={item.id}
                onClick={() => setActiveListingModal(item)}
                className="group cursor-pointer rounded-2xl border overflow-hidden flex flex-col transition-shadow hover:shadow-md"
                style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb" }}
              >
                {/* ── Photo Area ───────────────────────────────────────── */}
                <div className="relative h-52 w-full overflow-hidden" style={{ backgroundColor: cardBg }}>
                  <img
                    src={photos[currentIdx]}
                    alt={item.kode}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                  {/* Status Badge — top right */}
                  <div className="absolute top-3 right-3">
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                    >
                      {statusStyle.label}
                    </span>
                  </div>

                  {/* Type Badge — top left */}
                  <div className="absolute top-3 left-3">
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{ backgroundColor: "rgba(255,255,255,0.92)", color: accentColor }}
                    >
                      {item.jenis}
                    </span>
                  </div>

                  {/* Sewa/Jual + Sertifikat — bottom left */}
                  <div className="absolute bottom-3 left-3 flex gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/90 text-gray-700">
                      {item.sewa_jual || "JUAL"}
                    </span>
                    {item.sertifikat && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/90 text-gray-700">
                        {item.sertifikat}
                      </span>
                    )}
                  </div>

                  {/* Photo Navigation */}
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={(e) => handlePrevImage(item.id, photos.length, e)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-600 hover:bg-white transition text-base leading-none"
                      >
                        ‹
                      </button>
                      <button
                        onClick={(e) => handleNextImage(item.id, photos.length, e)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-600 hover:bg-white transition text-base leading-none"
                      >
                        ›
                      </button>
                      <span className="absolute bottom-3 right-3 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded-md">
                        {currentIdx + 1}/{photos.length}
                      </span>
                    </>
                  )}
                </div>

                {/* ── Card Body ─────────────────────────────────────────── */}
                <div className="p-4 flex-1 flex flex-col gap-3">

                  {/* Price Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-medium mb-0.5" style={{ color: "#9ca3af" }}>
                        Harga {item.sewa_jual === "SEWA" ? "Sewa" : "Penawaran"}
                      </div>
                      <div className="text-[22px] font-bold leading-tight" style={{ color: "#111111" }}>
                        {formatPrice(item.harga)}
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg shrink-0 mt-1"
                      style={{ backgroundColor: "#f5f5f5", color: "#6b7280" }}
                    >
                      {item.kode}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-1.5 text-[12px]" style={{ color: "#6b7280" }}>
                    <svg className="shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span className="line-clamp-1 font-medium" style={{ color: "#374151" }}>
                      {item.lokasi_area}
                    </span>
                  </div>

                  {/* Specs Row */}
                  <div
                    className="flex items-center gap-3 text-[11px] font-medium py-2.5 px-3 rounded-xl"
                    style={{ backgroundColor: "#f9f9f9", color: "#6b7280" }}
                  >
                    <span>LT {item.luas_tanah || 0}m²</span>
                    <span style={{ color: "#d1d5db" }}>·</span>
                    <span>LB {item.luas_bangunan || 0}m²</span>
                    <span style={{ color: "#d1d5db" }}>·</span>
                    <span>{item.kamar_tidur || 0} KT</span>
                    {item.kamar_mandi && (
                      <>
                        <span style={{ color: "#d1d5db" }}>·</span>
                        <span>{item.kamar_mandi} KM</span>
                      </>
                    )}
                  </div>

                  {/* Notes snippet */}
                  {item.catatan && (
                    <p className="text-[11px] italic line-clamp-2" style={{ color: "#9ca3af" }}>
                      &ldquo;{item.catatan}&rdquo;
                    </p>
                  )}

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-1 mt-auto">
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveListingModal(item); }}
                      className="text-[12px] font-semibold transition-colors hover:opacity-70"
                      style={{ color: "#111" }}
                    >
                      Lihat Detail →
                    </button>
                    {onOpenMatchModal && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onOpenMatchModal(item); }}
                        className="text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                        style={{ backgroundColor: "#111", color: "#fff" }}
                      >
                        AI Match
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Property Detail Modal ─────────────────────────────────────── */}
      {activeListingModal && (
        <PropertyDetailModal
          listing={activeListingModal}
          onClose={() => setActiveListingModal(null)}
        />
      )}
    </div>
  );
}
