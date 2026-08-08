import { useEffect, useMemo, useState, Fragment } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { geocode } from "../../services/route";

const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION = "&copy; OpenStreetMap contributors &copy; CARTO";
const DEFAULT_CENTER = [12.9716, 77.5946];

// Module-level cache so repeated addresses across trips/renders don't re-hit Nominatim
const geocodeCache = new Map();

async function geocodeAddress(address) {
  if (!address) return null;
  if (geocodeCache.has(address)) return geocodeCache.get(address);
  try {
    const matches = await geocode(address); // uses your real GET /route/geocode?q=...
    const first = matches?.[0];
    const coords = first && first.lat != null && first.lng != null ? { lat: first.lat, lng: first.lng } : null;
    geocodeCache.set(address, coords);
    return coords;
  } catch {
    geocodeCache.set(address, null);
    return null;
  }
}

function pinIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
      background:${color};border:2px solid rgba(255,255,255,0.85);
      box-shadow:0 4px 10px rgba(0,0,0,0.45)"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
  });
}
const pickupIcon = pinIcon("#8b5cf6");
const destIcon = pinIcon("#ec4899");

function FitToTrips({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [50, 50] });
    }
  }, [points, map]);
  return null;
}

function TripsMap({ trips = [], activeTripId = null, onSelectTrip = () => {} }) {
  const [resolved, setResolved] = useState([]);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolveTrips() {
      setResolving(true);
      const out = [];

      // Sequential, not Promise.all — plays nice with Nominatim's ~1 req/sec usage policy
      for (const trip of trips) {
        const pickup =
          trip.pickupLat != null && trip.pickupLng != null
            ? { lat: trip.pickupLat, lng: trip.pickupLng }
            : await geocodeAddress(trip.start_address);

        const dest =
          trip.destLat != null && trip.destLng != null
            ? { lat: trip.destLat, lng: trip.destLng }
            : await geocodeAddress(trip.dest_address);

        if (cancelled) return;
        if (pickup && dest) out.push({ trip, pickup, dest });
      }

      if (!cancelled) {
        setResolved(out);
        setResolving(false);
      }
    }

    if (trips.length > 0) {
      resolveTrips();
    } else {
      setResolved([]);
    }

    return () => {
      cancelled = true;
    };
  }, [trips]);

  const points = useMemo(
    () => resolved.flatMap(({ pickup, dest }) => [[pickup.lat, pickup.lng], [dest.lat, dest.lng]]),
    [resolved]
  );

  return (
    <div className="relative h-full w-full">
      {resolving && (
        <div className="absolute top-3 left-1/2 z-[1000] -translate-x-1/2 rounded-full border border-border bg-surface-raised/95 px-3 py-1.5 text-xs font-medium text-text-dim shadow-lg">
          Locating rides on map…
        </div>
      )}
      <div className="h-full w-full overflow-hidden rounded-2xl border border-border">
        <MapContainer center={DEFAULT_CENTER} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          {resolved.map(({ trip, pickup, dest }) => {
            const key = trip.trip_id || trip.id;
            const isActive = key === activeTripId;
            return (
              <Fragment key={key}>
                <Marker
                  position={[pickup.lat, pickup.lng]}
                  icon={pickupIcon}
                  opacity={isActive ? 1 : 0.85}
                  eventHandlers={{ click: () => onSelectTrip(key) }}
                >
                  <Popup>
                    <strong>{trip.start_address}</strong>
                    <br />→ {trip.dest_address}
                    <br />{trip.driver_name}
                  </Popup>
                </Marker>
                <Marker
                  position={[dest.lat, dest.lng]}
                  icon={destIcon}
                  opacity={isActive ? 1 : 0.85}
                  eventHandlers={{ click: () => onSelectTrip(key) }}
                />
              </Fragment>
            );
          })}
          {points.length > 0 && <FitToTrips points={points} />}
        </MapContainer>
      </div>
      {!resolving && resolved.length === 0 && trips.length > 0 && (
        <p className="mt-2 px-1 text-xs text-text-faint">
          Couldn't locate any of these rides on the map — their addresses may not be geocodable.
        </p>
      )}
    </div>
  );
}

export default TripsMap;