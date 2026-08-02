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

export default function ListingsManager({ listings, onRefresh, onOpenMatchModal }: ListingsManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedJenis, setSelectedJenis] = useState("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const [activeEditModal, setActiveEditModal] = useState<Listing | null | "NEW">(null);
  const [activeDetailModal, setActiveDetailModal] = useState<Listing | null>(null);

  const filteredListings = listings.filter((item) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.kode.toLowerCase().includes(q) ||
      item.lokasi_area.toLowerCase().includes(q) ||
      (item.alamat_lengkap && item.alamat_lengkap.toLowerCase().includes(q)) ||
      item.nama_pemilik.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;
    const matchesJenis = selectedJenis === "ALL" || item.jenis === selectedJenis;

    return matchesSearch && matchesStatus && matchesJenis;
  });


  const handleDelete = async (id: string, kode: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus listing ${kode}?`)) return;
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        onRefresh();
      } else {
        alert("Gagal menghapus: " + json.error);
      }
    } catch (e) {
      alert("Terjadi kesalahan saat menghapus");
    }
  };

  const handleStatusChange = async (listing: Listing, newStatus: string) => {
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatPrice = (price: number) => {
    return `Rp ${(price / 1000000000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} M`;
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-black p-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-black">Database Properti (Listings)</h2>
            <p className="text-xs text-black">Total {listings.length} unit properti terdaftar</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white border border-black p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 text-xs font-bold ${
                viewMode === "table" ? "bg-black text-white" : "text-black"
              }`}
            >
              [Table]
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 text-xs font-bold ${
                viewMode === "grid" ? "bg-black text-white" : "text-black"
              }`}
            >
              [Grid]
            </button>
          </div>

          <button
            onClick={() => setActiveEditModal("NEW")}
            className="px-4 py-2 bg-white border border-black text-black font-bold text-xs hover:bg-gray-100"
          >
            [+] Tambah Listing Baru
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white border border-black p-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari kode, area, pemilik..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-black text-xs text-black placeholder-gray-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-black text-xs text-black focus:outline-none"
          >
            <option value="ALL">Semua Status Unit</option>
            <option value="AVAILABLE">AVAILABLE (Tersedia)</option>
            <option value="BOOKING">BOOKING (Terpesan)</option>
            <option value="SOLD">SOLD (Terjual)</option>
          </select>
        </div>

        <div>
          <select
            value={selectedJenis}
            onChange={(e) => setSelectedJenis(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-black text-xs text-black focus:outline-none"
          >
            <option value="ALL">Semua Jenis Properti</option>
            <option value="RUMAH">Rumah</option>
            <option value="VILLA">Villa</option>
            <option value="RUKO">Ruko</option>
            <option value="TANAH">Tanah</option>
          </select>
        </div>
      </div>

      {/* Main Table / Grid View */}
      {viewMode === "table" ? (
        <div className="bg-white border border-black overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-black">
              <thead className="bg-white text-black uppercase font-bold border-b border-black">
                <tr>
                  <th className="px-4 py-3 border-r border-black">Kode / Unit</th>
                  <th className="px-4 py-3 border-r border-black">Jenis & Area</th>
                  <th className="px-4 py-3 border-r border-black">Spesifikasi</th>
                  <th className="px-4 py-3 border-r border-black">Harga & Komisi</th>
                  <th className="px-4 py-3 border-r border-black">Pemilik (Owner)</th>
                  <th className="px-4 py-3 border-r border-black">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-black font-bold">
                      Tidak ada data listing properti ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-100">
                      <td className="px-4 py-3 font-mono font-bold border-r border-black">
                        {item.kode}
                        <div className="text-[10px]">{item.sewa_jual || "JUAL"}</div>
                      </td>
                      <td className="px-4 py-3 border-r border-black">
                        <div className="font-bold">{item.jenis}</div>
                        <div className="text-[11px] font-bold text-black">
                          📍 {item.lokasi_area}
                        </div>
                        {item.alamat_lengkap && (
                          <div className="text-[10px] text-gray-700 line-clamp-2 max-w-xs">
                            {item.alamat_lengkap}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 border-r border-black">
                        <div>LT: {item.luas_tanah || 0}m² | LB: {item.luas_bangunan || 0}m²</div>
                        <div className="text-[11px]">KT {item.kamar_tidur || 0} | KM {item.kamar_mandi || 0}</div>
                      </td>
                      <td className="px-4 py-3 border-r border-black">
                        <div className="font-bold">{formatPrice(item.harga)}</div>
                        <div className="text-[10px]">Komisi: {item.komisi || "2.5%"}</div>
                      </td>
                      <td className="px-4 py-3 border-r border-black">
                        <div className="font-bold">{item.nama_pemilik}</div>
                        <div className="text-[11px]">
                          {item.no_hp}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r border-black">
                        <select
                          value={item.status || "AVAILABLE"}
                          onChange={(e) => handleStatusChange(item, e.target.value)}
                          className="px-2 py-1 text-[11px] font-bold bg-white text-black border border-black focus:outline-none"
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="BOOKING">BOOKING</option>
                          <option value="SOLD">SOLD</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActiveDetailModal(item)}
                            className="font-bold text-[10px] uppercase hover:underline"
                          >
                            [Detail]
                          </button>
                          <button
                            onClick={() => setActiveEditModal(item)}
                            className="font-bold text-[10px] uppercase hover:underline"
                          >
                            [Edit]
                          </button>
                          {onOpenMatchModal && (
                            <button
                              onClick={() => onOpenMatchModal(item)}
                              className="font-bold text-[10px] uppercase hover:underline"
                            >
                              [Match]
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(item.id, item.kode)}
                            className="font-bold text-[10px] uppercase hover:underline"
                          >
                            [Delete]
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-black p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-black">{item.kode}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold border border-black bg-white text-black">
                  {item.status}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-black text-sm">{item.jenis} - {item.lokasi_area}</h3>
                <div className="font-bold text-base mt-1">{formatPrice(item.harga)}</div>
              </div>
              <div className="text-xs text-black space-y-1 pt-2 border-t border-black">
                <div>Owner: <span className="font-bold">{item.nama_pemilik} ({item.no_hp})</span></div>
                <div>LT: {item.luas_tanah}m² | LB: {item.luas_bangunan}m² | {item.kamar_tidur} KT</div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black">
                <button
                  onClick={() => setActiveDetailModal(item)}
                  className="font-bold text-[10px] uppercase hover:underline"
                >
                  [Detail]
                </button>
                <button
                  onClick={() => setActiveEditModal(item)}
                  className="font-bold text-[10px] uppercase hover:underline"
                >
                  [Edit]
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {activeEditModal && (
        <PropertyFormModal
          listing={activeEditModal === "NEW" ? null : activeEditModal}
          onClose={() => setActiveEditModal(null)}
          onSuccess={onRefresh}
        />
      )}

      {/* Detail Modal */}
      {activeDetailModal && (
        <PropertyDetailModal
          listing={activeDetailModal}
          onClose={() => setActiveDetailModal(null)}
        />
      )}
    </div>
  );
}
