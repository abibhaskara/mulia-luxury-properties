"use client";

import { useState } from "react";
import { Listing } from "@/db/schema";
import PropertyFormModal from "./PropertyFormModal";
import PropertyDetailModal from "./PropertyDetailModal";

interface ListingsManagerProps {
  listings: Listing[];
  onRefresh: () => void;
  onOpenMatchModal?: (listing: Listing) => void;
}

// ─── Status Styles ───────────────────────────────────────────────────────────
const STATUS_PILL: Record<string, { bg: string; color: string }> = {
  AVAILABLE: { bg: "#dcfce7", color: "#16a34a" },
  BOOKING:   { bg: "#fef3c7", color: "#d97706" },
  SOLD:      { bg: "#f3f4f6", color: "#6b7280" },
};

const TYPE_DOT: Record<string, string> = {
  VILLA: "#16a34a", RUMAH: "#d97706", RUKO: "#7c3aed", TANAH: "#2563eb",
};

export default function ListingsManager({ listings, onRefresh, onOpenMatchModal }: ListingsManagerProps) {
  const [searchTerm, setSearchTerm]   = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedJenis, setSelectedJenis]   = useState("ALL");
  const [viewMode, setViewMode]             = useState<"table" | "grid">("table");
  const [activeEditModal, setActiveEditModal]     = useState<Listing | null | "NEW">(null);
  const [activeDetailModal, setActiveDetailModal] = useState<Listing | null>(null);

  const filteredListings = listings.filter((item) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.kode.toLowerCase().includes(q) ||
      item.lokasi_area.toLowerCase().includes(q) ||
      (item.alamat_lengkap && item.alamat_lengkap.toLowerCase().includes(q)) ||
      item.nama_pemilik.toLowerCase().includes(q);
    return (
      matchesSearch &&
      (selectedStatus === "ALL" || item.status === selectedStatus) &&
      (selectedJenis  === "ALL" || item.jenis  === selectedJenis)
    );
  });

  const handleDelete = async (id: string, kode: string) => {
    if (!confirm(`Hapus listing ${kode}?`)) return;
    try {
      const res  = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) onRefresh();
      else alert("Gagal menghapus: " + json.error);
    } catch { alert("Terjadi kesalahan saat menghapus"); }
  };

  const handleStatusChange = async (listing: Listing, newStatus: string) => {
    try {
      const res  = await fetch(`/api/listings/${listing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) onRefresh();
    } catch (e) { console.error(e); }
  };

  const formatPrice = (price: number) =>
    `Rp ${(price / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} M`;

  return (
    <div className="space-y-4">

      {/* ── Top Action Bar ────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb" }}
      >
        <div>
          <h2 className="font-bold text-[15px]" style={{ color: "#111" }}>Database Properti</h2>
          <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
            {listings.length} unit terdaftar · {listings.filter(l => l.status === "AVAILABLE").length} tersedia
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div
            className="flex items-center rounded-xl p-1 gap-0.5"
            style={{ backgroundColor: "#f5f5f5" }}
          >
            {(["table","grid"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                style={
                  viewMode === m
                    ? { backgroundColor: "#111", color: "#fff" }
                    : { color: "#9ca3af" }
                }
              >
                {m === "table" ? "Table" : "Grid"}
              </button>
            ))}
          </div>
          <button
            onClick={() => setActiveEditModal("NEW")}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-colors hover:opacity-90"
            style={{ backgroundColor: "#111", color: "#fff" }}
          >
            + Tambah Listing
          </button>
        </div>
      </div>

      {/* ── Filter Bar ───────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border p-3 flex flex-col sm:flex-row gap-2"
        style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb" }}
      >
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Cari kode, area, pemilik..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-1 focus:ring-gray-200"
            style={{ borderColor: "#ebebeb", backgroundColor: "#f9f9f9", color: "#111" }}
          />
        </div>
        {([
          { value: selectedStatus, setter: setSelectedStatus, options: [["ALL","Semua Status"],["AVAILABLE","Available"],["BOOKING","Booking"],["SOLD","Sold"]] },
          { value: selectedJenis,  setter: setSelectedJenis,  options: [["ALL","Semua Jenis"],["RUMAH","Rumah"],["VILLA","Villa"],["RUKO","Ruko"],["TANAH","Tanah"]] },
        ] as { value: string; setter: (v: string) => void; options: [string, string][] }[]).map((f, i) => (
          <select
            key={i}
            value={f.value}
            onChange={(e) => (f.setter as any)(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border focus:outline-none"
            style={{ borderColor: "#ebebeb", backgroundColor: "#f9f9f9", color: "#111" }}
          >
            {f.options.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
      </div>

      {/* ── Table / Grid ─────────────────────────────────────────────── */}
      {viewMode === "table" ? (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr style={{ backgroundColor: "#f9f9f9", borderBottom: "1px solid #ebebeb" }}>
                  {["Kode / Unit","Jenis & Area","Spesifikasi","Harga","Pemilik","Status","Aksi"].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wide" style={{ color: "#9ca3af" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm font-medium" style={{ color: "#9ca3af" }}>
                      Tidak ada listing yang sesuai filter.
                    </td>
                  </tr>
                ) : filteredListings.map((item) => {
                  const pill  = STATUS_PILL[item.status as string]  ?? STATUS_PILL.AVAILABLE;
                  const dot   = TYPE_DOT[item.jenis as string]       ?? "#9ca3af";
                  return (
                    <tr
                      key={item.id}
                      className="border-t transition-colors hover:bg-gray-50"
                      style={{ borderColor: "#f3f4f6" }}
                    >
                      {/* Kode */}
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-[12px]" style={{ color: "#111" }}>{item.kode}</span>
                        <div className="text-[10px] mt-0.5 font-medium" style={{ color: "#9ca3af" }}>{item.sewa_jual || "JUAL"}</div>
                      </td>

                      {/* Jenis & Area */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dot }} />
                          <span className="font-semibold text-[12px]" style={{ color: "#111" }}>{item.jenis}</span>
                        </div>
                        <div className="text-[11px] mt-0.5" style={{ color: "#6b7280" }}>{item.lokasi_area}</div>
                        {item.alamat_lengkap && (
                          <div className="text-[10px] mt-0.5 line-clamp-1 max-w-[180px]" style={{ color: "#9ca3af" }}>{item.alamat_lengkap}</div>
                        )}
                      </td>

                      {/* Specs */}
                      <td className="px-4 py-3">
                        <div className="text-[11px] font-medium" style={{ color: "#374151" }}>
                          LT {item.luas_tanah || 0}m² · LB {item.luas_bangunan || 0}m²
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: "#9ca3af" }}>
                          {item.kamar_tidur || 0} KT · {item.kamar_mandi || 0} KM
                        </div>
                      </td>

                      {/* Harga */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-[13px]" style={{ color: "#111" }}>{formatPrice(item.harga)}</div>
                        <div className="text-[10px] mt-0.5" style={{ color: "#9ca3af" }}>Komisi: {item.komisi || "2.5%"}</div>
                      </td>

                      {/* Pemilik */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[12px]" style={{ color: "#111" }}>{item.nama_pemilik}</div>
                        <div className="text-[10px] mt-0.5" style={{ color: "#9ca3af" }}>{item.no_hp}</div>
                      </td>

                      {/* Status Select */}
                      <td className="px-4 py-3">
                        <select
                          value={item.status || "AVAILABLE"}
                          onChange={(e) => handleStatusChange(item, e.target.value)}
                          className="text-[11px] font-bold px-2.5 py-1.5 rounded-full border-none focus:outline-none cursor-pointer"
                          style={{ backgroundColor: pill.bg, color: pill.color }}
                        >
                          <option value="AVAILABLE">Available</option>
                          <option value="BOOKING">Booking</option>
                          <option value="SOLD">Sold</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setActiveDetailModal(item)}
                            className="px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors hover:bg-gray-100"
                            style={{ color: "#6b7280" }}
                          >
                            Detail
                          </button>
                          <button
                            onClick={() => setActiveEditModal(item)}
                            className="px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors hover:bg-gray-100"
                            style={{ color: "#6b7280" }}
                          >
                            Edit
                          </button>
                          {onOpenMatchModal && (
                            <button
                              onClick={() => onOpenMatchModal(item)}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold transition-colors"
                              style={{ backgroundColor: "#111", color: "#fff" }}
                            >
                              AI
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(item.id, item.kode)}
                            className="px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors hover:bg-red-50"
                            style={{ color: "#ef4444" }}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── Grid View ──────────────────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.length === 0 ? (
            <div
              className="col-span-full rounded-2xl border p-10 text-center"
              style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb" }}
            >
              <p className="text-sm font-medium" style={{ color: "#9ca3af" }}>Tidak ada listing yang sesuai.</p>
            </div>
          ) : filteredListings.map((item) => {
            const pill = STATUS_PILL[item.status as string] ?? STATUS_PILL.AVAILABLE;
            const dot  = TYPE_DOT[item.jenis as string] ?? "#9ca3af";
            return (
              <div
                key={item.id}
                className="rounded-2xl border p-4 space-y-3"
                style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dot }} />
                    <span className="font-mono font-bold text-[12px]" style={{ color: "#111" }}>{item.kode}</span>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: pill.bg, color: pill.color }}
                  >
                    {item.status}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: "#374151" }}>
                    {item.jenis} · {item.lokasi_area}
                  </div>
                  <div className="font-bold text-lg mt-0.5" style={{ color: "#111" }}>{formatPrice(item.harga)}</div>
                </div>
                <div
                  className="text-[11px] space-y-1 pt-2 border-t"
                  style={{ borderColor: "#f3f4f6", color: "#6b7280" }}
                >
                  <div>Owner: <span className="font-semibold" style={{ color: "#374151" }}>{item.nama_pemilik}</span></div>
                  <div>LT {item.luas_tanah}m² · LB {item.luas_bangunan}m² · {item.kamar_tidur} KT</div>
                </div>
                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    onClick={() => setActiveDetailModal(item)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors hover:bg-gray-100"
                    style={{ color: "#6b7280" }}
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => setActiveEditModal(item)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors hover:bg-gray-100"
                    style={{ color: "#6b7280" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.kode)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold hover:bg-red-50"
                    style={{ color: "#ef4444" }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────── */}
      {activeEditModal && (
        <PropertyFormModal
          listing={activeEditModal === "NEW" ? null : activeEditModal}
          onClose={() => setActiveEditModal(null)}
          onSuccess={onRefresh}
        />
      )}
      {activeDetailModal && (
        <PropertyDetailModal
          listing={activeDetailModal}
          onClose={() => setActiveDetailModal(null)}
        />
      )}
    </div>
  );
}
