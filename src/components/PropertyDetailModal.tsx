"use client";

import { Listing } from "@/db/schema";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

interface PropertyDetailModalProps {
  listing: Listing;
  onClose: () => void;
}

export default function PropertyDetailModal({ listing, onClose }: PropertyDetailModalProps) {
  const photos = Array.isArray(listing.link_foto) && listing.link_foto.length > 0
    ? listing.link_foto
    : ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80"];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const whatsappUrl = `https://wa.me/${listing.no_hp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Halo ${listing.nama_pemilik}, saya ingin menanyakan lebih lanjut mengenai unit properti ${listing.kode} di ${listing.lokasi_area}.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ backgroundColor: "rgba(17,17,17,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="relative w-full max-w-4xl overflow-hidden my-8 max-h-[90vh] flex flex-col rounded-2xl border" style={{ backgroundColor: "#ffffff", borderColor: "#ebebeb" }}>
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: "#ebebeb" }}>
          <div className="flex items-center gap-3">
            <span
              className="px-2.5 py-1 text-xs font-bold rounded-lg"
              style={{ backgroundColor: "#f5f5f5", color: "#6b7280" }}
            >
              {listing.kode}
            </span>
            <h3 className="text-base font-bold" style={{ color: "#111" }}>
              {listing.jenis} · {listing.lokasi_area}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 text-gray-400 hover:text-gray-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Photo Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 h-72 bg-white border border-black">
              <img
                src={photos[0]}
                alt={listing.kode}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-rows-2 gap-3 h-72">
              {photos[1] ? (
                <div className="bg-white border border-black overflow-hidden">
                  <img
                    src={photos[1]}
                    alt={listing.kode}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="bg-white border border-black flex items-center justify-center text-black text-xs font-bold">
                  Foto Tambahan
                </div>
              )}
              {photos[2] ? (
                <div className="bg-white border border-black overflow-hidden">
                  <img
                    src={photos[2]}
                    alt={listing.kode}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="bg-white border border-black flex items-center justify-center text-black text-xs font-bold">
                  Harsalab Studio
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Key Summary Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-black">
            <div>
              <div className="text-xs text-black font-bold">Harga Penawaran ({listing.sewa_jual || "JUAL"})</div>
              <div className="text-2xl sm:text-3xl font-bold text-black">
                {formatPrice(listing.harga)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-white border border-black text-xs font-bold text-black">
                Status: {listing.status}
              </span>
              <span className="px-3 py-1.5 bg-white border border-black text-xs font-bold text-black">
                Komisi Agen: {listing.komisi || "2.5%"}
              </span>
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-black uppercase tracking-wider">Spesifikasi Properti</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white border border-black text-xs">
              <div>
                <div className="text-black">Luas Tanah (LT)</div>
                <div className="font-bold text-black text-sm mt-0.5">{listing.luas_tanah || 0} m²</div>
              </div>
              <div>
                <div className="text-black">Luas Bangunan (LB)</div>
                <div className="font-bold text-black text-sm mt-0.5">{listing.luas_bangunan || 0} m²</div>
              </div>
              <div>
                <div className="text-black">Kamar Tidur (KT)</div>
                <div className="font-bold text-black text-sm mt-0.5">{listing.kamar_tidur || 0} Kamar</div>
              </div>
              <div>
                <div className="text-black">Kamar Mandi (KM)</div>
                <div className="font-bold text-black text-sm mt-0.5">{listing.kamar_mandi || 0} Kamar</div>
              </div>
              <div>
                <div className="text-black">Furnished</div>
                <div className="font-bold text-black text-sm mt-0.5">{listing.furnished || "NON"}</div>
              </div>
              <div>
                <div className="text-black">Sertifikat</div>
                <div className="font-bold text-black text-sm mt-0.5">{listing.sertifikat || "SHM"}</div>
              </div>
              <div>
                <div className="text-black">Tahun Bangun</div>
                <div className="font-bold text-black text-sm mt-0.5">{listing.tahun_bangun || "-"}</div>
              </div>
              <div>
                <div className="text-black">Transaksi</div>
                <div className="font-bold text-black text-sm mt-0.5">{listing.sewa_jual || "JUAL"}</div>
              </div>
            </div>
          </div>

          {/* Location & Alamat */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-black uppercase tracking-wider">Lokasi & Alamat Lengkap</h4>
            <div className="p-4 bg-white border border-black space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-black">
                <span>📍 {listing.lokasi_area}</span>
              </div>
              <p className="text-black">{listing.alamat_lengkap || "Alamat lengkap tersedia untuk calon pembeli terverifikasi."}</p>
            </div>

            {/* Interactive Leaflet Map */}
            {listing.latitude && listing.longitude && (
              <div className="pt-2">
                <MapComponent
                  listings={[listing]}
                  selectedListingId={listing.id}
                  height="260px"
                  center={[listing.latitude, listing.longitude]}
                  zoom={14}
                />
              </div>
            )}
          </div>

          {/* Owner & Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-black space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-black text-sm">
                Informasi Pemilik (Owner)
              </div>
              <div className="space-y-1 text-black">
                <div>Nama: <span className="font-bold text-black">{listing.nama_pemilik}</span></div>
                <div>No. Telepon/WA: <span className="font-bold text-black">{listing.no_hp}</span></div>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-black text-white font-bold text-xs"
              >
                [Hubungi via WhatsApp Owner]
              </a>
            </div>

            <div className="p-4 bg-white border border-black space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-black text-sm">
                Berkas & Dokumen Tambahan
              </div>
              <p className="text-black">
                {listing.link_gdrive ? "Folder Google Drive berisi foto resolusi tinggi, denah lantai, dan salinan sertifikat." : "Belum ada link Google Drive terlampir."}
              </p>
              {listing.link_gdrive && (
                <a
                  href={listing.link_gdrive}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white text-black font-bold text-xs border border-black hover:bg-gray-100"
                >
                  [Buka Google Drive Folder]
                </a>
              )}
            </div>
          </div>

          {/* Catatan / Description */}
          {listing.catatan && (
            <div className="p-4 bg-white border border-black space-y-1 text-xs">
              <div className="font-bold text-black">Catatan Agen & Deskripsi Unit:</div>
              <p className="text-black leading-relaxed">{listing.catatan}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black bg-white flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-white border border-black text-black hover:bg-gray-100"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
