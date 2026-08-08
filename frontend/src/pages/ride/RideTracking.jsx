import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, ArrowRight, User, Car, Clock3, AlertCircle, Radio, CheckCircle2, Phone, MessageCircle, LifeBuoy } from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ChatPanel from "../../components/trip/ChatPanel";
import { getBookingById } from "../../services/booking";
import { previewRoute } from "../../services/route";
import { SUPPORT_PHONE } from "../../utils/constants";
import { isValidCoord } from "../../utils/geo";

// How long the "You've arrived" overlay stays up before redirecting to Available Rides.
const ARRIVAL_REDIRECT_MS = 7000;

// No driver app emits real GPS for the Ride/Booking flow yet, so this counts
// down from a plausible starting point while the driver "arrives" — same
// simulated-ETA approach used by the legacy Trip flow's LiveTracking.
const INITIAL_ARRIVING_MINUTES = 4;

const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION = "&copy; OpenStreetMap contributors &copy; CARTO";
const DEFAULT_CENTER = [12.9716, 77.5946]; // Bengaluru — used if a ride is ever missing coords

const STATUS_TONE = {
  SCHEDULED: "neutral",
  ARRIVING: "violet",
  ON_ROUTE: "violet",
  ARRIVED: "success",
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
    if (!isValidCoord(pickup) || !isValidCoord(destination)) return;
    map.fitBounds(L.latLngBounds([[pickup.lat, pickup.lng], [destination.lat, destination.lng]]), {
      padding: [60, 60],
    });
  }, [pickup, destination, map]);
  return null;
}

