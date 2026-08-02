"use client";

import { useState } from "react";
import { Buyer } from "@/db/schema";
import BuyerFormModal from "./BuyerFormModal";

interface BuyersManagerProps {
  buyersList: Buyer[];
  onRefresh: () => void;
  onRunAiMatch: (buyer: Buyer) => void;
}

// ─── Pipeline Stages Config ──────────────────────────────────────────────────
const PIPELINE_STAGES = [
  { key: "NEW",         label: "Prospek Baru",    color: "#6366f1", bg: "#eef2ff" },
  { key: "CONTACTED",  label: "Dikontak",         color: "#0891b2", bg: "#ecfeff" },
  { key: "VIEWING",    label: "Survei",           color: "#d97706", bg: "#fef3c7" },
  { key: "NEGOTIATION",label: "Negosiasi",        color: "#7c3aed", bg: "#ede9fe" },
  { key: "CLOSED",     label: "Deal Closed",      color: "#16a34a", bg: "#dcfce7" },
];

const getPipelineStyle = (status: string | null) =>
  PIPELINE_STAGES.find((s) => s.key === status) ?? PIPELINE_STAGES[0];

export default function BuyersManager({ buyersList, onRefresh, onRunAiMatch }: BuyersManagerProps) {
  const [searchTerm, setSearchTerm]       = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [activeFormModal, setActiveFormModal] = useState<Buyer | null | "NEW">(null);

  const filteredBuyers = buyersList.filter((b) => {
    const matchesSearch =
      b.nama_klien.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.lokasi_dicari && b.lokasi_dicari.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.catatan && b.catatan.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch && (selectedStatus === "ALL" || b.status === selectedStatus);
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus data buyer ${name}?`)) return;
    try {
      const res  = await fetch(`/api/buyers/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) onRefresh();
      else alert("Gagal menghapus: " + json.error);
    } catch { alert("Terjadi kesalahan saat menghapus"); }
  };

  const handleStatusChange = async (buyer: Buyer, newStatus: string) => {
    try {
      const res  = await fetch(`/api/buyers/${buyer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) onRefresh();
    } catch (e) { console.error(e); }
  };

  const formatPrice = (val: number | null) => {
    if (!val) return "Rp 0";
    if (val >= 1_000_000_000)
      return `Rp ${(val / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
    return `Rp ${(val / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} Jt`;
  };

  return (
    <div className="space-y-4">

      {/* ── Top Action Bar ────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb" }}
      >
        <div>
          <h2 className="font-bold text-[15px]" style={{ color: "#111" }}>Database Buyer & Lead CRM</h2>
          <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
            {buyersList.length} prospek terdaftar · {buyersList.filter(b => b.status === "CLOSED").length} deal closed
          </p>
        </div>
        <button
          onClick={() => setActiveFormModal("NEW")}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-colors hover:opacity-90 self-start sm:self-auto"
          style={{ backgroundColor: "#111", color: "#fff" }}
        >
          + Tambah Buyer Lead
        </button>
      </div>

      {/* ── Pipeline Stage Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {PIPELINE_STAGES.map((stage) => {
          const count      = buyersList.filter((b) => b.status === stage.key).length;
          const isSelected = selectedStatus === stage.key;
          return (
            <button
              key={stage.key}
              onClick={() => setSelectedStatus(isSelected ? "ALL" : stage.key)}
              className="rounded-2xl p-4 text-left border transition-all"
              style={{
                backgroundColor: isSelected ? stage.color : "#ffffff",
                borderColor: isSelected ? stage.color : "#ebebeb",
                color: isSelected ? "#ffffff" : "#111",
              }}
            >
              <div
                className="text-[10px] font-semibold mb-1 uppercase tracking-wide"
                style={{ color: isSelected ? "rgba(255,255,255,0.75)" : "#9ca3af" }}
              >
                {stage.label}
              </div>
              <div className="text-2xl font-bold">{count}</div>
            </button>
          );
        })}
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
            placeholder="Cari nama klien, lokasi, catatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border focus:outline-none"
            style={{ borderColor: "#ebebeb", backgroundColor: "#f9f9f9", color: "#111" }}
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border focus:outline-none"
          style={{ borderColor: "#ebebeb", backgroundColor: "#f9f9f9", color: "#111" }}
        >
          <option value="ALL">Semua Status</option>
          <option value="NEW">NEW</option>
          <option value="CONTACTED">CONTACTED</option>
          <option value="VIEWING">VIEWING</option>
          <option value="NEGOTIATION">NEGOTIATION</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      </div>

      {/* ── Buyer Cards Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBuyers.length === 0 ? (
          <div
            className="col-span-full rounded-2xl border p-10 text-center"
            style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb" }}
          >
            <p className="text-sm font-medium" style={{ color: "#9ca3af" }}>Belum ada data buyer lead yang sesuai.</p>
          </div>
        ) : filteredBuyers.map((b) => {
          const stage = getPipelineStyle(b.status);
          return (
            <div
              key={b.id}
              className="rounded-2xl border overflow-hidden flex flex-col"
              style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb" }}
            >
              {/* Colored top accent */}
              <div className="h-1" style={{ backgroundColor: stage.color }} />

              <div className="p-4 flex-1 flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: "#111" }}>{b.nama_klien}</h3>
                    <div className="text-[11px] mt-0.5" style={{ color: "#6b7280" }}>
                      {b.jenis_dicari || "Semua Tipe"} · {b.lokasi_dicari || "Bebas"}
                    </div>
                  </div>
                  <select
                    value={b.status || "NEW"}
                    onChange={(e) => handleStatusChange(b, e.target.value)}
                    className="text-[10px] font-bold px-2 py-1 rounded-full border-none focus:outline-none cursor-pointer shrink-0"
                    style={{ backgroundColor: stage.bg, color: stage.color }}
                  >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="VIEWING">VIEWING</option>
                    <option value="NEGOTIATION">NEGOTIATION</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                {/* Budget + Specs */}
                <div
                  className="p-3 rounded-xl space-y-1.5 text-[11px]"
                  style={{ backgroundColor: "#f9f9f9" }}
                >
                  <div className="flex items-center justify-between">
                    <span style={{ color: "#9ca3af" }}>Budget Range</span>
                    <span className="font-bold text-[12px]" style={{ color: "#111" }}>
                      {formatPrice(b.budget_min)} – {formatPrice(b.budget_max)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: "#9ca3af" }}>Min Spesifikasi</span>
                    <span className="font-medium" style={{ color: "#374151" }}>
                      {b.kt_min || 0} KT · LT {b.lt_min || 0}m² · LB {b.lb_min || 0}m²
                    </span>
                  </div>
                  {b.catatan && (
                    <p className="text-[10px] italic pt-1 border-t" style={{ borderColor: "#ebebeb", color: "#9ca3af" }}>
                      &ldquo;{b.catatan}&rdquo;
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 mt-auto">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveFormModal(b)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors hover:bg-gray-100"
                      style={{ color: "#6b7280" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b.id, b.nama_klien)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold hover:bg-red-50"
                      style={{ color: "#ef4444" }}
                    >
                      Hapus
                    </button>
                  </div>
                  <button
                    onClick={() => onRunAiMatch(b)}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors hover:opacity-80"
                    style={{ backgroundColor: "#111", color: "#fff" }}
                  >
                    AI Match
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Modal ────────────────────────────────────────────────────── */}
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
