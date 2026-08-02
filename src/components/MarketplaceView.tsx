"use client";

import { useState } from "react";
import { Listing } from "@/db/schema";

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



  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `Rp ${(price / 1000000000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} M`;
    }
    return `Rp ${(price / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} Jt`;
  };

  return (
    <div className="space-y-6">
      {/* Banner / Hero Header */}
      <div className="border border-black p-6 sm:p-8 bg-white">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2 py-0.5 border border-black text-black text-xs font-bold uppercase">
            Katalog Properti
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-black tracking-tight leading-tight">
            Temukan Properti Impian & Investasi Terbaik
          </h2>
          <p className="text-black text-xs sm:text-sm">
            Koleksi eksklusif rumah, villa, ruko, dan tanah terverifikasi dengan legalitas resmi SHM & ROI menarik.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-black p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <input
              type="text"
              placeholder="Cari lokasi, kode, atau kata kunci..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-black text-sm text-black placeholder-gray-500 focus:outline-none"
            />
          </div>

          {/* Jenis Dropdown */}
          <div>
            <select
              value={selectedJenis}
              onChange={(e) => setSelectedJenis(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-black text-sm text-black focus:outline-none"
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
              className="w-full px-3 py-2 bg-white border border-black text-sm text-black focus:outline-none"
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
              className="w-full px-3 py-2 bg-white border border-black text-sm text-black focus:outline-none"
            >
              <option value="ALL">Semua Status Unit</option>
              <option value="AVAILABLE">Tersedia (Available)</option>
              <option value="BOOKING">Dalam Booking</option>
              <option value="SOLD">Terjual (Sold)</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-black border-t border-black pt-3">
          <div>
            Menampilkan <span className="font-bold">{filteredListings.length}</span> dari {listings.length} unit properti
          </div>
          {(searchTerm || selectedJenis !== "ALL" || selectedStatus !== "ALL" || selectedSewaJual !== "ALL") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedJenis("ALL");
                setSelectedStatus("ALL");
                setSelectedSewaJual("ALL");
              }}
              className="text-black hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Property Cards Grid */}
      {filteredListings.length === 0 ? (
        <div className="bg-white border border-black p-12 text-center space-y-3">
          <h3 className="text-lg font-bold text-black">Tidak Ada Properti yang Sesuai</h3>
          <p className="text-black text-xs max-w-sm mx-auto">
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
                className="group cursor-pointer bg-white border border-black flex flex-col hover:bg-gray-50"
              >
                {/* Photo Carousel Area */}
                <div className="relative h-56 w-full overflow-hidden bg-white border-b border-black">
                  <img
                    src={photos[currentIdx]}
                    alt={item.kode}
                    className="w-full h-full object-cover grayscale"
                  />

                  {/* Top Badges Overlay */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                    <span className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold bg-white text-black border border-black">
                      {item.jenis}
                    </span>

                    <span
                      className={`px-2 py-0.5 text-xs font-bold border border-black ${
                        item.status === "AVAILABLE"
                          ? "bg-white text-black"
                          : item.status === "BOOKING"
                          ? "bg-gray-200 text-black"
                          : "bg-black text-white"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Transaksi Badge Bottom Left */}
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-white text-black border border-black">
                      {item.sewa_jual || "JUAL"}
                    </span>
                    {item.sertifikat && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-white text-black border border-black">
                        {item.sertifikat}
                      </span>
                    )}
                  </div>

                  {/* Photo Navigation Arrows if > 1 photo */}
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={(e) => handlePrevImage(item.id, photos.length, e)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white text-black border border-black flex items-center justify-center hover:bg-gray-200"
                      >
                        ‹
                      </button>
                      <button
                        onClick={(e) => handleNextImage(item.id, photos.length, e)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white text-black border border-black flex items-center justify-center hover:bg-gray-200"
                      >
                        ›
                      </button>
                      <div className="absolute bottom-2 right-3 px-2 py-0.5 bg-white text-black border border-black text-[10px] font-bold">
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
                      <div className="text-xl font-bold text-black">
                        {formatPrice(item.harga)}
                      </div>
                      <div className="text-xs font-mono text-black bg-white px-2 py-0.5 border border-black">
                        {item.kode}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs text-black font-medium mt-1">
                      <span className="line-clamp-1">{item.lokasi_area}</span>
                    </div>

                    {/* Specs Row */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-black my-3 text-xs text-black">
                      <div className="flex items-center gap-1">
                        <span>LT: {item.luas_tanah || 0}m²</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>LB: {item.luas_bangunan || 0}m²</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{item.kamar_tidur || 0} KT</span>
                      </div>
                    </div>

                    {/* Notes Snippet */}
                    {item.catatan && (
                      <p className="text-xs text-black line-clamp-2 italic">
                        "{item.catatan}"
                      </p>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 flex items-center justify-between border-t border-black">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveListingModal(item);
                      }}
                      className="text-xs font-bold text-black hover:underline flex items-center gap-1"
                    >
                      Lihat Detail & Map
                    </button>

                    {onOpenMatchModal && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenMatchModal(item);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold bg-white text-black border border-black hover:bg-gray-100 flex items-center gap-1"
                      >
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
