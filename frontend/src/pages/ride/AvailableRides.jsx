import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { MapPin, ArrowRight, Users, Fuel, SearchX, List, Map as MapIcon, CreditCard } from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import TripsMap from "../../components/map/TripsMap";
import { getAllTrips } from "../../services/trip";
import { formatCurrency, formatDateTime } from "../../utils/formatDate";
import { getAvailableSeats, getSeatStatusLabel } from "../../utils/seat";
import { useCurrentLocation } from "../../hooks/useCurrentLocation";
const STATUS_TONE = {
  PUBLISHED: "success",
  STARTED: "violet",
  COMPLETED: "neutral",
  CANCELLED: "danger",
};

// Geocoded addresses vary in how much admin hierarchy they include
// ("Jadavpur, Kolkata, West Bengal, India" vs "Jadavpur, Kolkata,
// Kolkata Metropolitan Area, Kolkata, West Bengal, India" for the same
// place), so a plain substring check in either direction is too brittle.
// Match on the query's first (most specific) segment instead — that's
// the actual place name the rider searched for.
function matches(text, query) {
  if (!query) return true;
  const primaryTerm = query.split(",")[0].trim().toLowerCase();
  if (!primaryTerm) return true;
  return (text || "").toLowerCase().includes(primaryTerm);
}

function AvailableRides() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pickup = searchParams.get("pickup") || "";
  const destination = searchParams.get("destination") || "";

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [view, setView] = useState("list"); // "list" | "map"
  const [hoveredTripId, setHoveredTripId] = useState(null);
  const { status, error, requestLocation } = useCurrentLocation();

  useEffect(() => {
    let active = true;
    getAllTrips()
      .then((data) => {
        if (active) setTrips(data);
      })
      .catch((err) => {
        if (active) setLoadError(err.message || "Could not load rides");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      trips.filter(
        (t) => matches(t.start_address, pickup) && matches(t.dest_address, destination)
      ),
    [trips, pickup, destination]
  );

  function handleRequestSeat(tripKey) {
    navigate(`/trips/${tripKey}/pay`);
  }

  return (
    <AppShell title="Available Rides">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {(pickup || destination) && (
          <p className="flex flex-wrap items-center gap-1.5 text-sm text-text-dim">
            Showing rides
            {pickup && (
              <>
                {" "}
                from <span className="font-semibold text-text">{pickup}</span>
              </>
            )}
            {destination && (
              <>
                {" "}
                to <span className="font-semibold text-text">{destination}</span>
              </>
            )}
            <Link to="/rides/find" className="ml-1 font-semibold text-violet-600 hover:text-violet-700">
              Change search
            </Link>
          </p>
        )}
        {/* NEW: location-permission prompt for "rides near me" */}
        {status !== "granted" && (
          <button
            type="button"
            onClick={requestLocation}
            disabled={status === "requesting"}
            className="text-sm font-semibold text-violet-600 hover:text-violet-700 disabled:opacity-60"
          >
            {status === "requesting" ? "Locating…" : "Use my location to find rides nearby"}
          </button>
        )}

        <div className="flex items-center gap-1 rounded-xl border border-border bg-surface-alt/60 p-1">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              view === "list" ? "bg-violet-500/20 text-violet-700" : "text-text-faint hover:text-text-dim"
            }`}
          >
            <List size={13} /> List
          </button>
          <button
            type="button"
            onClick={() => setView("map")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              view === "map" ? "bg-violet-500/20 text-violet-700" : "text-text-faint hover:text-text-dim"
            }`}
          >
            <MapIcon size={13} /> Map
          </button>
        </div>
      </div>
       {/* NEW: error message, own line below the header row */}
      {error && <p className="mb-4 text-xs text-red-500">{error}</p>}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="h-40 animate-pulse" />
          ))}
        </div>
      ) : loadError ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <SearchX size={28} className="text-text-faint" />
          <p className="text-sm text-text-dim">{loadError}</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <SearchX size={28} className="text-text-faint" />
          <p className="text-sm text-text-dim">No rides match your search yet.</p>
          <Link to="/rides/offer" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
            Be the first to offer one
          </Link>
        </Card>
      ) : view === "map" ? (
        <Card className="h-[600px] overflow-hidden p-0">
          <TripsMap trips={filtered} activeTripId={hoveredTripId} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((trip) => {
            const key = trip.trip_id || trip.id;
            const seats = getAvailableSeats(trip, 0);
            return (
              <Card
                key={key}
                className="flex flex-col gap-4 p-5"
                onMouseEnter={() => setHoveredTripId(key)}
                onMouseLeave={() => setHoveredTripId(null)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                      <MapPin size={14} className="shrink-0 text-violet-600" />
                      {trip.start_address || "Pickup"}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 truncate text-sm font-semibold">
                      <ArrowRight size={14} className="shrink-0 text-text-faint" />
                      {trip.dest_address || "Destination"}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[trip.status] || "neutral"}>{trip.status}</Badge>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-faint">
                  <span>{trip.driver_name}</span>
                  <span>•</span>
                  <span>{trip.vehicle}</span>
                  <span>•</span>
                  <span>{formatDateTime(trip.createdAt)}</span>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-4 text-sm text-text-dim">
                    <span className="flex items-center gap-1.5">
                      <Users size={15} className="text-violet-600" />
                      {getSeatStatusLabel(trip, 0)}
                    </span>
                    {trip.distance_km != null && (
                      <span className="flex items-center gap-1.5">
                        <Fuel size={15} className="text-violet-600" />
                        {trip.distance_km} km
                      </span>
                    )}
                  </div>
                  <p className="font-display text-lg font-bold text-violet-700">
                    {formatCurrency(trip.fare_per_seat)}
                  </p>
                </div>

                <Button
                  variant="secondary"
                  className="w-full justify-center"
                  disabled={seats === 0}
                  onClick={() => handleRequestSeat(key)}
                >
                  <CreditCard size={16} />
                  {seats === 0 ? "Full" : "Request seat & pay"}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

export default AvailableRides;