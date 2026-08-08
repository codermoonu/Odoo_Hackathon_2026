import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION = "&copy; OpenStreetMap contributors &copy; CARTO";
const DEFAULT_CENTER = [12.9716, 77.5946]; // Bengaluru

function pinIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
      background:${color};border:2px solid rgba(255,255,255,0.85);
      box-shadow:0 4px 10px rgba(0,0,0,0.45)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
  });
}
const pickupIcon = pinIcon("#8b5cf6");   // violet, matches your accent
const destIcon = pinIcon("#ec4899");     // pink, for contrast

// Auto-fits/pans the map whenever pickup or destination change
function FitBounds({ pickup, destination }) {
  const map = useMap();
  useEffect(() => {
    if (pickup && destination) {
      const bounds = L.latLngBounds([[pickup.lat, pickup.lng], [destination.lat, destination.lng]]);
      map.fitBounds(bounds, { padding: [60, 60] });
    } else if (pickup) {
      map.setView([pickup.lat, pickup.lng], 14);
    } else if (destination) {
      map.setView([destination.lat, destination.lng], 14);
    }
  }, [pickup, destination, map]);
  return null;
}

// Lets the rider click the map to set pickup/destination directly
function ClickToPick({ activeField, onPick }) {
  useMapEvents({
    click(e) {
      if (!activeField) return;
      onPick(activeField, { lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/**
 * @param pickup       { lat, lng, address } | null
 * @param destination  { lat, lng, address } | null
 * @param activeField  "pickup" | "destination" | null — which field a map click should fill
 * @param onPick        (field, {lat, lng}) => void — called on map click
 */
function MapView({ pickup, destination, activeField = null, onPick = () => {} }) {
  const [route, setRoute] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchRoute() {
      if (!pickup || !destination) {
        setRoute(null);
        return;
      }
      try {
        // NOTE: adjust this path/shape to match your actual OSRM proxy route.
        // Expected here: { geometry: { coordinates: [[lng,lat], ...] }, distanceKm, durationMin }
        const res = await fetch(
          `/api/route/directions?fromLat=${pickup.lat}&fromLng=${pickup.lng}&toLat=${destination.lat}&toLng=${destination.lng}`
        );
        if (!res.ok) throw new Error("route fetch failed");
        const data = await res.json();
        if (!cancelled) setRoute(data);
      } catch {
        if (!cancelled) setRoute(null);
      }
    }
    fetchRoute();
    return () => { cancelled = true; };
  }, [pickup, destination]);

  const center = useMemo(() => {
    if (pickup) return [pickup.lat, pickup.lng];
    if (destination) return [destination.lat, destination.lng];
    return DEFAULT_CENTER;
  }, [pickup, destination]);

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-border">
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />}
        {destination && <Marker position={[destination.lat, destination.lng]} icon={destIcon} />}
        {route?.geometry?.coordinates && (
          <Polyline
            positions={route.geometry.coordinates.map(([lng, lat]) => [lat, lng])}
            pathOptions={{ color: "#a855f7", weight: 4, opacity: 0.85 }}
          />
        )}
        <FitBounds pickup={pickup} destination={destination} />
        <ClickToPick activeField={activeField} onPick={onPick} />
      </MapContainer>
    </div>
  );
}

export default MapView;