function RideTracking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [route, setRoute] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [arrivingMinutes, setArrivingMinutes] = useState(INITIAL_ARRIVING_MINUTES);
  const [chatOpen, setChatOpen] = useState(false);

  const arrivedRef = useRef(false);
  const simTimerRef = useRef(null);

  useEffect(() => {
    let active = true;
    getBookingById(id)
      .then((data) => {
        if (active) setBooking(data);
      })
      .catch((err) => {
        if (active) setLoadError(err.message || "Could not load this booking");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const ride = booking?.ride;
  const pickup = ride ? { lat: ride.pickupLat, lng: ride.pickupLng } : null;
  const destination = ride ? { lat: ride.destinationLat, lng: ride.destinationLng } : null;

  // Fetch a real driving route between the ride's coords, once — reused both
  // for the drawn polyline and as the path the demo marker animates along.
  useEffect(() => {
    let active = true;
    if (!isValidCoord(pickup) || !isValidCoord(destination)) return undefined;
    previewRoute({ origin_lat: pickup.lat, origin_lng: pickup.lng, dest_lat: destination.lat, dest_lng: destination.lng })
      .then((data) => {
        if (active) setRoute(data);
      })
      .catch(() => {
        // No polyline/animation if the route can't be calculated — markers still show.
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pickup/destination are derived objects; ride._id is the real identity
  }, [ride?._id]);

  // Driver-arriving-at-pickup countdown.
  useEffect(() => {
    if (arrived || arrivingMinutes <= 0) return;
    const tick = setInterval(() => {
      setArrivingMinutes((m) => Math.max(m - 1, 0));
    }, 60000);
    return () => clearInterval(tick);
  }, [arrived, arrivingMinutes]);

  function handleArrival(destCoord) {
    if (arrivedRef.current) return;
    arrivedRef.current = true;
    if (isValidCoord(destCoord)) setLiveLocation(destCoord);
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
    setSimulating(false);
    setArrived(true);
  }

  // Demo tracking: animate a marker along the fetched route geometry so the
  // map isn't blank while there's no real driver GPS to show.
  useEffect(() => {
    const coords = route?.geometry?.coordinates;
    if (!coords?.length) return undefined;

    const startDelay = setTimeout(() => {
      setSimulating(true);
      let index = 0;
      simTimerRef.current = setInterval(() => {
        index += 1;
        if (index >= coords.length - 1) {
          const [lng, lat] = coords[coords.length - 1];
          handleArrival({ lat, lng });
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
  }, [route]);

  // Show the "arrived" overlay for a bit, then send the rider back to browse rides.
  useEffect(() => {
    if (!arrived) return;
    const redirectTimer = setTimeout(() => navigate("/rides/available"), ARRIVAL_REDIRECT_MS);
    return () => clearTimeout(redirectTimer);
  }, [arrived, navigate]);

  if (loading) {
    return (
      <AppShell title="Live Tracking">
        <Card className="h-[70vh] animate-pulse" />
      </AppShell>
    );
  }

  if (loadError || !booking) {
    return (
      <AppShell title="Live Tracking">
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <AlertCircle size={28} className="text-text-faint" />
          <p className="text-sm text-text-dim">{loadError || "This booking could not be found."}</p>
          <Link to="/rides/available" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
            Back to rides
          </Link>
        </Card>
      </AppShell>
    );
  }

  const status = arrived ? "ARRIVED" : simulating ? "ON_ROUTE" : "ARRIVING";
  const routePositions = route?.geometry?.coordinates?.map(([lng, lat]) => [lat, lng]);
  const seatLabel = `${booking.seatsBooked} seat${booking.seatsBooked === 1 ? "" : "s"}`;

  return (
    <AppShell title="Live Tracking">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
              <MapPin size={14} className="shrink-0 text-violet-600" />
              {ride.pickupLocation}
              <ArrowRight size={13} className="mx-0.5 shrink-0 text-text-faint" />
              {ride.destination}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-faint">
              <span className="flex items-center gap-1.5">
                <User size={12} />
                {ride.driver?.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Car size={12} />
                {ride.vehicle ? `${ride.vehicle.make} ${ride.vehicle.model}` : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock3 size={12} />
                {seatLabel}
              </span>
              {route?.duration_mins != null && (
                <span className="flex items-center gap-1.5">
                  {Math.round(route.duration_mins)} min · {route.distance_km} km
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {arrived ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/12 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={13} />
                Arrived
              </span>
            ) : simulating ? (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-500/12 px-3 py-1.5 text-xs font-semibold text-amber-700">
                <Radio size={13} className="animate-pulse" />
                On the way
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1.5 text-xs font-semibold text-text-faint">
                Connecting…
              </span>
            )}
            <Badge tone={STATUS_TONE[status] || "neutral"}>{status.replace("_", " ")}</Badge>
          </div>
        </Card>

        {!arrived && (
          <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-500/12 text-violet-700">
                <User size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold">{ride.driver?.name}</p>
                <p className="mt-0.5 text-xs text-text-faint">
                  {arrivingMinutes > 0
                    ? `Arriving in ~${arrivingMinutes} min`
                    : "Your driver should be here"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={ride.driver?.phone ? `tel:${ride.driver.phone}` : undefined}
                aria-disabled={!ride.driver?.phone}
                className={`flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-semibold transition-colors ${
                  ride.driver?.phone
                    ? "text-text hover:border-violet-400/40 hover:bg-black/[0.02]"
                    : "cursor-not-allowed text-text-faint opacity-60"
                }`}
                onClick={(e) => {
                  if (!ride.driver?.phone) e.preventDefault();
                }}
              >
                <Phone size={14} />
                Call driver
              </a>
              <button
                type="button"
                onClick={() => setChatOpen(true)}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-semibold transition-colors hover:border-violet-400/40 hover:bg-black/[0.02]"
              >
                <MessageCircle size={14} />
                Message
              </button>
              <a
                href={`tel:${SUPPORT_PHONE}`}
                className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-500"
              >
                <LifeBuoy size={14} />
                Customer care
              </a>
            </div>
          </Card>
        )}

        <Card className="relative h-[65vh] overflow-hidden p-0">
          <MapContainer
            center={isValidCoord(pickup) ? [pickup.lat, pickup.lng] : DEFAULT_CENTER}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom
          >
            <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
            {isValidCoord(pickup) && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />}
            {isValidCoord(destination) && <Marker position={[destination.lat, destination.lng]} icon={destIcon} />}
            {routePositions && (
              <Polyline positions={routePositions} pathOptions={{ color: "#a855f7", weight: 4, opacity: 0.85 }} />
            )}
            {isValidCoord(liveLocation) && <Marker position={[liveLocation.lat, liveLocation.lng]} icon={vehicleIcon} />}
            <FitToRoute pickup={pickup} destination={destination} />
          </MapContainer>

          {arrived && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="animate-fade-up mx-4 flex max-w-sm flex-col items-center gap-3 rounded-3xl border border-border bg-surface px-8 py-9 text-center shadow-2xl">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-700">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-xl font-bold">Reached successfully!</h2>
                <p className="text-sm text-text-dim">
                  You've arrived at {ride.destination.split(",")[0]}. Taking you back to Available Rides…
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} driverName={ride.driver?.name} />
    </AppShell>
  );
}

export default RideTracking;
