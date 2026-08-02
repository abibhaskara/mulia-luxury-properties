"use client";

import { useState, useEffect, useRef } from "react";

export interface LocationSearchResult {
  display_name: string;
  lokasi_area: string;
  alamat_lengkap: string;
  latitude: number;
  longitude: number;
}

interface LocationSearchBarProps {
  onSelectLocation: (location: LocationSearchResult) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

export default function LocationSearchBar({
  onSelectLocation,
  placeholder = "Ketik nama jalan, area, atau tempat (contoh: Jl. Batu Bolong Canggu, Pondok Indah)...",
  initialValue = "",
  className = "",
}: LocationSearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Nominatim Search
  useEffect(() => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&addressdetails=1&limit=6&countrycodes=id`,
          {
            headers: {
              "Accept-Language": "id,en",
            },
          }
        );
        const data = await res.json();
        setSuggestions(data || []);
        setIsOpen(true);
      } catch (err) {
        console.error("Geocoding search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Format Nominatim item to clean area name and full address
  const formatLocationItem = (item: any): LocationSearchResult => {
    const addr = item.address || {};
    const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || "";
    const village = addr.village || addr.suburb || addr.quarter || "";
    const district = addr.city_district || addr.district || addr.suburb || "";
    const city = addr.city || addr.regency || addr.town || addr.county || "";
    const state = addr.state || "";

    // Area summary format: "Canggu, Badung, Bali" or "Pondok Indah, Jakarta Selatan"
    const areaParts = [village || district || road, city || state].filter(Boolean);
    const lokasi_area = areaParts.length > 0 ? areaParts.join(", ") : item.display_name.split(",")[0];

    const latitude = parseFloat(item.lat);
    const longitude = parseFloat(item.lon);

    return {
      display_name: item.display_name,
      lokasi_area,
      alamat_lengkap: item.display_name,
      latitude,
      longitude,
    };
  };

  const handleSelect = (item: any) => {
    const locationData = formatLocationItem(item);
    setQuery(locationData.lokasi_area);
    setIsOpen(false);
    onSelectLocation(locationData);
  };

  // Browser GPS Location Handler
  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung deteksi lokasi Geolocation.");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "id,en",
              },
            }
          );
          const data = await res.json();
          const locationData = formatLocationItem(data);
          setQuery(locationData.lokasi_area);
          onSelectLocation(locationData);
        } catch (e) {
          onSelectLocation({
            display_name: `Lat: ${lat.toFixed(4)}, Lng: ${lon.toFixed(4)}`,
            lokasi_area: "Lokasi GPS",
            alamat_lengkap: `Lat: ${lat}, Lng: ${lon}`,
            latitude: lat,
            longitude: lon,
          });
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        console.error(error);
        alert("Gagal mengambil lokasi GPS. Pastikan izin akses lokasi aktif.");
        setGpsLoading(false);
      }
    );
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true);
            }}
            placeholder={placeholder}
            className="w-full px-3 py-2 bg-white border border-black text-xs text-black placeholder-gray-500 focus:outline-none pr-8"
          />
          {isLoading && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-black animate-spin">
              ⌛
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleGPSLocation}
          disabled={gpsLoading}
          className="px-3 py-2 bg-white text-black border border-black hover:bg-gray-100 font-bold text-xs flex items-center gap-1 shrink-0"
          title="Deteksi Lokasi GPS Anda Saat Ini"
        >
          <span>🎯</span>
          <span className="hidden sm:inline">
            {gpsLoading ? "Mencari GPS..." : "GPS Saya"}
          </span>
        </button>
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-black shadow-lg z-50 max-h-60 overflow-y-auto divide-y divide-gray-200">
          {suggestions.map((item, index) => {
            const loc = formatLocationItem(item);
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3 py-2 hover:bg-black hover:text-white transition text-xs flex items-start gap-2 group"
              >
                <span className="text-sm shrink-0 pt-0.5">📍</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold truncate text-black group-hover:text-white">
                    {loc.lokasi_area}
                  </div>
                  <div className="text-[11px] text-gray-700 group-hover:text-gray-200 line-clamp-1">
                    {item.display_name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {isOpen && !isLoading && suggestions.length === 0 && query.trim().length >= 3 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-black shadow-lg z-50 p-3 text-xs text-black text-center font-bold">
          Lokasi tidak ditemukan. Coba ketik kata kunci lain.
        </div>
      )}
    </div>
  );
}
