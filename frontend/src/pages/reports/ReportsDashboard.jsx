import { useEffect, useState } from "react";
import { Car, Clock3, MapPinned, Route as RouteIcon, TrendingUp, Wallet, ArrowRight } from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { getReportsOverview } from "../../services/report";
import { formatCurrency, formatDateTime } from "../../utils/formatDate";

const STATUS_TONE = {
  PUBLISHED: "success",
  STARTED: "violet",
  COMPLETED: "neutral",
  CANCELLED: "danger",
};

function ReportsDashboard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getReportsOverview()
      .then((data) => {
        if (active) setReport(data);
      })
      .catch((err) => {
        if (active) setError(err.message || "Could not load report data");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <AppShell title="Reports Dashboard">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="h-28 animate-pulse" />
          ))}
        </div>
      </AppShell>
    );
  }

  if (error || !report) {
    return (
      <AppShell title="Reports Dashboard">
        <Card className="px-6 py-16 text-center text-sm text-text-dim">
          {error || "No report data available yet."}
        </Card>
      </AppShell>
    );
  }

  const metrics = [
    {
      label: "Total trips",
      value: report.totalTrips,
      icon: RouteIcon,
      tone: "from-violet-600 to-purple-500",
      detail: `${report.completedTrips} completed`,
    },
    {
      label: "Distance covered",
      value: `${report.totalDistance.toFixed(1)} km`,
      icon: MapPinned,
      tone: "from-emerald-600 to-teal-500",
      detail: `${report.avgDistance.toFixed(1)} km avg/trip`,
    },
    {
      label: "Revenue generated",
      value: formatCurrency(report.totalRevenue),
      icon: Wallet,
      tone: "from-amber-500 to-orange-500",
      detail: `${report.payments.filter((p) => String(p?.status || "").toLowerCase() === "paid").length} paid payments`,
    },
    {
      label: "Active vehicles",
      value: report.activeVehicles,
      icon: Car,
      tone: "from-sky-600 to-cyan-500",
      detail: `${report.vehicles.length} registered`,
    },
  ];

  const recentTrips = [...report.trips]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  return (
    <AppShell title="Reports Dashboard">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, tone, detail }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-white`}>
                <Icon size={18} />
              </div>
              <TrendingUp size={16} className="text-text-faint" />
            </div>
            <p className="mt-5 text-sm text-text-dim">{label}</p>
            <p className="mt-2 font-display text-3xl font-bold">{value}</p>
            <p className="mt-2 text-xs text-text-faint">{detail}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Top routes</h3>
            <span className="text-xs text-text-faint">Based on published trips</span>
          </div>

          <div className="space-y-3">
            {report.topRoutes.length === 0 ? (
              <p className="text-sm text-text-dim">No trip data yet.</p>
            ) : (
              report.topRoutes.map(({ route, count }) => (
                <div key={route} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-alt/50 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text">{route}</p>
                  </div>
                  <Badge tone="neutral">{count} trips</Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Operational snapshot</h3>
            <Clock3 size={16} className="text-text-faint" />
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface-alt/50 p-3">
              <span className="text-text-dim">Completed rides</span>
              <span className="font-semibold text-text">{report.completedTrips}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface-alt/50 p-3">
              <span className="text-text-dim">Paid transactions</span>
              <span className="font-semibold text-text">{report.payments.filter((p) => String(p?.status || "").toLowerCase() === "paid").length}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface-alt/50 p-3">
              <span className="text-text-dim">Average trip distance</span>
              <span className="font-semibold text-text">{report.avgDistance.toFixed(1)} km</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface-alt/50 p-3">
              <span className="text-text-dim">Vehicle count</span>
              <span className="font-semibold text-text">{report.vehicles.length}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">Recent trips</h3>
          <span className="text-xs text-text-faint">Latest activity</span>
        </div>

        <Card className="overflow-hidden">
          {recentTrips.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-text-dim">No trips available yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentTrips.map((trip) => (
                <li key={trip.trip_id || trip.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text">
                      {trip.start_address || "Pickup"}
                      <ArrowRight size={12} className="mx-1 inline text-text-faint" />
                      {trip.dest_address || "Destination"}
                    </p>
                    <p className="mt-1 text-xs text-text-faint">
                      {trip.driver_name || "Driver"} · {formatDateTime(trip.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={STATUS_TONE[trip.status] || "neutral"}>{trip.status || "PUBLISHED"}</Badge>
                    <span className="text-sm font-medium text-violet-300">
                      {trip.distance_km != null ? `${trip.distance_km} km` : "—"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

export default ReportsDashboard;
