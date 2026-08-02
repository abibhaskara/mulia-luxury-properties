"use client";

import { useState } from "react";
import { Listing } from "@/db/schema";
import {
  Plus,
  Search,
  Building2,
  Trash2,
  Edit,
  Eye,
  MapPin,
  Tag,
  SlidersHorizontal,
  Table as TableIcon,
  Grid as GridIcon,
  Sparkles,
  Phone,
} from "lucide-react";
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
    const matchesSearch =
      item.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lokasi_area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nama_pemilik.toLowerCase().includes(searchTerm.toLowerCase());

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Database Properti (Listings)</h2>
            <p className="text-xs text-slate-400">Total {listings.length} unit properti terdaftar</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded text-xs font-semibold ${
                viewMode === "table" ? "bg-slate-800 text-emerald-400" : "text-slate-400"
              }`}
              title="Tampilan Tabel"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded text-xs font-semibold ${
                viewMode === "grid" ? "bg-slate-800 text-emerald-400" : "text-slate-400"
              }`}
              title="Tampilan Grid"
            >
              <GridIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setActiveEditModal("NEW")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Listing Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Cari kode, area, pemilik..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
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
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Kode / Unit</th>
                  <th className="px-4 py-3">Jenis & Area</th>
                  <th className="px-4 py-3">Spesifikasi</th>
                  <th className="px-4 py-3">Harga & Komisi</th>
                  <th className="px-4 py-3">Pemilik (Owner)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Tidak ada data listing properti ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                        {item.kode}
                        <div className="text-[10px] text-slate-500 font-sans">{item.sewa_jual || "JUAL"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{item.jenis}</div>
                        <div className="text-slate-400 text-[11px] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {item.lokasi_area}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        <div>LT: {item.luas_tanah || 0}m² | LB: {item.luas_bangunan || 0}m²</div>
                        <div className="text-[11px] text-slate-400">🛏️ {item.kamar_tidur || 0} KT | 🚿 {item.kamar_mandi || 0} KM</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-extrabold text-emerald-400">{formatPrice(item.harga)}</div>
                        <div className="text-[10px] text-amber-400">Komisi: {item.komisi || "2.5%"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-200">{item.nama_pemilik}</div>
                        <div className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {item.no_hp}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={item.status || "AVAILABLE"}
                          onChange={(e) => handleStatusChange(item, e.target.value)}
                          className={`px-2 py-1 rounded text-[11px] font-bold focus:outline-none ${
                            item.status === "AVAILABLE"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : item.status === "BOOKING"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                          }`}
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="BOOKING">BOOKING</option>
                          <option value="SOLD">SOLD</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveDetailModal(item)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                            title="Lihat Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setActiveEditModal(item)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                            title="Edit Listing"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {onOpenMatchModal && (
                            <button
                              onClick={() => onOpenMatchModal(item)}
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
                              title="Match Client"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(item.id, item.kode)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-400">{item.kode}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === "AVAILABLE" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">{item.jenis} - {item.lokasi_area}</h3>
                <div className="text-emerald-400 font-extrabold text-base mt-1">{formatPrice(item.harga)}</div>
              </div>
              <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                <div>Owner: <span className="text-slate-200 font-medium">{item.nama_pemilik} ({item.no_hp})</span></div>
                <div>LT: {item.luas_tanah}m² | LB: {item.luas_bangunan}m² | {item.kamar_tidur} KT</div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setActiveDetailModal(item)}
                  className="px-2.5 py-1 rounded text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Detail
                </button>
                <button
                  onClick={() => setActiveEditModal(item)}
                  className="px-2.5 py-1 rounded text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Edit
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
