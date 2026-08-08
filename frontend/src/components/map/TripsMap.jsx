import { useEffect, useMemo, useState, Fragment } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { geocode, previewRoute } from "../../services/route";

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

// Module-level cache so re-renders/other trips sharing a pickup-dest pair don't re-hit OSRM
const routeCache = new Map();

async function fetchRouteLine(pickup, dest) {
  const key = `${pickup.lat},${pickup.lng}-${dest.lat},${dest.lng}`;
  if (routeCache.has(key)) return routeCache.get(key);
  try {
    const route = await previewRoute({
      origin_lat: pickup.lat,
      origin_lng: pickup.lng,
      dest_lat: dest.lat,
      dest_lng: dest.lng,
    });
    const positions = route?.geometry?.coordinates?.map(([lng, lat]) => [lat, lng]) || null;
    routeCache.set(key, positions);
    return positions;
  } catch {
    routeCache.set(key, null);
    return null;
  }
}

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
  const [routeLines, setRouteLines] = useState({});

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

    resolveTrips();

    return () => {
      cancelled = true;
    };
  }, [trips]);

  const points = useMemo(
    () => resolved.flatMap(({ pickup, dest }) => [[pickup.lat, pickup.lng], [dest.lat, dest.lng]]),
    [resolved]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadRouteLines() {
      const entries = {};
      // Sequential, mirrors the geocoding loop above — gentle on the public OSRM instance
      for (const { trip, pickup, dest } of resolved) {
        const key = trip.trip_id || trip.id;
        const positions = await fetchRouteLine(pickup, dest);
        if (cancelled) return;
        if (positions) entries[key] = positions;
      }
      if (!cancelled) setRouteLines(entries);
    }

    loadRouteLines();

    return () => {
      cancelled = true;
    };
  }, [resolved]);

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
          {resolved.map(({ trip }) => {
            const key = trip.trip_id || trip.id;
            const positions = routeLines[key];
            if (!positions) return null;
            const isActive = key === activeTripId;
            return (
              <Polyline
                key={`route-${key}`}
                positions={positions}
                pathOptions={{
                  color: "#a855f7",
                  weight: isActive ? 5 : 3,
                  opacity: isActive ? 0.9 : 0.55,
                }}
                eventHandlers={{ click: () => onSelectTrip(key) }}
              />
            );
          })}
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