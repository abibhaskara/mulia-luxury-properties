"use client";

import { useEffect, useRef, useState } from "react";
import { Listing } from "@/db/schema";
import LocationSearchBar, { LocationSearchResult } from "./LocationSearchBar";

interface MapComponentProps {
  listings: Listing[];
  selectedListingId?: string | null;
  onSelectListing?: (listing: Listing) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
  showSearchBar?: boolean;
}

export default function MapComponent({
  listings,
  selectedListingId,
  onSelectListing,
  height = "450px",
  center = [-8.6500, 115.1381], // Default Bali / Indonesia center
  zoom = 10,
  showSearchBar = true,
}: MapComponentProps) {
  const [mounted, setMounted] = useState(false);
  const [L, setL] = useState<any>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    import("leaflet").then((leaflet) => {
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
      setL(leaflet);
    });
  }, []);

  useEffect(() => {
    if (!mounted || !L) return;

    const mapElement = document.getElementById("leaflet-map-container");
    if (!mapElement) return;

    if ((mapElement as any)._leaflet_map) {
      (mapElement as any)._leaflet_map.remove();
    }

    const validListings = listings.filter((l) => l.latitude && l.longitude);

    let initialCenter: [number, number] = center;
    if (validListings.length > 0) {
      initialCenter = [validListings[0].latitude!, validListings[0].longitude!];
    }

    if (selectedListingId) {
      const selected = validListings.find((l) => l.id === selectedListingId);
      if (selected && selected.latitude && selected.longitude) {
        initialCenter = [selected.latitude, selected.longitude];
      }
    }

    const map = L.map("leaflet-map-container").setView(initialCenter, zoom);
    (mapElement as any)._leaflet_map = map;
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const createCustomIcon = (status: string | null) => {
      let color = "#000000";

      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="36" height="36">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `;

      return L.divIcon({
        className: "custom-map-marker",
        html: svgString,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -32],
      });
    };

    validListings.forEach((item) => {
      const marker = L.marker([item.latitude!, item.longitude!], {
        icon: createCustomIcon(item.status),
      }).addTo(map);

      const photoUrl = Array.isArray(item.link_foto) && item.link_foto.length > 0
        ? item.link_foto[0]
        : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80";

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; width: 220px; color: #000;">
          <img src="${photoUrl}" style="width: 100%; height: 110px; object-fit: cover; border: 1px solid #000; margin-bottom: 6px;" />
          <div style="font-weight: 700; font-size: 13px; color: #000;">${item.kode} - ${item.jenis}</div>
          <div style="font-size: 11px; color: #000; margin-bottom: 4px;">📍 ${item.lokasi_area}</div>
          <div style="font-size: 14px; font-weight: 800; color: #000;">Rp ${item.harga.toLocaleString()}</div>
          <div style="font-size: 11px; margin-top: 4px; display: flex; gap: 8px;">
            <span>🛏️ ${item.kamar_tidur} KT</span>
            <span>📐 ${item.luas_tanah}m² LT</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      if (onSelectListing) {
        marker.on("click", () => onSelectListing(item));
      }
    });

    return () => {
      if ((mapElement as any)._leaflet_map) {
        (mapElement as any)._leaflet_map.remove();
        (mapElement as any)._leaflet_map = null;
      }
    };
  }, [mounted, L, listings, selectedListingId, center, zoom, onSelectListing]);

  const handleSelectLocation = (loc: LocationSearchResult) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.latitude, loc.longitude], 14);
    }
  };

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className="w-full bg-white border border-black flex items-center justify-center text-black font-bold"
      >
        <div className="flex items-center gap-2">
          <span>Memuat Peta Properti...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-white border border-black space-y-2">
      {showSearchBar && (
        <div className="p-3 bg-white border-b border-black">
          <label className="block text-black font-bold mb-1 text-xs">
            🔍 Cari Lokasi di Peta (Google Maps Style Search):
          </label>
          <LocationSearchBar
            onSelectLocation={handleSelectLocation}
            placeholder="Cari lokasi di peta (contoh: Canggu Bali, Pondok Indah, BSD)..."
          />
        </div>
      )}

      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css"
      />
      <div id="leaflet-map-container" style={{ height, width: "100%" }} />
    </div>
  );
}
