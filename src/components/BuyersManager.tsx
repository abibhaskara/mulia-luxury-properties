"use client";

import { useState } from "react";
import { Buyer } from "@/db/schema";
import { Users, Plus, Sparkles, Search, Trash2, Edit, CheckCircle2, Clock, PhoneCall, Handshake, MapPin } from "lucide-react";
import BuyerFormModal from "./BuyerFormModal";

interface BuyersManagerProps {
  buyersList: Buyer[];
  onRefresh: () => void;
  onRunAiMatch: (buyer: Buyer) => void;
}

export default function BuyersManager({ buyersList, onRefresh, onRunAiMatch }: BuyersManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [activeFormModal, setActiveFormModal] = useState<Buyer | null | "NEW">(null);

  const filteredBuyers = buyersList.filter((b) => {
    const matchesSearch =
      b.nama_klien.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.lokasi_dicari && b.lokasi_dicari.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.catatan && b.catatan.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === "ALL" || b.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data buyer ${name}?`)) return;
    try {
      const res = await fetch(`/api/buyers/${id}`, { method: "DELETE" });
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

  const handleStatusChange = async (buyer: Buyer, newStatus: string) => {
    try {
      const res = await fetch(`/api/buyers/${buyer.id}`, {
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

  const formatPrice = (val: number | null) => {
    if (!val) return "Rp 0";
    if (val >= 1000000000) {
      return `Rp ${(val / 1000000000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
    }
    return `Rp ${(val / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} Jt`;
  };

  const getStatusBadgeStyle = (status: string | null) => {
    switch (status) {
      case "NEW":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "CONTACTED":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "VIEWING":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "NEGOTIATION":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "CLOSED":
        return "bg-teal-500 text-slate-950 border-teal-400 font-extrabold";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Database Buyers & Lead CRM</h2>
            <p className="text-xs text-slate-400">Total {buyersList.length} prospek pencari properti</p>
          </div>
        </div>

        <button
          onClick={() => setActiveFormModal("NEW")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Tambah Buyer Lead Baru</span>
        </button>
      </div>

      {/* Pipeline Stage Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { key: "NEW", label: "Prospek Baru", icon: Clock },
          { key: "CONTACTED", label: "Dikontak", icon: PhoneCall },
          { key: "VIEWING", label: "Survei Lokasi", icon: MapPin },
          { key: "NEGOTIATION", label: "Negosiasi", icon: Handshake },
          { key: "CLOSED", label: "Deal Closed", icon: CheckCircle2 },
        ].map((stage) => {
          const count = buyersList.filter((b) => b.status === stage.key).length;
          const isSelected = selectedStatus === stage.key;
          const Icon = stage.icon;
          return (
            <button
              key={stage.key}
              onClick={() => setSelectedStatus(isSelected ? "ALL" : stage.key)}
              className={`p-3 rounded-xl border text-left transition ${
                isSelected
                  ? "bg-emerald-950/60 border-emerald-500/50 shadow-inner"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{stage.label}</span>
                <Icon className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-black text-white">{count}</div>
            </button>
          );
        })}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Cari nama klien, lokasi dicari, atau catatan..."
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
            <option value="ALL">Semua Status Lead</option>
            <option value="NEW">NEW (Prospek Baru)</option>
            <option value="CONTACTED">CONTACTED (Sudah Dikontak)</option>
            <option value="VIEWING">VIEWING (Survei Lokasi)</option>
            <option value="NEGOTIATION">NEGOTIATION (Tahap Nego)</option>
            <option value="CLOSED">CLOSED (Deal Closed)</option>
          </select>
        </div>
      </div>

      {/* Buyers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBuyers.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
            Belum ada data buyer lead yang sesuai.
          </div>
        ) : (
          filteredBuyers.map((b) => (
            <div
              key={b.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div className="space-y-2">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-sm">{b.nama_klien}</h3>
                    <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                      Mencari: {b.jenis_dicari || "Semua Tipe"} di {b.lokasi_dicari || "Bebas"}
                    </div>
                  </div>

                  <select
                    value={b.status || "NEW"}
                    onChange={(e) => handleStatusChange(b, e.target.value)}
                    className={`px-2 py-0.5 rounded text-[10px] border font-bold ${getStatusBadgeStyle(
                      b.status
                    )}`}
                  >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="VIEWING">VIEWING</option>
                    <option value="NEGOTIATION">NEGOTIATION</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                {/* Criteria Details */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs space-y-1">
                  <div className="text-slate-300">
                    Budget: <span className="font-bold text-emerald-400">{formatPrice(b.budget_min)} - {formatPrice(b.budget_max)}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Min Spesifikasi: {b.kt_min || 0} KT | LT {b.lt_min || 0}m² | LB {b.lb_min || 0}m²
                  </div>
                  {b.catatan && (
                    <div className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-900">
                      "{b.catatan}"
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => onRunAiMatch(b)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Match Properti</span>
                </button>

                <button
                  onClick={() => setActiveFormModal(b)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                  title="Edit Buyer"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(b.id, b.nama_klien)}
                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Buyer Form Modal */}
      {activeFormModal && (
        <BuyerFormModal
          buyer={activeFormModal === "NEW" ? null : activeFormModal}
          onClose={() => setActiveFormModal(null)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
