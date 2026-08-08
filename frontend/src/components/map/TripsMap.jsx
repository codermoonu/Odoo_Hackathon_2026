import { useEffect, useMemo, useState, Fragment } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION = "&copy; OpenStreetMap contributors &copy; CARTO";
const DEFAULT_CENTER = [12.9716, 77.5946];

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
    if (points.length === 1) map.setView(points[0], 13);
    else map.fitBounds(L.latLngBounds(points), { padding: [50, 50] });
  }, [points, map]);
  return null;
}

function TripsMap({ trips = [], activeTripId = null, onSelectTrip = () => {} }) {
  const plottable = trips.filter(
    (t) => t.pickupLat != null && t.pickupLng != null && t.destLat != null && t.destLng != null
  );

  const points = useMemo(
    () => plottable.flatMap((t) => [[t.pickupLat, t.pickupLng], [t.destLat, t.destLng]]),
    [plottable]
  );

  return (
    <div className="relative h-full w-full">
      <div className="h-full w-full overflow-hidden rounded-2xl border border-border">
        <MapContainer center={DEFAULT_CENTER} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          {plottable.map((trip) => {
            const key = trip.trip_id;
            const isActive = key === activeTripId;
            return (
              <Fragment key={key}>
                <Marker position={[trip.pickupLat, trip.pickupLng]} icon={pickupIcon} opacity={isActive ? 1 : 0.85} eventHandlers={{ click: () => onSelectTrip(key) }}>
                  <Popup>
                    <strong>{trip.start_address}</strong>
                    <br />→ {trip.dest_address}
                    <br />{trip.driver_name}
                  </Popup>
                </Marker>
                <Marker position={[trip.destLat, trip.destLng]} icon={destIcon} opacity={isActive ? 1 : 0.85} eventHandlers={{ click: () => onSelectTrip(key) }} />
              </Fragment>
            );
          })}
          {points.length > 0 && <FitToTrips points={points} />}
        </MapContainer>
      </div>
      {plottable.length === 0 && trips.length > 0 && (
        <p className="mt-2 px-1 text-xs text-text-faint">None of these rides have location coordinates yet.</p>
      )}
    </div>
  );
}

export default TripsMap;