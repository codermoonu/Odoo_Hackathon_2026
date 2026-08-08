import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Play, CheckCircle2, XCircle, Route as RouteIcon } from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { getAllTrips, updateTripStatus } from "../../services/trip";
import { formatCurrency, formatDateTime } from "../../utils/formatDate";

const STATUS_TONE = {
  PUBLISHED: "success",
  STARTED: "violet",
  COMPLETED: "neutral",
  CANCELLED: "danger",
};

const TABS = [
  { key: "mine", label: "Published by me" },
  { key: "all", label: "All trips" },
];

function MyTrips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState("mine");
  const [updatingId, setUpdatingId] = useState(null);

  function load() {
    getAllTrips()
      .then(setTrips)
      .catch((err) => setLoadError(err.message || "Could not load trips"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const visible = [...trips]
    .filter((t) => (tab === "mine" ? t.driver && String(t.driver) === String(user?.id) : true))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  async function handleStatusChange(trip, status) {
    const id = trip.trip_id || trip.id;
    setUpdatingId(id);
    try {
      const updated = await updateTripStatus(id, status);
      setTrips((ts) => ts.map((t) => ((t.trip_id || t.id) === id ? { ...t, ...updated } : t)));
    } catch (err) {
      setLoadError(err.message || "Could not update trip status");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <AppShell title="My Trips">
      <div className="mb-6 flex gap-1 rounded-xl border border-border bg-surface p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-violet-600 text-white" : "text-text-dim hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="h-24 animate-pulse" />
          ))}
        </div>
      ) : loadError ? (
        <Card className="px-6 py-14 text-center text-sm text-red-700">{loadError}</Card>
      ) : visible.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <RouteIcon size={28} className="text-text-faint" />
          <p className="text-sm text-text-dim">
            {tab === "mine" ? "You haven't published any trips yet." : "No trips have been published yet."}
          </p>
          <Link to="/rides/offer" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
            Offer a ride
          </Link>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((trip) => {
            const id = trip.trip_id || trip.id;
            const isUpdating = updatingId === id;
            return (
              <Card key={id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="flex items-center gap-1.5 text-sm font-semibold">
                      <MapPin size={13} className="text-violet-600" />
                      {trip.start_address}
                      <ArrowRight size={13} className="text-text-faint" />
                      {trip.dest_address}
                    </p>
                    <Badge tone={STATUS_TONE[trip.status] || "neutral"}>{trip.status}</Badge>
                  </div>
                  <p className="mt-1.5 text-xs text-text-faint">
                    {trip.driver_name} · {trip.available_seats} seats · {formatCurrency(trip.fare_per_seat)}/seat ·{" "}
                    {formatDateTime(trip.createdAt)}
                  </p>
                </div>

                {tab === "mine" && (
                  <div className="flex shrink-0 gap-2">
                    {trip.status === "PUBLISHED" && (
                      <>
                        <Button
                          variant="secondary"
                          loading={isUpdating}
                          onClick={() => handleStatusChange(trip, "STARTED")}
                        >
                          <Play size={14} />
                          Start
                        </Button>
                        <Button variant="danger" loading={isUpdating} onClick={() => handleStatusChange(trip, "CANCELLED")}>
                          <XCircle size={14} />
                          Cancel
                        </Button>
                      </>
                    )}
                    {trip.status === "STARTED" && (
                      <Button loading={isUpdating} onClick={() => handleStatusChange(trip, "COMPLETED")}>
                        <CheckCircle2 size={14} />
                        Complete
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

export default MyTrips;
