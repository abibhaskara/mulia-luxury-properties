"use client";

import { useState } from "react";
import { Listing } from "@/db/schema";
import LocationPickerMap from "./LocationPickerMap";


interface PropertyFormModalProps {
  listing?: Listing | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PropertyFormModal({ listing, onClose, onSuccess }: PropertyFormModalProps) {
  const [formData, setFormData] = useState({
    id: listing?.id || "",
    kode: listing?.kode || `HS-RMH-${Math.floor(100 + Math.random() * 900)}`,
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
  const [isUploading, setIsUploading] = useState(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ backgroundColor: "rgba(17,17,17,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="relative w-full max-w-3xl overflow-hidden my-8 max-h-[90vh] flex flex-col rounded-2xl border" style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: "#ebebeb" }}>
          <h3 className="text-base font-bold" style={{ color: "#111" }}>
            {listing ? "Edit Properti" : "Tambah Listing Properti Baru"}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 text-gray-400 hover:text-gray-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {errorMessage && (
            <div className="p-3 rounded-xl text-sm font-medium" style={{ backgroundColor: "#fef2f2", color: "#ef4444", border: "1px solid #fee2e2" }}>
              {errorMessage}
            </div>
          )}

          {/* Basic Property Info */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-[11px] pb-2 border-b" style={{ color: "#9ca3af", borderColor: "#ebebeb" }}>
              1. Identitas & Informasi Utama
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold" style={{ color: "#374151" }}>
                    Kode Listing <span className="text-[10px] text-gray-400 font-normal">(Otomatis)</span> *
                  </label>
                  {!listing && (
                    <button
                      type="button"
                      onClick={() => {
                        const typePrefix = formData.jenis === "RUMAH" ? "RMH" : formData.jenis === "VILLA" ? "VIL" : formData.jenis === "RUKO" ? "RKO" : "TNH";
                        const randomNum = Math.floor(100 + Math.random() * 900);
                        setFormData({ ...formData, kode: `HS-${typePrefix}-${randomNum}` });
                      }}
                      className="text-[10px] font-semibold text-blue-600 hover:underline"
                    >
                      ↻ Acak Ulang
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={formData.kode}
                  onChange={(e) => setFormData({ ...formData, kode: e.target.value.toUpperCase() })}
                  placeholder="Contoh: HS-RMH-008"
                  className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-gray-200 font-mono font-bold"
                  style={{ borderColor: "#ebebeb", backgroundColor: "#f9f9f9", color: "#111" }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#374151" }}>Jenis Properti</label>
                <select
                  value={formData.jenis}
                  onChange={(e) => {
                    const newJenis = e.target.value;
                    const typePrefix = newJenis === "RUMAH" ? "RMH" : newJenis === "VILLA" ? "VIL" : newJenis === "RUKO" ? "RKO" : "TNH";
                    const currentNum = formData.kode.split("-")[2] || Math.floor(100 + Math.random() * 900);
                    const newKode = !listing ? `HS-${typePrefix}-${currentNum}` : formData.kode;
                    setFormData({ ...formData, jenis: newJenis, kode: newKode });
                  }}
                  className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-gray-200"
                  style={{ borderColor: "#ebebeb", backgroundColor: "#f9f9f9", color: "#111" }}
                >
                  <option value="RUMAH">Rumah</option>
                  <option value="VILLA">Villa</option>
                  <option value="RUKO">Ruko</option>
                  <option value="TANAH">Tanah</option>
                </select>
              </div>

              <div>
                <label className="block text-black font-bold mb-1">Status Unit</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-black text-black focus:outline-none"
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
            <h4 className="font-bold text-black uppercase tracking-wider text-xs border-b border-black pb-1">
              2. Harga & Legalitas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-black font-bold mb-1">Harga (Rupiah) *</label>
                <input
                  type="number"
                  required
                  value={formData.harga}
                  onChange={(e) => setFormData({ ...formData, harga: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white border border-black text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-black font-bold mb-1">Status Transaksi</label>
                <select
                  value={formData.sewa_jual}
                  onChange={(e) => setFormData({ ...formData, sewa_jual: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-black text-black focus:outline-none"
                >
                  <option value="JUAL">JUAL</option>
                  <option value="SEWA">SEWA</option>
                </select>
              </div>

              <div>
                <label className="block text-black font-bold mb-1">Sertifikat Legalitas</label>
                <select
                  value={formData.sertifikat}
                  onChange={(e) => setFormData({ ...formData, sertifikat: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-black text-black focus:outline-none"
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
            <h4 className="font-bold text-black uppercase tracking-wider text-xs border-b border-black pb-1">
              3. Lokasi & Peta Geolocation (OpenMap Search)
            </h4>
            <div className="space-y-4">
              {/* Interactive OpenMap Search & Location Picker */}
              <LocationPickerMap
                latitude={formData.latitude}
                longitude={formData.longitude}
                initialArea={formData.lokasi_area}
                onLocationChange={(locData) => {
                  setFormData((prev) => ({
                    ...prev,
                    latitude: locData.latitude,
                    longitude: locData.longitude,
                    lokasi_area: locData.lokasi_area || prev.lokasi_area,
                    alamat_lengkap: locData.alamat_lengkap || prev.alamat_lengkap,
                  }));
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-black font-bold mb-1">Lokasi Area / Kota *</label>
                  <input
                    type="text"
                    required
                    value={formData.lokasi_area}
                    onChange={(e) => setFormData({ ...formData, lokasi_area: e.target.value })}
                    placeholder="Contoh: Canggu, Bali atau Jakarta Selatan"
                    className="w-full px-3 py-2 bg-white border border-black text-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-black font-bold mb-1">Alamat Lengkap</label>
                  <input
                    type="text"
                    value={formData.alamat_lengkap}
                    onChange={(e) => setFormData({ ...formData, alamat_lengkap: e.target.value })}
                    placeholder="Jl. Pantai Batu Bolong No. 88..."
                    className="w-full px-3 py-2 bg-white border border-black text-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Coordinates Display */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-bold mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-black text-black focus:outline-none font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-black font-bold mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-black text-black focus:outline-none font-mono text-xs"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-black/20">
                <span className="text-[11px] text-black">Preset Lokasi Cepat:</span>
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
                    className="px-2 py-0.5 bg-white border border-black text-[10px] text-black hover:bg-gray-100"
                  >
                    📍 {loc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>


          {/* Specifications */}
          <div className="space-y-3">
            <h4 className="font-bold text-black uppercase tracking-wider text-xs border-b border-black pb-1">
              4. Spesifikasi Fisik
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-black font-bold mb-1">Luas Tanah (m²)</label>
                <input
                  type="number"
                  value={formData.luas_tanah}
                  onChange={(e) => setFormData({ ...formData, luas_tanah: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white border border-black text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-black font-bold mb-1">Luas Bangunan (m²)</label>
                <input
                  type="number"
                  value={formData.luas_bangunan}
                  onChange={(e) => setFormData({ ...formData, luas_bangunan: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white border border-black text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-black font-bold mb-1">Kamar Tidur</label>
                <input
                  type="number"
                  value={formData.kamar_tidur}
                  onChange={(e) => setFormData({ ...formData, kamar_tidur: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white border border-black text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-black font-bold mb-1">Kamar Mandi</label>
                <input
                  type="number"
                  value={formData.kamar_mandi}
                  onChange={(e) => setFormData({ ...formData, kamar_mandi: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white border border-black text-black focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-black font-bold mb-1">Furnished</label>
                <select
                  value={formData.furnished}
                  onChange={(e) => setFormData({ ...formData, furnished: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-black text-black focus:outline-none"
                >
                  <option value="FULL">FULL FURNISHED</option>
                  <option value="SEMI">SEMI FURNISHED</option>
                  <option value="NON">NON FURNISHED (KOSONG)</option>
                </select>
              </div>

              <div>
                <label className="block text-black font-bold mb-1">Tahun Bangun</label>
                <input
                  type="number"
                  value={formData.tahun_bangun}
                  onChange={(e) => setFormData({ ...formData, tahun_bangun: parseInt(e.target.value) || 2023 })}
                  className="w-full px-3 py-2 bg-white border border-black text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-black font-bold mb-1">Komisi Broker / Agen</label>
                <input
                  type="text"
                  value={formData.komisi}
                  onChange={(e) => setFormData({ ...formData, komisi: e.target.value })}
                  placeholder="2.5%"
                  className="w-full px-3 py-2 bg-white border border-black text-black focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Owner Info & Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-black uppercase tracking-wider text-xs border-b border-black pb-1">
              5. Data Pemilik (Owner) & Berkas Foto
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-black font-bold mb-1">Nama Pemilik *</label>
                <input
                  type="text"
                  required
                  value={formData.nama_pemilik}
                  onChange={(e) => setFormData({ ...formData, nama_pemilik: e.target.value })}
                  placeholder="Budi Santoso"
                  className="w-full px-3 py-2 bg-white border border-black text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-black font-bold mb-1">No. HP / WhatsApp Pemilik *</label>
                <input
                  type="text"
                  required
                  value={formData.no_hp}
                  onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                  placeholder="081234567890"
                  className="w-full px-3 py-2 bg-white border border-black text-black focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-black font-bold mb-1">Link Google Drive Folder (Dokumen/Sertifikat)</label>
              <input
                type="url"
                value={formData.link_gdrive}
                onChange={(e) => setFormData({ ...formData, link_gdrive: e.target.value })}
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-2 bg-white border border-black text-black focus:outline-none"
              />
            </div>

            {/* Photo Upload & URL Adder */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold" style={{ color: "#374151" }}>
                Foto Properti <span className="text-[10px] text-gray-400 font-normal">(Upload File atau Paste URL)</span>
              </label>

              {/* Upload Dropzone / Button & URL Input Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: File Upload Button */}
                <div className="relative border-2 border-dashed rounded-xl p-3 text-center flex flex-col items-center justify-center hover:bg-gray-50 transition cursor-pointer" style={{ borderColor: "#d1d5db", backgroundColor: "#f9f9f9" }}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      setIsUploading(true);

                      const uploadPromises = Array.from(files).map(async (file) => {
                        try {
                          const body = new FormData();
                          body.append("file", file);
                          const res = await fetch("/api/upload", { method: "POST", body });
                          const json = await res.json();
                          if (json.success && json.url) {
                            return json.url;
                          }
                        } catch (err) {
                          console.warn("Cloudinary upload fallback to Data URL", err);
                        }
                        // Fallback to Data URL if Cloudinary is not yet configured
                        return new Promise<string>((resolve) => {
                          const reader = new FileReader();
                          reader.onload = () => resolve(reader.result as string);
                          reader.readAsDataURL(file);
                        });
                      });

                      try {
                        const uploadedUrls = await Promise.all(uploadPromises);
                        setPhotosList((prev) => [...prev, ...uploadedUrls]);
                      } catch {
                        alert("Gagal mengunggah foto.");
                      } finally {
                        setIsUploading(false);
                        e.target.value = "";
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>{isUploading ? "Mengunggah ke Cloudinary..." : "Upload Gambar ke Cloudinary"}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP (Otomatis masuk folder harsalab-properties)</span>
                </div>

                {/* Option 2: URL Input */}
                <div className="flex flex-col justify-center space-y-1.5 p-3 rounded-xl border" style={{ borderColor: "#ebebeb", backgroundColor: "#ffffff" }}>
                  <span className="text-[11px] font-semibold text-gray-600">Atau Tambah via Link URL (Unsplash / Cloudinary):</span>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newPhotoInput}
                      onChange={(e) => setNewPhotoInput(e.target.value)}
                      placeholder="https://res.cloudinary.com/..."
                      className="flex-1 px-3 py-1.5 rounded-lg border text-xs focus:outline-none"
                      style={{ borderColor: "#ebebeb", backgroundColor: "#f9f9f9", color: "#111" }}
                    />
                    <button
                      type="button"
                      onClick={handleAddPhoto}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      style={{ backgroundColor: "#111", color: "#fff" }}
                    >
                      + URL
                    </button>
                  </div>
                </div>
              </div>

              {/* Photo Thumbnails Gallery */}
              {photosList.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] text-gray-400 font-medium">{photosList.length} Foto Terpasang:</span>
                  <div className="flex flex-wrap gap-2.5">
                    {photosList.map((url, idx) => {
                      const isCloudinary = url.includes("cloudinary.com");
                      const isDataUrl = url.startsWith("data:");
                      return (
                        <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border group bg-gray-100 shrink-0" style={{ borderColor: "#ebebeb" }}>
                          <img src={url} alt={`Photo ${idx}`} className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 text-[8px] font-bold px-1 rounded bg-black/60 text-white uppercase">
                            {isCloudinary ? "CLOUDINARY" : isDataUrl ? "FILE" : "URL"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute inset-0 bg-red-600/80 text-white font-bold text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            Hapus
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#374151" }}>Catatan Agen & Deskripsi Penjualan</label>
              <textarea
                rows={3}
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                placeholder="Fasilitas khusus, pemandangan, garasi, ROI sewa..."
                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-gray-200"
                style={{ borderColor: "#ebebeb", backgroundColor: "#f9f9f9", color: "#111" }}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-black flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white text-black border border-black hover:bg-gray-100 font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-black text-white font-bold disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : listing ? "Simpan Perubahan" : "Buat Listing Properti"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
