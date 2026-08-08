import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Car, Wallet, MapPin, Navigation, Route as RouteIcon, ArrowRight, Users } from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../hooks/useAuth";
import { assets } from "../../assets/assets";
import { getVehicles } from "../../services/vehicle";
import { getMyPayments } from "../../services/payment";
import { getAllTrips } from "../../services/trip";
import { PAYMENT_PURPOSE } from "../../utils/constants";
import { formatCurrency, formatDateTime } from "../../utils/formatDate";

const QUICK_ACTIONS = [
  { to: "/rides/find", label: "Find a Ride", icon: MapPin, tone: "from-violet-600 to-purple-500" },
  { to: "/rides/offer", label: "Offer a Ride", icon: Navigation, tone: "from-violet-500 to-purple-500" },
  { to: "/vehicle", label: "My Vehicle", icon: Car, tone: "from-purple-600 to-fuchsia-500" },
  { to: "/wallet", label: "Wallet", icon: Wallet, tone: "from-violet-600 to-purple-500" },
];

const STATUS_TONE = {
  active: "success",
  PUBLISHED: "success",
  full: "warning",
  cancelled: "danger",
  CANCELLED: "danger",
  completed: "neutral",
  COMPLETED: "neutral",
  expired: "neutral",
};

function Dashboard() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [payments, setPayments] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getVehicles(), getMyPayments(), getAllTrips()]).then(([v, p, t]) => {
      if (!active) return;
      if (v.status === "fulfilled") setVehicles(v.value);
      if (p.status === "fulfilled") setPayments(p.value);
      if (t.status === "fulfilled") setTrips(t.value);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const balance = payments
    .filter((p) => p.status === "paid" && p.purpose === PAYMENT_PURPOSE.walletTopup)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const recentTrips = [...trips]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <AppShell title="Dashboard">
      <div className="animate-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-purple-600 p-6 text-white shadow-[0_20px_45px_rgba(124,58,237,0.25)] sm:p-8">
        <div aria-hidden="true" className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-purple-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={user?.image || assets.user_profile}
              alt=""
              className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-white/40"
            />
            <div>
              <h2 className="font-display text-xl font-bold sm:text-2xl">Hey {firstName}, ready??</h2>
              <p className="mt-1 text-sm text-violet-100/80">Here's what's happening with your commute.</p>
            </div>
          </div>
         <Link
  to="/rides/find"
  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
  <MapPin size={16} />
  Find a ride
</Link>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-400/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-700">
              <Car size={19} />
            </div>
            <p className="text-sm font-medium text-text-dim">My Vehicles</p>
          </div>
          <p className="mt-4 font-display text-3xl font-bold">{loading ? "—" : vehicles.length}</p>
        </Card>
        <Card className="p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700">
              <Wallet size={19} />
            </div>
            <p className="text-sm font-medium text-text-dim">Wallet Balance</p>
          </div>
          <p className="mt-4 font-display text-3xl font-bold">{loading ? "—" : formatCurrency(balance)}</p>
        </Card>
        <Card className="p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-400/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-700">
              <RouteIcon size={19} />
            </div>
            <p className="text-sm font-medium text-text-dim">Published Trips</p>
          </div>
          <p className="mt-4 font-display text-3xl font-bold">{loading ? "—" : trips.length}</p>
        </Card>
      </div>

      <div className="mt-9">
        <h3 className="font-display text-base font-bold">Quick actions</h3>
        <div className="mt-4 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          {QUICK_ACTIONS.map(({ to, label, icon: Icon, tone }) => (
            <Link
              key={to}
              to={to}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-all duration-200 hover:-translate-y-1 hover:border-violet-400/30"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-white`}>
                <Icon size={18} />
              </div>
              <span className="text-sm font-semibold">{label}</span>
              <ArrowRight size={14} className="text-text-faint transition-transform group-hover:translate-x-1 group-hover:text-violet-700" />
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-9">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold">Recent trips</h3>
          <Link to="/trips" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
            View all
          </Link>
        </div>

        <Card className="mt-4 overflow-hidden">
          {loading ? (
            <p className="px-6 py-10 text-center text-sm text-text-dim">Loading trips…</p>
          ) : recentTrips.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <Users size={28} className="text-text-faint" />
              <p className="text-sm text-text-dim">No trips published yet.</p>
              <Link to="/rides/offer" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
                Offer your first ride
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentTrips.map((trip) => (
                <li
                  key={trip.trip_id || trip.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors duration-150 hover:bg-black/[0.02]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/12 text-violet-700">
                      <RouteIcon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {trip.start_address || "Pickup"} <ArrowRight size={12} className="mx-1 inline text-text-faint" /> {trip.dest_address || "Destination"}
                      </p>
                      <p className="mt-1 text-xs text-text-faint">
                        {trip.driver_name} · {formatDateTime(trip.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge tone={STATUS_TONE[trip.status] || "neutral"}>{trip.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

export default Dashboard;
