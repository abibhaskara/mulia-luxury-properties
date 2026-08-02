"use client";

import { useState } from "react";
import { Listing } from "@/db/schema";
import {
  Search,
  Filter,
  MapPin,
  Bed,
  Bath,
  Maximize,
  ExternalLink,
  Phone,
  Folder,
  Tag,
  CheckCircle2,
  AlertCircle,
  Building,
  Home,
  Briefcase,
  Trees,
  Sparkles,
} from "lucide-react";
import PropertyDetailModal from "./PropertyDetailModal";

interface MarketplaceViewProps {
  listings: Listing[];
  onOpenMatchModal?: (listing: Listing) => void;
}

export default function MarketplaceView({ listings, onOpenMatchModal }: MarketplaceViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJenis, setSelectedJenis] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedSewaJual, setSelectedSewaJual] = useState("ALL");
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(0);
  const [activeListingModal, setActiveListingModal] = useState<Listing | null>(null);

  // Image slider active indices
  const [activeImageIndex, setActiveImageIndex] = useState<Record<string, number>>({});

  const handleNextImage = (id: string, total: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => ({
      ...prev,
      [id]: ((prev[id] || 0) + 1) % total,
    }));
  };

  const handlePrevImage = (id: string, total: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => ({
      ...prev,
      [id]: ((prev[id] || 0) - 1 + total) % total,
    }));
  };

  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      item.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lokasi_area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.alamat_lengkap && item.alamat_lengkap.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.catatan && item.catatan.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesJenis = selectedJenis === "ALL" || item.jenis === selectedJenis;
    const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;
    const matchesSewaJual = selectedSewaJual === "ALL" || item.sewa_jual === selectedSewaJual;
    const matchesPrice = maxPriceFilter === 0 || item.harga <= maxPriceFilter;

    return matchesSearch && matchesJenis && matchesStatus && matchesSewaJual && matchesPrice;
  });

  const getJenisIcon = (jenis: string | null) => {
    switch (jenis) {
      case "VILLA":
        return <Home className="w-3.5 h-3.5 text-amber-400" />;
      case "RUKO":
        return <Briefcase className="w-3.5 h-3.5 text-blue-400" />;
      case "TANAH":
        return <Trees className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Building className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `Rp ${(price / 1000000000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} M`;
    }
    return `Rp ${(price / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} Jt`;
  };

  return (
    <div className="space-y-6">
      {/* Banner / Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Katalog Properti Pilihan Harsalab Studio
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Temukan Properti Impian & Investasi Terbaik
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm">
            Koleksi eksklusif rumah, villa, ruko, dan tanah terverifikasi dengan legalitas resmi SHM & ROI menarik.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4 shadow-xl backdrop-blur">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari lokasi, kode, atau kata kunci..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Jenis Dropdown */}
          <div>
            <select
              value={selectedJenis}
              onChange={(e) => setSelectedJenis(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Jenis Properti</option>
              <option value="RUMAH">Rumah</option>
              <option value="VILLA">Villa</option>
              <option value="RUKO">Ruko</option>
              <option value="TANAH">Tanah</option>
            </select>
          </div>

          {/* Transaksi (Jual / Sewa) */}
          <div>
            <select
              value={selectedSewaJual}
              onChange={(e) => setSelectedSewaJual(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Sewa / Jual (Semua)</option>
              <option value="JUAL">Dijual Only</option>
              <option value="SEWA">Disewakan Only</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Status Unit</option>
              <option value="AVAILABLE">Tersedia (Available)</option>
              <option value="BOOKING">Dalam Booking</option>
              <option value="SOLD">Terjual (Sold)</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
          <div>
            Menampilkan <span className="font-bold text-emerald-400">{filteredListings.length}</span> dari {listings.length} unit properti
          </div>
          {(searchTerm || selectedJenis !== "ALL" || selectedStatus !== "ALL" || selectedSewaJual !== "ALL") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedJenis("ALL");
                setSelectedStatus("ALL");
                setSelectedSewaJual("ALL");
              }}
              className="text-emerald-400 hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Property Cards Grid */}
      {filteredListings.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-12 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">Tidak Ada Properti yang Sesuai</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau reset filter untuk melihat properti lainnya.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((item) => {
            const photos = Array.isArray(item.link_foto) && item.link_foto.length > 0
              ? item.link_foto
              : ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"];

            const currentIdx = activeImageIndex[item.id] || 0;

            return (
              <div
                key={item.id}
                onClick={() => setActiveListingModal(item)}
                className="group cursor-pointer bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col"
              >
                {/* Photo Carousel Area */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                  <img
                    src={photos[currentIdx]}
                    alt={item.kode}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Badges Overlay */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-950/80 backdrop-blur text-white border border-slate-700">
                      {getJenisIcon(item.jenis)}
                      {item.jenis}
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-md ${
                        item.status === "AVAILABLE"
                          ? "bg-emerald-500 text-slate-950"
                          : item.status === "BOOKING"
                          ? "bg-amber-500 text-slate-950"
                          : "bg-rose-500 text-white"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Transaksi Badge Bottom Left */}
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-950/90 text-emerald-300 border border-emerald-500/40">
                      {item.sewa_jual || "JUAL"}
                    </span>
                    {item.sertifikat && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-950/90 text-slate-300 border border-slate-700">
                        {item.sertifikat}
                      </span>
                    )}
                  </div>

                  {/* Photo Navigation Arrows if > 1 photo */}
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={(e) => handlePrevImage(item.id, photos.length, e)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/70 text-white flex items-center justify-center hover:bg-slate-900"
                      >
                        ‹
                      </button>
                      <button
                        onClick={(e) => handleNextImage(item.id, photos.length, e)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/70 text-white flex items-center justify-center hover:bg-slate-900"
                      >
                        ›
                      </button>
                      <div className="absolute bottom-2 right-3 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-slate-300">
                        {currentIdx + 1}/{photos.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Card Content Body */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Price and Code */}
                    <div className="flex items-baseline justify-between">
                      <div className="text-xl font-black text-emerald-400">
                        {formatPrice(item.harga)}
                      </div>
                      <div className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {item.kode}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="line-clamp-1">{item.lokasi_area}</span>
                    </div>

                    {/* Specs Row */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 my-3 text-xs text-slate-300">
                      <div className="flex items-center gap-1">
                        <Maximize className="w-3.5 h-3.5 text-slate-400" />
                        <span>LT: {item.luas_tanah || 0}m²</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>LB: {item.luas_bangunan || 0}m²</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.kamar_tidur || 0} KT</span>
                      </div>
                    </div>

                    {/* Notes Snippet */}
                    {item.catatan && (
                      <p className="text-xs text-slate-400 line-clamp-2 italic">
                        "{item.catatan}"
                      </p>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 flex items-center justify-between border-t border-slate-800/60">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveListingModal(item);
                      }}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      Lihat Detail & Map ➔
                    </button>

                    {onOpenMatchModal && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenMatchModal(item);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        Match Client
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Property Detail Modal */}
      {activeListingModal && (
        <PropertyDetailModal
          listing={activeListingModal}
          onClose={() => setActiveListingModal(null)}
        />
      )}
    </div>
  );
}
