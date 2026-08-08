import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { MapPin, ArrowRight, Users, CreditCard, SearchX, List, Map as MapIcon } from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import TripsMap from "../../components/map/TripsMap";
import { searchRides } from "../../services/ride";
import { bookRide } from "../../services/booking";
import { formatCurrency, formatDateTime } from "../../utils/formatDate";
import { getAvailableSeats, getSeatStatusLabel, getSeatUrgency, SEAT_URGENCY_STYLES } from "../../utils/seat";
import { useCurrentLocation } from "../../hooks/useCurrentLocation";

function AvailableRides() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pickup = searchParams.get("pickup") || "";
  const destination = searchParams.get("destination") || "";

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [bookingId, setBookingId] = useState(null); // ride._id currently being booked (loading state)
  const [bookErrors, setBookErrors] = useState({});
  const [view, setView] = useState("list");
  const [hoveredRideId, setHoveredRideId] = useState(null);
  const { status: locationStatus, error: locationError, requestLocation } = useCurrentLocation();

  useEffect(() => {
    let active = true;
    setLoading(true);
    searchRides({ pickupLocation: pickup, destination })
      .then((data) => {
        if (active) setRides(data);
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
  }, [pickup, destination]);

  async function handleRequestSeat(ride) {
    setBookingId(ride._id);
    setBookErrors((e) => ({ ...e, [ride._id]: "" }));
    try {
      // Locks the seat atomically (first-come-first-serve guard lives here)
      // and creates a Booking with paymentStatus: "Pending" before we ever
      // leave this page — so payment is the *second* step, not the first.
      const { booking, ride: updatedRide } = await bookRide(ride._id, 1);
      setRides((current) =>
        current.map((r) => (r._id === ride._id ? { ...r, availableSeats: updatedRide.availableSeats, status: updatedRide.status } : r))
      );
      navigate(`/rides/${ride._id}/pay`, { state: { bookingId: booking._id } });
    } catch (err) {
      setBookErrors((e) => ({ ...e, [ride._id]: err.message || "Booking failed" }));
    } finally {
      setBookingId(null);
    }
  }

  const mapRides = useMemo(
    () =>
      rides.map((r) => ({
        trip_id: r._id,
        driver_name: r.driver?.name,
        vehicle: r.vehicle ? `${r.vehicle.make} ${r.vehicle.model}` : "",
        start_address: r.pickupLocation,
        dest_address: r.destination,
        pickupLat: r.pickupLat,
        pickupLng: r.pickupLng,
        destLat: r.destinationLat,
        destLng: r.destinationLng,
      })),
    [rides]
  );

  return (
    <AppShell title="Available Rides">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {(pickup || destination) && (
          <p className="flex flex-wrap items-center gap-1.5 text-sm text-text-dim">
            Showing rides
            {pickup && <> from <span className="font-semibold text-text">{pickup}</span></>}
            {destination && <> to <span className="font-semibold text-text">{destination}</span></>}
            <Link to="/rides/find" className="ml-1 font-semibold text-violet-600 hover:text-violet-700">
              Change search
            </Link>
          </p>
        )}

        {locationStatus !== "granted" && (
          <button
            type="button"
            onClick={requestLocation}
            disabled={locationStatus === "requesting"}
            className="text-sm font-semibold text-violet-600 hover:text-violet-700 disabled:opacity-60"
          >
            {locationStatus === "requesting" ? "Locating…" : "Use my location to find rides nearby"}
          </button>
        )}

        <div className="flex items-center gap-1 rounded-xl border border-border bg-surface-alt/60 p-1">
          <button type="button" onClick={() => setView("list")} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${view === "list" ? "bg-violet-500/20 text-violet-700" : "text-text-faint hover:text-text-dim"}`}>
            <List size={13} /> List
          </button>
          <button type="button" onClick={() => setView("map")} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${view === "map" ? "bg-violet-500/20 text-violet-700" : "text-text-faint hover:text-text-dim"}`}>
            <MapIcon size={13} /> Map
          </button>
        </div>
      </div>

      {locationError && <p className="mb-4 text-xs text-red-500">{locationError}</p>}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => <Card key={i} className="h-40 animate-pulse" />)}
        </div>
      ) : loadError ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <SearchX size={28} className="text-text-faint" />
          <p className="text-sm text-text-dim">{loadError}</p>
        </Card>
      ) : rides.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <SearchX size={28} className="text-text-faint" />
          <p className="text-sm text-text-dim">No rides match your search yet.</p>
          <Link to="/rides/offer" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
            Be the first to offer one
          </Link>
        </Card>
      ) : view === "map" ? (
        <Card className="h-[600px] overflow-hidden p-0">
          <TripsMap trips={mapRides} activeTripId={hoveredRideId} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {rides.map((ride) => {
            const seatsLeft = getAvailableSeats(ride);
            const urgency = getSeatUrgency(ride);
            const isFull = seatsLeft === 0;
            const bookError = bookErrors[ride._id];

            return (
              <Card
                key={ride._id}
                className="flex flex-col gap-4 p-5"
                onMouseEnter={() => setHoveredRideId(ride._id)}
                onMouseLeave={() => setHoveredRideId(null)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                      <MapPin size={14} className="shrink-0 text-violet-600" />
                      {ride.pickupLocation}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 truncate text-sm font-semibold">
                      <ArrowRight size={14} className="shrink-0 text-text-faint" />
                      {ride.destination}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${SEAT_URGENCY_STYLES[urgency]}`}>
                    {getSeatStatusLabel(ride)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-faint">
                  <span>{ride.driver?.name}</span>
                  <span>•</span>
                  <span>{ride.vehicle ? `${ride.vehicle.make} ${ride.vehicle.model}` : ""}</span>
                  <span>•</span>
                  <span>{formatDateTime(ride.travelDate)} · {ride.travelTime}</span>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="flex items-center gap-1.5 text-sm text-text-dim">
                    <Users size={15} className="text-violet-600" />
                    {ride.availableSeats} seats total
                  </span>
                  <p className="font-display text-lg font-bold text-violet-700">
                    {formatCurrency(ride.farePerSeat)}
                  </p>
                </div>

                {bookError && <p className="text-xs text-red-600">{bookError}</p>}

                <Button
                  variant="secondary"
                  className="w-full justify-center"
                  disabled={isFull || bookingId === ride._id}
                  onClick={() => handleRequestSeat(ride)}
                >
                  <CreditCard size={16} />
                  {isFull ? "Full" : bookingId === ride._id ? "Booking…" : "Request seat & pay"}
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