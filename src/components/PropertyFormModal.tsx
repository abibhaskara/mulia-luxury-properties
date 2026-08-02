"use client";

import { useState } from "react";
import { Listing } from "@/db/schema";
import { X, Upload, Plus, Trash2, MapPin } from "lucide-react";

interface PropertyFormModalProps {
  listing?: Listing | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PropertyFormModal({ listing, onClose, onSuccess }: PropertyFormModalProps) {
  const [formData, setFormData] = useState({
    id: listing?.id || "",
    kode: listing?.kode || `HS-${Math.floor(100 + Math.random() * 900)}`,
    status: listing?.status || "AVAILABLE",
    jenis: listing?.jenis || "RUMAH",
    lokasi_area: listing?.lokasi_area || "",
    alamat_lengkap: listing?.alamat_lengkap || "",
    latitude: listing?.latitude || -8.6500,
    longitude: listing?.longitude || 115.1381,
    luas_tanah: listing?.luas_tanah || 200,
    luas_bangunan: listing?.luas_bangunan || 150,
    kamar_tidur: listing?.kamar_tidur || 3,
    kamar_mandi: listing?.kamar_mandi || 2,
    harga: listing?.harga || 1500000000,
    sewa_jual: listing?.sewa_jual || "JUAL",
    sertifikat: listing?.sertifikat || "SHM",
    furnished: listing?.furnished || "NON",
    tahun_bangun: listing?.tahun_bangun || 2022,
    komisi: listing?.komisi || "2.5%",
    nama_pemilik: listing?.nama_pemilik || "",
    no_hp: listing?.no_hp || "",
    link_gdrive: listing?.link_gdrive || "",
    catatan: listing?.catatan || "",
  });

  const [photosList, setPhotosList] = useState<string[]>(
    Array.isArray(listing?.link_foto) && listing?.link_foto.length > 0
      ? listing.link_foto
      : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"]
  );

  const [newPhotoInput, setNewPhotoInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAddPhoto = () => {
    if (!newPhotoInput.trim()) return;
    setPhotosList([...photosList, newPhotoInput.trim()]);
    setNewPhotoInput("");
  };

  const handleRemovePhoto = (index: number) => {
    setPhotosList(photosList.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kode || !formData.lokasi_area || !formData.nama_pemilik || !formData.no_hp || !formData.harga) {
      setErrorMessage("Mohon lengkapi kolom wajib: Kode, Lokasi Area, Nama Pemilik, No HP, dan Harga.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        ...formData,
        link_foto: photosList,
      };

      const url = listing ? `/api/listings/${listing.id}` : "/api/listings";
      const method = listing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Gagal menyimpan listing");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Preset Locations for Easy Input
  const locationPresets = [
    { label: "Canggu, Bali", lat: -8.6500, lng: 115.1381 },
    { label: "Uluwatu, Bali", lat: -8.8149, lng: 115.1186 },
    { label: "Pondok Indah, Jaksel", lat: -6.2750, lng: 106.7820 },
    { label: "BSD City, Tangerang", lat: -6.3015, lng: 106.6534 },
    { label: "Dago Pakar, Bandung", lat: -6.8640, lng: 107.6360 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <h3 className="text-lg font-bold text-white">
            {listing ? "Edit Properti" : "Tambah Listing Properti Baru"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Basic Property Info */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-100 uppercase tracking-wider text-xs border-b border-slate-800 pb-1">
              1. Identitas & Informasi Utama
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Kode Listing *</label>
                <input
                  type="text"
                  required
                  value={formData.kode}
                  onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                  placeholder="Contoh: HS-RMH-008"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Jenis Properti</label>
                <select
                  value={formData.jenis}
                  onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="RUMAH">Rumah</option>
                  <option value="VILLA">Villa</option>
                  <option value="RUKO">Ruko</option>
                  <option value="TANAH">Tanah</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Status Unit</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="AVAILABLE">AVAILABLE (Tersedia)</option>
                  <option value="BOOKING">BOOKING (Terpesan)</option>
                  <option value="SOLD">SOLD (Terjual)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing & Terms */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-100 uppercase tracking-wider text-xs border-b border-slate-800 pb-1">
              2. Harga & Legalitas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Harga (Rupiah) *</label>
                <input
                  type="number"
                  required
                  value={formData.harga}
                  onChange={(e) => setFormData({ ...formData, harga: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Status Transaksi</label>
                <select
                  value={formData.sewa_jual}
                  onChange={(e) => setFormData({ ...formData, sewa_jual: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="JUAL">JUAL</option>
                  <option value="SEWA">SEWA</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Sertifikat Legalitas</label>
                <select
                  value={formData.sertifikat}
                  onChange={(e) => setFormData({ ...formData, sertifikat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="SHM">SHM (Sertifikat Hak Milik)</option>
                  <option value="HGB">HGB (Hak Guna Bangunan)</option>
                  <option value="HP">Hak Pakai</option>
                  <option value="STRATA">Strata Title</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location & Coordinates */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-100 uppercase tracking-wider text-xs border-b border-slate-800 pb-1">
              3. Lokasi & Peta Geolocation
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Lokasi Area / Kota *</label>
                <input
                  type="text"
                  required
                  value={formData.lokasi_area}
                  onChange={(e) => setFormData({ ...formData, lokasi_area: e.target.value })}
                  placeholder="Contoh: Canggu, Bali atau Jakarta Selatan"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Alamat Lengkap (Opsional)</label>
                <textarea
                  rows={2}
                  value={formData.alamat_lengkap}
                  onChange={(e) => setFormData({ ...formData, alamat_lengkap: e.target.value })}
                  placeholder="Jl. Pantai Batu Bolong No. 88..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Coordinates Picker */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-500">Preset Lokasi Cepat:</span>
                {locationPresets.map((loc) => (
                  <button
                    key={loc.label}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        lokasi_area: loc.label,
                        latitude: loc.lat,
                        longitude: loc.lng,
                      })
                    }
                    className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-emerald-400 hover:bg-slate-800"
                  >
                    📍 {loc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-100 uppercase tracking-wider text-xs border-b border-slate-800 pb-1">
              4. Spesifikasi Fisik
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Luas Tanah (m²)</label>
                <input
                  type="number"
                  value={formData.luas_tanah}
                  onChange={(e) => setFormData({ ...formData, luas_tanah: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Luas Bangunan (m²)</label>
                <input
                  type="number"
                  value={formData.luas_bangunan}
                  onChange={(e) => setFormData({ ...formData, luas_bangunan: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Kamar Tidur</label>
                <input
                  type="number"
                  value={formData.kamar_tidur}
                  onChange={(e) => setFormData({ ...formData, kamar_tidur: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Kamar Mandi</label>
                <input
                  type="number"
                  value={formData.kamar_mandi}
                  onChange={(e) => setFormData({ ...formData, kamar_mandi: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-slate-400 mb-1">Furnished</label>
                <select
                  value={formData.furnished}
                  onChange={(e) => setFormData({ ...formData, furnished: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="FULL">FULL FURNISHED</option>
                  <option value="SEMI">SEMI FURNISHED</option>
                  <option value="NON">NON FURNISHED (KOSONG)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tahun Bangun</label>
                <input
                  type="number"
                  value={formData.tahun_bangun}
                  onChange={(e) => setFormData({ ...formData, tahun_bangun: parseInt(e.target.value) || 2023 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Komisi Broker / Agen</label>
                <input
                  type="text"
                  value={formData.komisi}
                  onChange={(e) => setFormData({ ...formData, komisi: e.target.value })}
                  placeholder="2.5%"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Owner Info & Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-100 uppercase tracking-wider text-xs border-b border-slate-800 pb-1">
              5. Data Pemilik (Owner) & Berkas Foto
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Nama Pemilik *</label>
                <input
                  type="text"
                  required
                  value={formData.nama_pemilik}
                  onChange={(e) => setFormData({ ...formData, nama_pemilik: e.target.value })}
                  placeholder="Budi Santoso"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">No. HP / WhatsApp Pemilik *</label>
                <input
                  type="text"
                  required
                  value={formData.no_hp}
                  onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                  placeholder="081234567890"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Link Google Drive Folder (Dokumen/Sertifikat)</label>
              <input
                type="url"
                value={formData.link_gdrive}
                onChange={(e) => setFormData({ ...formData, link_gdrive: e.target.value })}
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Photo List Adder */}
            <div className="space-y-2">
              <label className="block text-slate-400">Link Foto Properti (Unsplash / Cloudinary / URL)</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newPhotoInput}
                  onChange={(e) => setNewPhotoInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah
                </button>
              </div>

              {/* Photo Thumbnails */}
              {photosList.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {photosList.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-800 group">
                      <img src={url} alt={`Photo ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute inset-0 bg-rose-950/80 text-rose-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-slate-400 mb-1">Catatan Agen & Deskripsi Penjualan</label>
              <textarea
                rows={3}
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                placeholder="Fasilitas khusus, pemandangan, garasi, ROI sewa..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Form Actions */}
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
              className="px-5 py-2 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : listing ? "Simpan Perubahan" : "Buat Listing Properti"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
