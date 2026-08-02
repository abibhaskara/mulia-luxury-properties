"use client";

import { useState } from "react";
import { Buyer } from "@/db/schema";
import { X } from "lucide-react";

interface BuyerFormModalProps {
  buyer?: Buyer | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BuyerFormModal({ buyer, onClose, onSuccess }: BuyerFormModalProps) {
  const [formData, setFormData] = useState({
    id: buyer?.id || "",
    nama_klien: buyer?.nama_klien || "",
    jenis_dicari: buyer?.jenis_dicari || "VILLA",
    lokasi_dicari: buyer?.lokasi_dicari || "Bali",
    budget_min: buyer?.budget_min || 3000000000,
    budget_max: buyer?.budget_max || 8000000000,
    lt_min: buyer?.lt_min || 250,
    lb_min: buyer?.lb_min || 200,
    kt_min: buyer?.kt_min || 3,
    catatan: buyer?.catatan || "",
    status: buyer?.status || "NEW",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_klien.trim()) {
      setErrorMessage("Nama klien wajib diisi");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const url = buyer ? `/api/buyers/${buyer.id}` : "/api/buyers";
      const method = buyer ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Gagal menyimpan client buyer");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <h3 className="text-lg font-bold text-white">
            {buyer ? "Edit Data Buyer Lead" : "Tambah Buyer / Calon Pembeli Baru"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-200">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Nama Klien / Buyer *</label>
            <input
              type="text"
              required
              value={formData.nama_klien}
              onChange={(e) => setFormData({ ...formData, nama_klien: e.target.value })}
              placeholder="Siti Rahmawati"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Jenis Dicari</label>
              <select
                value={formData.jenis_dicari}
                onChange={(e) => setFormData({ ...formData, jenis_dicari: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="RUMAH">Rumah</option>
                <option value="VILLA">Villa</option>
                <option value="RUKO">Ruko</option>
                <option value="TANAH">Tanah</option>
                <option value="ANY">Semua Tipe (Bebas)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Status Pipeline Lead</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="NEW">NEW (Prospek Baru)</option>
                <option value="CONTACTED">CONTACTED (Sudah Dikontak)</option>
                <option value="VIEWING">VIEWING (Survei Lokasi)</option>
                <option value="NEGOTIATION">NEGOTIATION (Tahap Nego)</option>
                <option value="CLOSED">CLOSED (Deal Closed)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Lokasi Area Dicari</label>
            <input
              type="text"
              value={formData.lokasi_dicari}
              onChange={(e) => setFormData({ ...formData, lokasi_dicari: e.target.value })}
              placeholder="Canggu, Bali atau Jakarta Selatan"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Budget Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Budget Minimal (Rp)</label>
              <input
                type="number"
                value={formData.budget_min}
                onChange={(e) => setFormData({ ...formData, budget_min: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Budget Maksimal (Rp)</label>
              <input
                type="number"
                value={formData.budget_max}
                onChange={(e) => setFormData({ ...formData, budget_max: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Specs criteria */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">LT Min (m²)</label>
              <input
                type="number"
                value={formData.lt_min}
                onChange={(e) => setFormData({ ...formData, lt_min: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">LB Min (m²)</label>
              <input
                type="number"
                value={formData.lb_min}
                onChange={(e) => setFormData({ ...formData, lb_min: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">KT Min</label>
              <input
                type="number"
                value={formData.kt_min}
                onChange={(e) => setFormData({ ...formData, kt_min: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Catatan Kebutuhan Khusus Klien</label>
            <textarea
              rows={3}
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              placeholder="Ingin private pool, dekat pantai, garasi 3 mobil, butuh secepatnya..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black shadow-lg shadow-emerald-500/20"
            >
              {isSubmitting ? "Menyimpan..." : buyer ? "Simpan Perubahan" : "Tambah Buyer Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
