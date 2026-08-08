import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navigation, ArrowLeftRight, Route as RouteIcon, Clock, Loader2, CheckCircle2, Car } from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { SelectField, FormField } from "../../components/ui/FormField";
import LocationAutocomplete from "../../components/ride/LocationAutocomplete";
import { getVehicles } from "../../services/vehicle";
import { previewRoute } from "../../services/route";
import { publishRide } from "../../services/ride";
import { formatCurrency, formatDateTime } from "../../utils/formatDate";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function OfferRide() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehicleId, setVehicleId] = useState("");
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [travelDate, setTravelDate] = useState(todayIsoDate());
  const [travelTime, setTravelTime] = useState("");
  const [seats, setSeats] = useState(1);
  const [fare, setFare] = useState("");

  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [published, setPublished] = useState(null);

  useEffect(() => {
    getVehicles()
      .then((data) => {
        setVehicles(data);
        if (data.length > 0) setVehicleId(data[0]._id);
      })
      .finally(() => setVehiclesLoading(false));
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      if (!pickup || !destination) {
        if (active) setRoute(null);
        return;
      }
      setRouteLoading(true);
      setRouteError("");
      try {
        const data = await previewRoute({
          origin_lat: pickup.lat,
          origin_lng: pickup.lng,
          dest_lat: destination.lat,
          dest_lng: destination.lng,
        });
        if (!active) return;
        setRoute(data);
        setFare(String(data.fare_per_seat));
      } catch (err) {
        if (active) setRouteError(err.message || "Could not calculate this route");
      } finally {
        if (active) setRouteLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [pickup, destination]);

  const selectedVehicle = vehicles.find((v) => v._id === vehicleId);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    if (!selectedVehicle) return setSubmitError("Add a vehicle before offering a ride");
    if (!pickup || !destination) return setSubmitError("Choose a pickup and destination");
    if (!route) return setSubmitError("Waiting on the route calculation — try again in a moment");
    if (!travelDate || !travelTime) return setSubmitError("Set a travel date and time");

    setSubmitting(true);
    try {
      const ride = await publishRide({
        vehicleId,
        pickupLocation: pickup.address,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        destination: destination.address,
        destinationLat: destination.lat,
        destinationLng: destination.lng,
        travelDate,
        travelTime,
        farePerSeat: Number(fare) || route.fare_per_seat,
        availableSeats: Number(seats),
      });
      setPublished(ride);
    } catch (err) {
      setSubmitError(err.message || "Could not publish this ride");
    } finally {
      setSubmitting(false);
    }
  }

  if (published) {
    return (
      <AppShell title="Offer a Ride">
        <div className="mx-auto max-w-lg">
          <Card className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700">
              <CheckCircle2 size={28} />
            </div>
            <h2 className="font-display text-xl font-bold">Ride published!</h2>
            <p className="text-sm text-text-dim">
              {published.pickupLocation} <ArrowLeftRight size={12} className="mx-1 inline" /> {published.destination}
              {" — "}
              {published.availableSeats} seats at {formatCurrency(published.farePerSeat)} each.
            </p>
            <p className="text-xs text-text-faint">
              {formatDateTime(published.travelDate)} · {published.travelTime}
            </p>
            <div className="mt-2 flex gap-3">
              <Button onClick={() => navigate("/rides/available")}>Browse rides</Button>
              <Button variant="secondary" onClick={() => navigate("/rides/offer")}>
                Publish another
              </Button>
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Offer a Ride">
      <div className="mx-auto max-w-2xl">
        {!vehiclesLoading && vehicles.length === 0 ? (
          <Card className="flex flex-col items-center gap-4 p-10 text-center">
            <Car size={30} className="text-text-faint" />
            <h2 className="font-display text-lg font-bold">Add a vehicle first</h2>
            <p className="max-w-sm text-sm text-text-dim">
              You'll need a registered vehicle before you can publish a ride.
            </p>
            <Link to="/vehicle">
              <Button>Add my vehicle</Button>
            </Link>
          </Card>
        ) : (
          <Card className="p-6 sm:p-8">
            <div className="mb-6 text-center">
              <Navigation className="mx-auto text-violet-600" size={26} />
              <h2 className="mt-3 font-display text-xl font-bold">Publish your route</h2>
              <p className="mt-1.5 text-sm text-text-dim">Set your route once, riders find you.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              {submitError && (
                <div role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <SelectField label="Vehicle" required value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.make} {v.model} · {v.registrationNumber} · {v.seatingCapacity} seats
                  </option>
                ))}
              </SelectField>

              <LocationAutocomplete
                label="Pickup location"
                placeholder="Where do you start?"
                onSelect={setPickup}
                required
              />

              <div className="-my-1 flex items-center justify-center text-text-faint">
                <ArrowLeftRight size={16} />
              </div>

              <LocationAutocomplete
                label="Destination"
                placeholder="Where are you headed?"
                onSelect={setDestination}
                required
              />

              {routeLoading && (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-alt/60 px-4 py-3 text-sm text-text-dim">
                  <Loader2 size={16} className="animate-spin" />
                  Calculating route &amp; fare…
                </div>
              )}
              {routeError && (
                <div role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                  {routeError}
                </div>
              )}
              {route && !routeLoading && (
                <div className="grid grid-cols-2 gap-3 rounded-xl border border-violet-400/20 bg-violet-500/5 px-4 py-3.5 text-sm">
                  <span className="flex items-center gap-2 text-text-dim">
                    <RouteIcon size={15} className="text-violet-600" />
                    {route.distance_km} km
                  </span>
                  <span className="flex items-center gap-2 text-text-dim">
                    <Clock size={15} className="text-violet-600" />
                    {route.duration_mins} min
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Travel date"
                  type="date"
                  min={todayIsoDate()}
                  required
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                />
                <FormField
                  label="Travel time"
                  type="time"
                  required
                  value={travelTime}
                  onChange={(e) => setTravelTime(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Available seats"
                  type="number"
                  min={1}
                  max={selectedVehicle?.seatingCapacity || 8}
                  required
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                />
                <FormField
                  label="Fare per seat (₹)"
                  type="number"
                  min={0}
                  required
                  value={fare}
                  onChange={(e) => setFare(e.target.value)}
                  placeholder={route ? String(route.fare_per_seat) : "—"}
                />
              </div>

              <Button type="submit" loading={submitting} disabled={!route} className="mt-1 w-full justify-center">
                Publish ride
              </Button>
            </form>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

export default OfferRide;
