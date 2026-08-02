"use client";

import { useEffect, useState } from "react";
import LocationSearchBar, { LocationSearchResult } from "./LocationSearchBar";

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (data: {
    latitude: number;
    longitude: number;
    lokasi_area?: string;
    alamat_lengkap?: string;
  }) => void;
  initialArea?: string;
  height?: string;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onLocationChange,
  initialArea = "",
  height = "280px",
}: LocationPickerMapProps) {
  const [mounted, setMounted] = useState(false);
  const [L, setL] = useState<any>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markerInstance, setMarkerInstance] = useState<any>(null);

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

    const container = document.getElementById("location-picker-map-container");
    if (!container) return;

    if ((container as any)._leaflet_map) {
      (container as any)._leaflet_map.remove();
    }

    const map = L.map("location-picker-map-container").setView([latitude, longitude], 14);
    (container as any)._leaflet_map = map;
    setMapInstance(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);
    setMarkerInstance(marker);

    // Helper function to reverse geocode lat/lng to street & area name
    const handleCoordUpdate = async (lat: number, lng: number) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
          {
            headers: { "Accept-Language": "id,en" },
          }
        );
        const data = await res.json();
        if (data && data.address) {
          const addr = data.address;
          const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || "";
          const village = addr.village || addr.suburb || addr.quarter || "";
          const city = addr.city || addr.regency || addr.town || addr.county || "";
          const state = addr.state || "";

          const areaParts = [village || road, city || state].filter(Boolean);
          const lokasi_area = areaParts.length > 0 ? areaParts.join(", ") : data.display_name.split(",")[0];

          onLocationChange({
            latitude: lat,
            longitude: lng,
            lokasi_area,
            alamat_lengkap: data.display_name,
          });
          return;
        }
      } catch (e) {
        console.error(e);
      }

      onLocationChange({ latitude: lat, longitude: lng });
    };

    // On Marker Drag End
    marker.on("dragend", (e: any) => {
      const coord = e.target.getLatLng();
      handleCoordUpdate(coord.lat, coord.lng);
    });

    // On Map Click
    map.on("click", (e: any) => {
      marker.setLatLng(e.latlng);
      handleCoordUpdate(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      if ((container as any)._leaflet_map) {
        (container as any)._leaflet_map.remove();
      }
    };
  }, [mounted, L]);

  // Update marker position & pan map when latitude/longitude props change from external search bar
  const handleSelectFromSearch = (loc: LocationSearchResult) => {
    onLocationChange({
      latitude: loc.latitude,
      longitude: loc.longitude,
      lokasi_area: loc.lokasi_area,
      alamat_lengkap: loc.alamat_lengkap,
    });

    if (mapInstance && markerInstance) {
      mapInstance.flyTo([loc.latitude, loc.longitude], 15);
      markerInstance.setLatLng([loc.latitude, loc.longitude]);
    }
  };

  return (
    <div className="space-y-2">
      {/* Location Search Bar Header */}
      <div>
        <label className="block text-black font-bold mb-1 text-xs">
          🔍 Cari Lokasi / Alamat (Google Maps Style Search):
        </label>
        <LocationSearchBar
          initialValue={initialArea}
          onSelectLocation={handleSelectFromSearch}
        />
        <p className="text-[11px] text-black mt-1">
          💡 <em>Ketik nama jalan/area di atas, atau klik/geser pin di peta di bawah untuk memperbarui koordinat & alamat secara presisi.</em>
        </p>
      </div>

      {/* Map Container */}
      <div className="relative w-full border border-black overflow-hidden bg-white">
        {!mounted && (
          <div style={{ height }} className="w-full bg-white flex items-center justify-center text-black font-bold text-xs">
            Memuat Peta Geolocation...
          </div>
        )}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css"
        />
        <div id="location-picker-map-container" style={{ height, width: "100%" }} />
      </div>
    </div>
  );
}
