import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, ArrowRight, User, Car, Clock3, AlertCircle, Radio } from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { useSocket } from "../../context/SocketContext";
import { getTripById } from "../../services/trip";

const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION = "&copy; OpenStreetMap contributors &copy; CARTO";

const STATUS_TONE = {
  PUBLISHED: "neutral",
  STARTED: "violet",
  IN_PROGRESS: "violet",
  COMPLETED: "success",
  CANCELLED: "danger",
};

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
const pickupIcon = pinIcon("#8b5cf6");
const destIcon = pinIcon("#ec4899");
const vehicleIcon = L.divIcon({
  className: "",
  html: `<div class="live-vehicle-marker"><span class="live-vehicle-pulse"></span><span class="live-vehicle-dot"></span></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function FitToRoute({ pickup, destination }) {
  const map = useMap();
  useEffect(() => {
    if (!pickup || !destination) return;
    map.fitBounds(L.latLngBounds([[pickup.lat, pickup.lng], [destination.lat, destination.lng]]), {
      padding: [60, 60],
    });
  }, [pickup, destination, map]);
  return null;
}

function LiveTracking() {
  const { id } = useParams();
  const { joinTrip, on } = useSocket();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [liveLocation, setLiveLocation] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const isLiveRef = useRef(false);
  const simTimerRef = useRef(null);

  useEffect(() => {
    isLiveRef.current = isLive;
  }, [isLive]);

  useEffect(() => {
    let active = true;
    getTripById(id)
      .then((data) => {
        if (!active) return;
        setTrip(data);
        if (data.current_location) setLiveLocation(data.current_location);
        if (data.status) setLiveStatus(data.status);
      })
      .catch((err) => {
        if (active) setLoadError(err.message || "Could not load this trip");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  // Join the trip's tracking room and listen for the driver's real location updates.
  useEffect(() => {
    if (!trip) return;
    joinTrip(trip.trip_id, "passenger");

    const offState = on("trip_state", (payload) => {
      if (payload?.trip_id !== trip.trip_id || !payload.state) return;
      if (payload.state.current_location) setLiveLocation(payload.state.current_location);
      if (payload.state.status) setLiveStatus(payload.state.status);
    });
    const offLocation = on("live_location_update", (payload) => {
      if (payload?.trip_id !== trip.trip_id) return;
      setIsLive(true);
      setSimulating(false);
      if (simTimerRef.current) {
        clearInterval(simTimerRef.current);
        simTimerRef.current = null;
      }
      setLiveLocation(payload.location);
      if (payload.status) setLiveStatus(payload.status);
    });
    const offStatus = on("trip_status_updated", (payload) => {
      if (payload?.trip_id !== trip.trip_id) return;
      setLiveStatus(payload.status);
    });

    return () => {
      offState?.();
      offLocation?.();
      offStatus?.();
    };
  }, [trip, joinTrip, on]);

  // Demo fallback: no driver app is emitting real GPS yet, so if nothing real arrives
  // shortly, animate a marker along the trip's actual route geometry instead of a blank map.
  useEffect(() => {
    const coords = trip?.route_geometry?.coordinates;
    if (!coords?.length) return;

    const startDelay = setTimeout(() => {
      if (isLiveRef.current) return;
      setSimulating(true);
      let index = 0;
      simTimerRef.current = setInterval(() => {
        index += 1;
        if (index >= coords.length) {
          clearInterval(simTimerRef.current);
          simTimerRef.current = null;
          return;
        }
        const [lng, lat] = coords[index];
        setLiveLocation({ lat, lng });
      }, Math.max(300, 18000 / coords.length));
    }, 2500);

    return () => {
      clearTimeout(startDelay);
      if (simTimerRef.current) {
        clearInterval(simTimerRef.current);
        simTimerRef.current = null;
      }
    };
  }, [trip]);

  if (loading) {
    return (
      <AppShell title="Live Tracking">
        <Card className="h-[70vh] animate-pulse" />
      </AppShell>
    );
  }

  if (loadError || !trip) {
    return (
      <AppShell title="Live Tracking">
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <AlertCircle size={28} className="text-text-faint" />
          <p className="text-sm text-text-dim">{loadError || "This trip could not be found."}</p>
          <Link to="/trips" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
            Back to trips
          </Link>
        </Card>
      </AppShell>
    );
  }

  const status = liveStatus || trip.status;
  const routePositions = trip.route_geometry?.coordinates?.map(([lng, lat]) => [lat, lng]);

  return (
    <AppShell title="Live Tracking">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
              <MapPin size={14} className="shrink-0 text-violet-600" />
              {trip.start_address}
              <ArrowRight size={13} className="mx-0.5 shrink-0 text-text-faint" />
              {trip.dest_address}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-faint">
              <span className="flex items-center gap-1.5">
                <User size={12} />
                {trip.driver_name}
              </span>
              <span className="flex items-center gap-1.5">
                <Car size={12} />
                {trip.vehicle}
              </span>
              {trip.duration_mins != null && (
                <span className="flex items-center gap-1.5">
                  <Clock3 size={12} />
                  {Math.round(trip.duration_mins)} min · {trip.distance_km} km
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/12 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <Radio size={13} className="animate-pulse" />
                Live
              </span>
            ) : simulating ? (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-500/12 px-3 py-1.5 text-xs font-semibold text-amber-700">
                <Radio size={13} />
                Demo mode
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1.5 text-xs font-semibold text-text-faint">
                Connecting…
              </span>
            )}
            <Badge tone={STATUS_TONE[status] || "neutral"}>{status}</Badge>
          </div>
        </Card>

        <Card className="h-[65vh] overflow-hidden p-0">
          <MapContainer
            center={[trip.start_coords.lat, trip.start_coords.lng]}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom
          >
            <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
            <Marker position={[trip.start_coords.lat, trip.start_coords.lng]} icon={pickupIcon} />
            <Marker position={[trip.dest_coords.lat, trip.dest_coords.lng]} icon={destIcon} />
            {routePositions && (
              <Polyline positions={routePositions} pathOptions={{ color: "#a855f7", weight: 4, opacity: 0.85 }} />
            )}
            {liveLocation && <Marker position={[liveLocation.lat, liveLocation.lng]} icon={vehicleIcon} />}
            <FitToRoute pickup={trip.start_coords} destination={trip.dest_coords} />
          </MapContainer>
        </Card>
      </div>
    </AppShell>
  );
}

export default LiveTracking;
