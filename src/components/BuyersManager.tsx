"use client";

import { useState } from "react";
import { Buyer } from "@/db/schema";
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
    return "bg-white text-black border-black";
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-black p-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-black">Database Buyers & Lead CRM</h2>
            <p className="text-xs text-black">Total {buyersList.length} prospek pencari properti</p>
          </div>
        </div>

        <button
          onClick={() => setActiveFormModal("NEW")}
          className="px-4 py-2 bg-white border border-black text-black font-bold text-xs hover:bg-gray-100"
        >
          [+] Tambah Buyer Lead Baru
        </button>
      </div>

      {/* Pipeline Stage Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { key: "NEW", label: "Prospek Baru" },
          { key: "CONTACTED", label: "Dikontak" },
          { key: "VIEWING", label: "Survei Lokasi" },
          { key: "NEGOTIATION", label: "Negosiasi" },
          { key: "CLOSED", label: "Deal Closed" },
        ].map((stage) => {
          const count = buyersList.filter((b) => b.status === stage.key).length;
          const isSelected = selectedStatus === stage.key;
          return (
            <button
              key={stage.key}
              onClick={() => setSelectedStatus(isSelected ? "ALL" : stage.key)}
              className={`p-3 border text-left ${
                isSelected
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-black hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold">{stage.label}</span>
              </div>
              <div className="text-xl font-bold">{count}</div>
            </button>
          );
        })}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-black p-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cari nama klien, lokasi dicari, atau catatan..."
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
          <div className="col-span-full bg-white border border-black p-8 text-center text-black text-xs font-bold">
            Belum ada data buyer lead yang sesuai.
          </div>
        ) : (
          filteredBuyers.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-black p-4 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-black text-sm">{b.nama_klien}</h3>
                    <div className="text-xs text-black mt-0.5">
                      Mencari: {b.jenis_dicari || "Semua Tipe"} di {b.lokasi_dicari || "Bebas"}
                    </div>
                  </div>

                  <select
                    value={b.status || "NEW"}
                    onChange={(e) => handleStatusChange(b, e.target.value)}
                    className={`px-2 py-0.5 text-[10px] border font-bold focus:outline-none ${getStatusBadgeStyle(
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
                <div className="p-3 bg-white border border-black text-xs space-y-1">
                  <div className="text-black">
                    Budget: <span className="font-bold">{formatPrice(b.budget_min)} - {formatPrice(b.budget_max)}</span>
                  </div>
                  <div className="text-black text-[11px]">
                    Min Spesifikasi: {b.kt_min || 0} KT | LT {b.lt_min || 0}m² | LB {b.lb_min || 0}m²
                  </div>
                  {b.catatan && (
                    <div className="text-[11px] text-black italic pt-1 border-t border-black">
                      "{b.catatan}"
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-black flex items-center justify-end gap-3">
                <button
                  onClick={() => onRunAiMatch(b)}
                  className="font-bold text-[10px] uppercase hover:underline"
                >
                  [Match Properti]
                </button>

                <button
                  onClick={() => setActiveFormModal(b)}
                  className="font-bold text-[10px] uppercase hover:underline"
                >
                  [Edit]
                </button>

                <button
                  onClick={() => handleDelete(b.id, b.nama_klien)}
                  className="font-bold text-[10px] uppercase hover:underline"
                >
                  [Delete]
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
