import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeftRight,MapPin } from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LocationAutocomplete from "../../components/ride/LocationAutocomplete";
import MapView from "../../components/map/MapView";
import { assets } from "../../assets/assets";
import { useSavedPlaces } from "../../hooks/useSavedPlaces";
function FindRide() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState(null);       // { address, lat, lng } | null
  const [destination, setDestination] = useState(null);
  const [activeField, setActiveField] = useState(null); // "pickup" | "destination" | null
  const [error, setError] = useState("");

  const { places: savedPlaces } = useSavedPlaces();

function applySavedPlace(place) {
  const payload = { address: place.address, lat: place.lat, lng: place.lng };
  // Fill whichever field was last focused; default to pickup, then destination.
  if (activeField === "destination") {
    setDestination(payload);
  } else if (activeField === "pickup" || !pickup) {
    setPickup(payload);
  } else {
    setDestination(payload);
  }
  setError("");
}

  function handleMapPick(field, coords) {
    if (field === "pickup") {
      setPickup((prev) => ({ ...coords, address: prev?.address ?? "Dropped pin" }));
    }
    if (field === "destination") {
      setDestination((prev) => ({ ...coords, address: prev?.address ?? "Dropped pin" }));
    }
    setError("");
  }

  function swapLocations() {
    setPickup(destination);
    setDestination(pickup);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!pickup?.address?.trim() && !destination?.address?.trim()) {
      setError("Enter a pickup or destination to search");
      return;
    }
    const params = new URLSearchParams();
    if (pickup?.address?.trim()) params.set("pickup", pickup.address.trim());
    if (destination?.address?.trim()) params.set("destination", destination.address.trim());
    navigate(`/rides/available?${params.toString()}`);
  }

  return (
    <AppShell title="Find a Ride">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
        {/* Left: form */}
        <div className="animate-fade-up">
          <div className="text-center lg:text-left">
            <img src={assets.car_icon} alt="" className="mx-auto h-12 w-12 opacity-90 lg:mx-0" />
            <h2 className="mt-4 font-display text-2xl font-bold">Where are you headed?</h2>
            <p className="mt-2 text-sm text-text-dim">
              Search rides published by coworkers going your way.
            </p>
          </div>
          {savedPlaces.length > 0 && (
  <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
    {savedPlaces.map((place) => (
      <button
        key={place.id}
        type="button"
        onClick={() => applySavedPlace(place)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-surface-alt/60 px-3.5 py-1.5 text-xs font-semibold text-text-dim transition-colors hover:border-violet-400/40 hover:text-violet-300"
      >
        <MapPin size={12} className="text-violet-400" />
        {place.name}
      </button>
    ))}
  </div>
)}

          <Card className="mt-8 p-6 sm:p-8">
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              {error && (
                <div role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div onFocus={() => setActiveField("pickup")}>
  <LocationAutocomplete
    key={`pickup-${pickup?.lat ?? "empty"}-${pickup?.lng ?? "empty"}`}
    label="Pickup location"
    placeholder="e.g. Koramangala, Bengaluru"
    defaultValue={pickup?.address}
    onSelect={(place) => {
      setPickup(place);
      setError("");
    }}
  />
</div>

              <button
                type="button"
                onClick={swapLocations}
                className="-my-1 flex items-center justify-center self-center text-text-faint transition-colors hover:text-violet-700"
                aria-label="Swap pickup and destination"
              >
                <ArrowLeftRight size={16} />
              </button>

              <div onFocus={() => setActiveField("destination")}>
  <LocationAutocomplete
    key={`destination-${destination?.lat ?? "empty"}-${destination?.lng ?? "empty"}`}
    label="Destination"
    placeholder="e.g. Whitefield, Bengaluru"
    defaultValue={destination?.address}
    onSelect={(place) => {
      setDestination(place);
      setError("");
    }}
  />
</div>

              <Button type="submit" className="mt-2 w-full justify-center">
                <Search size={17} />
                Search rides
              </Button>
            </form>
          </Card>
        </div>

        {/* Right: map */}
        <Card className="min-h-[420px] overflow-hidden p-0 lg:min-h-[560px]">
          <MapView
            pickup={pickup}
            destination={destination}
            activeField={activeField}
            onPick={handleMapPick}
          />
        </Card>
      </div>
    </AppShell>
  );
}

export default FindRide;