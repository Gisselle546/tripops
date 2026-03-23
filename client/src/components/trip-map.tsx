"use client";

import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/* ── Nominatim geocoder (free, OpenStreetMap-based) ────────────── */
interface LatLng {
  lat: number;
  lng: number;
}

async function geocode(query: string): Promise<LatLng | null> {
  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
    { q: query, format: "json", limit: "1" },
  )}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "TripOps/1.0" },
    });
    const data = await res.json();
    if (data?.[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {
    /* silent */
  }
  return null;
}

/* ── Custom numbered marker icons ──────────────────────────────── */
function numberedIcon(n: number) {
  return L.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:#2563eb;color:#fff;font-size:12px;font-weight:700;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,.3);border:2px solid #fff;
    ">${n}</div>`,
  });
}

const cityIcon = L.divIcon({
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  html: `<div style="
    width:32px;height:32px;border-radius:50%;
    background:#dc2626;color:#fff;font-size:14px;font-weight:700;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 2px 8px rgba(0,0,0,.35);border:2px solid #fff;
  ">★</div>`,
});

/* ── Helper to fit all markers into view ───────────────────────── */
function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (points.length === 0 || fitted.current) return;
    fitted.current = true;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 13);
    } else {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [points, map]);

  return null;
}

/* ── Main component ────────────────────────────────────────────── */
interface Pin {
  name: string;
  coords: LatLng;
}

interface TripMapProps {
  destination: string;
  locationNames: string[];
}

export default function TripMap({ destination, locationNames }: TripMapProps) {
  const [center, setCenter] = useState<LatLng | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const geocoded = useRef(false);

  useEffect(() => {
    if (geocoded.current) return;
    geocoded.current = true;

    async function load() {
      // 1. Geocode the destination city for the default center
      const cityCoords = await geocode(destination);
      if (cityCoords) setCenter(cityCoords);

      // 2. Geocode each location name (append city for context)
      const results: Pin[] = [];
      for (const name of locationNames) {
        const coords = await geocode(`${name}, ${destination}`);
        if (coords) {
          results.push({ name, coords });
        }
      }
      setPins(results);
      setLoading(false);
    }

    load();
  }, [destination, locationNames]);

  if (!center && loading) {
    return (
      <div className="flex items-center justify-center h-full bg-linear-to-br from-blue-50 to-blue-100 text-slate-400 text-sm rounded-2xl">
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
          Loading map…
        </div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="flex items-center justify-center h-full bg-linear-to-br from-blue-50 to-blue-100 text-slate-400 text-sm rounded-2xl">
        Could not locate {destination}.
      </div>
    );
  }

  const allPoints = [center, ...pins.map((p) => p.coords)];

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* City center marker */}
      <Marker position={[center.lat, center.lng]} icon={cityIcon}>
        <Popup>
          <strong>{destination}</strong>
          <br />
          Trip destination
        </Popup>
      </Marker>

      {/* Individual location markers */}
      {pins.map((pin, idx) => (
        <Marker
          key={pin.name}
          position={[pin.coords.lat, pin.coords.lng]}
          icon={numberedIcon(idx + 1)}
        >
          <Popup>{pin.name}</Popup>
        </Marker>
      ))}

      <FitBounds points={allPoints} />
    </MapContainer>
  );
}
