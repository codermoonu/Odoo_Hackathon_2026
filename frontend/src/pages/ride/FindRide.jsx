import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeftRight } from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LocationAutocomplete from "../../components/ride/LocationAutocomplete";
import { assets } from "../../assets/assets";

function FindRide() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!pickup.trim() && !destination.trim()) {
      setError("Enter a pickup or destination to search");
      return;
    }
    const params = new URLSearchParams();
    if (pickup.trim()) params.set("pickup", pickup.trim());
    if (destination.trim()) params.set("destination", destination.trim());
    navigate(`/rides/available?${params.toString()}`);
  }

  return (
    <AppShell title="Find a Ride">
      <div className="mx-auto max-w-2xl">
        <div className="animate-fade-up text-center">
          <img src={assets.car_icon} alt="" className="mx-auto h-12 w-12 opacity-90" />
          <h2 className="mt-4 font-display text-2xl font-bold">Where are you headed?</h2>
          <p className="mt-2 text-sm text-text-dim">
            Search rides published by coworkers going your way.
          </p>
        </div>

        <Card className="mt-8 p-6 sm:p-8">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {error && (
              <div role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <LocationAutocomplete
              label="Pickup location"
              placeholder="e.g. Koramangala, Bengaluru"
              onSelect={(place) => {
                setPickup(place.address);
                setError("");
              }}
            />

            <div className="-my-1 flex items-center justify-center text-text-faint">
              <ArrowLeftRight size={16} />
            </div>

            <LocationAutocomplete
              label="Destination"
              placeholder="e.g. Whitefield, Bengaluru"
              onSelect={(place) => {
                setDestination(place.address);
                setError("");
              }}
            />

            <Button type="submit" className="mt-2 w-full justify-center">
              <Search size={17} />
              Search rides
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

export default FindRide;
