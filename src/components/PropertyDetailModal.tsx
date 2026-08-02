"use client";

import { Listing } from "@/db/schema";
import {
  X,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Phone,
  Folder,
  Calendar,
  ShieldCheck,
  Building,
  User,
  DollarSign,
  Share2,
  ExternalLink,
} from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {listing.kode}
            </span>
            <h3 className="text-lg font-bold text-white">
              {listing.jenis} - {listing.lokasi_area}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Main Photo Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 h-72 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={photos[0]}
                alt={listing.kode}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-rows-2 gap-3 h-72">
              {photos[1] ? (
                <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img
                    src={photos[1]}
                    alt={listing.kode}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 text-xs">
                  Foto Tambahan
                </div>
              )}
              {photos[2] ? (
                <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img
                    src={photos[2]}
                    alt={listing.kode}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 text-xs">
                  Harsalab Studio
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Key Summary Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/20">
            <div>
              <div className="text-xs text-slate-400 font-medium">Harga Penawaran ({listing.sewa_jual || "JUAL"})</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                {formatPrice(listing.harga)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-bold text-slate-200">
                Status: <span className="text-emerald-400">{listing.status}</span>
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-bold text-slate-200">
                Komisi Agen: <span className="text-amber-400">{listing.komisi || "2.5%"}</span>
              </span>
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Spesifikasi Properti</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div>
                <div className="text-slate-400">Luas Tanah (LT)</div>
                <div className="font-bold text-white text-sm mt-0.5">{listing.luas_tanah || 0} m²</div>
              </div>
              <div>
                <div className="text-slate-400">Luas Bangunan (LB)</div>
                <div className="font-bold text-white text-sm mt-0.5">{listing.luas_bangunan || 0} m²</div>
              </div>
              <div>
                <div className="text-slate-400">Kamar Tidur (KT)</div>
                <div className="font-bold text-white text-sm mt-0.5">{listing.kamar_tidur || 0} Kamar</div>
              </div>
              <div>
                <div className="text-slate-400">Kamar Mandi (KM)</div>
                <div className="font-bold text-white text-sm mt-0.5">{listing.kamar_mandi || 0} Kamar</div>
              </div>
              <div>
                <div className="text-slate-400">Furnished</div>
                <div className="font-bold text-white text-sm mt-0.5">{listing.furnished || "NON"}</div>
              </div>
              <div>
                <div className="text-slate-400">Sertifikat</div>
                <div className="font-bold text-white text-sm mt-0.5">{listing.sertifikat || "SHM"}</div>
              </div>
              <div>
                <div className="text-slate-400">Tahun Bangun</div>
                <div className="font-bold text-white text-sm mt-0.5">{listing.tahun_bangun || "-"}</div>
              </div>
              <div>
                <div className="text-slate-400">Transaksi</div>
                <div className="font-bold text-white text-sm mt-0.5">{listing.sewa_jual || "JUAL"}</div>
              </div>
            </div>
          </div>

          {/* Location & Alamat */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Lokasi & Alamat Lengkap</h4>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <MapPin className="w-4 h-4" />
                <span>{listing.lokasi_area}</span>
              </div>
              <p className="text-slate-300 pl-5">{listing.alamat_lengkap || "Alamat lengkap tersedia untuk calon pembeli terverifikasi."}</p>
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
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
                <User className="w-4 h-4 text-emerald-400" />
                Informasi Pemilik (Owner)
              </div>
              <div className="space-y-1 text-slate-300">
                <div>Nama: <span className="font-semibold text-white">{listing.nama_pemilik}</span></div>
                <div>No. Telepon/WA: <span className="font-semibold text-white">{listing.no_hp}</span></div>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition"
              >
                <Phone className="w-3.5 h-3.5" />
                Hubungi via WhatsApp Owner
              </a>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
                <Folder className="w-4 h-4 text-emerald-400" />
                Berkas & Dokumen Tambahan
              </div>
              <p className="text-slate-400">
                {listing.link_gdrive ? "Folder Google Drive berisi foto resolusi tinggi, denah lantai, dan salinan sertifikat." : "Belum ada link Google Drive terlampir."}
              </p>
              {listing.link_gdrive && (
                <a
                  href={listing.link_gdrive}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs transition border border-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Google Drive Folder
                </a>
              )}
            </div>
          </div>

          {/* Catatan / Description */}
          {listing.catatan && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <div className="font-bold text-slate-300">Catatan Agen & Deskripsi Unit:</div>
              <p className="text-slate-400 leading-relaxed">{listing.catatan}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
