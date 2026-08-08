import { useEffect, useMemo, useState } from "react";
import { Route as RouteIcon, MapPinned, IndianRupee, Car, Fuel, Wallet } from "lucide-react";
import AdminShell from "../admin/AdminShell";
import { useAdmin } from "../admin/AdminContext";
import Card from "../../components/ui/Card";
import { getAllTrips } from "../../services/trip";
import { formatCurrency } from "../../utils/formatDate";

function routeLabel(trip) {
  return `${trip.start_address?.split(",")[0] || "Pickup"} → ${trip.dest_address?.split(",")[0] || "Destination"}`;
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// Real-world city/highway mileage differs a lot by model — since Trip only
// stores a free-text "vehicle" string (no link to a Vehicle document), this
// gives each trip a plausible model-specific efficiency instead of treating
// the whole fleet as one flat number, so the monthly chart actually varies
// with which vehicles were on the road that month.
const VEHICLE_EFFICIENCY_KMPL = {
  swift: 19,
  i20: 17,
  nexon: 14,
  city: 16,
  innova: 12,
};

function estimateEfficiency(vehicleLabel, fallback) {
  const label = (vehicleLabel || "").toLowerCase();
  const match = Object.keys(VEHICLE_EFFICIENCY_KMPL).find((key) => label.includes(key));
  return match ? VEHICLE_EFFICIENCY_KMPL[match] : fallback;
}

function StatCard({ title, value, icon: Icon, description, tone }) {
  return (
    <Card className="p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-400/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-dim">{title}</p>
          <h2 className="mt-2 font-display text-3xl font-bold">{value}</h2>
          <p className="mt-1 text-xs text-text-faint">{description}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}

// A retro, blocky "equalizer" bar — square pixel segments instead of a smooth
// fill, built entirely from Tailwind utility classes (no SVG, no gradients).
const PIXEL_ROWS = 8;

function PixelBarChart({ title, subtitle, icon: Icon, data, formatValue, colorClass }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const max = Math.max(...data.map((d) => d.value), 1);
  const active = hoverIndex != null ? data[hoverIndex] : null;
  const peak = data.reduce((best, d) => (d.value > (best?.value ?? -Infinity) ? d : best), data[0]);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/12 text-violet-700">
            <Icon size={18} />
          </div>
          <div>
            <h3 className="font-display font-bold">{title}</h3>
            <p className="text-xs text-text-dim">{subtitle}</p>
          </div>
        </div>
        {data.length > 0 && (
          <div className="text-right">
            <p className="text-[11px] text-text-faint">{active ? active.label : "Peak"}</p>
            <p className="text-sm font-semibold text-text">{formatValue((active || peak)?.value || 0)}</p>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <p className="mt-5 text-sm text-text-faint">Not enough data yet.</p>
      ) : (
        <>
          <div className="mt-6 flex items-end justify-between gap-2 sm:gap-3">
            {data.map((d, i) => {
              const filled = Math.max(1, Math.round((d.value / max) * PIXEL_ROWS));
              const isActive = hoverIndex === i;
              return (
                <div
                  key={`${d.label}-${i}`}
                  className="flex flex-1 cursor-pointer flex-col items-center gap-2"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  <div className="flex flex-col-reverse gap-[3px]">
                    {Array.from({ length: PIXEL_ROWS }).map((_, row) => {
                      const isLit = row < filled;
                      return (
                        <div
                          key={row}
                          className={`h-3 w-5 sm:h-3.5 sm:w-7 ${isLit ? colorClass : "bg-black/[0.06]"} ${
                            isLit
                              ? "shadow-[inset_2px_2px_0_rgba(255,255,255,0.45),inset_-2px_-2px_0_rgba(0,0,0,0.4)]"
                              : "shadow-[inset_1px_1px_0_rgba(0,0,0,0.12),inset_-1px_-1px_0_rgba(255,255,255,0.5)]"
                          } ${isActive && isLit ? "scale-x-125 brightness-110" : ""} transition-transform duration-150`}
                        />
                      );
                    })}
                  </div>
                  <span className={`text-[10px] font-mono ${isActive ? "font-bold text-text" : "text-text-faint"}`}>
                    {d.shortLabel}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-1 border-t border-border pt-3">
            {data.map((d, i) => (
              <div
                key={`${d.label}-${i}`}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                className={`flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                  hoverIndex === i ? "bg-black/[0.03]" : ""
                }`}
              >
                <span className="truncate text-text-dim">{d.label}</span>
                <span className="shrink-0 font-semibold text-text">{formatValue(d.value)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

function ReportsDashboard() {
  const { organization, vehicles, fetchOrganization, fetchVehicles } = useAdmin();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([fetchOrganization(), fetchVehicles(), getAllTrips()])
      .then(([, , tripData]) => {
        if (active) setTrips(tripData);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const totalDistance = trips.reduce((sum, t) => sum + Number(t.distance_km || 0), 0);
    const completedTrips = trips.filter((t) => t.status === "COMPLETED").length;
    const totalRevenue = trips
      .filter((t) => t.status !== "CANCELLED")
      .reduce((sum, t) => sum + Number(t.fare_per_seat || 0), 0);
    const activeVehicles = vehicles.filter((v) => v.isActive !== false).length;
    return { totalDistance, completedTrips, totalRevenue, activeVehicles };
  }, [trips, vehicles]);

  // One pass over trips grouped by month — feeds both the fuel efficiency
  // chart and the financial summary table below.
  const monthlyStats = useMemo(() => {
    const fallback = Number(organization?.avgFuelEfficiencyKmpl) || 15;
    const fuelPrice = Number(organization?.fuelCostPerLitre) || 0;
    const buckets = new Map();

    trips.forEach((t) => {
      if (!t.createdAt) return;
      const date = new Date(t.createdAt);
      const key = monthKey(date);
      const entry = buckets.get(key) || { date, trips: 0, distance: 0, revenue: 0, litres: 0 };
      entry.trips += 1;
      entry.distance += Number(t.distance_km || 0);
      if (t.status !== "CANCELLED") {
        entry.revenue += Number(t.fare_per_seat || 0);
        const eff = estimateEfficiency(t.vehicle, fallback);
        entry.litres += eff > 0 ? Number(t.distance_km || 0) / eff : 0;
      }
      buckets.set(key, entry);
    });

    return [...buckets.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, entry]) => {
        const fuelCost = entry.litres * fuelPrice;
        return {
          key,
          label: entry.date.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
          shortLabel: entry.date.toLocaleDateString(undefined, { month: "short" }),
          trips: entry.trips,
          distance: entry.distance,
          revenue: entry.revenue,
          fuelCost,
          net: entry.revenue - fuelCost,
          efficiency: entry.litres > 0 ? entry.distance / entry.litres : fallback,
        };
      });
  }, [trips, organization]);

  const fuelChartData = useMemo(
    () => monthlyStats.map((m) => ({ label: m.label, shortLabel: m.shortLabel, value: Number(m.efficiency.toFixed(1)) })),
    [monthlyStats]
  );

  const costliestData = useMemo(
    () =>
      [...trips]
        .map((t) => ({ label: routeLabel(t), shortLabel: undefined, value: Number(t.fare_per_seat || 0) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6)
        .map((d, i) => ({ ...d, shortLabel: `#${i + 1}` })),
    [trips]
  );

  if (loading) {
    return (
      <AdminShell title="Reports">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="h-32 animate-pulse" />
          ))}
        </div>
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell title="Reports">
        <Card className="px-6 py-16 text-center text-sm text-red-700">{error}</Card>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Reports">
      <div className="space-y-6">
        <div>
          <p className="text-sm text-violet-700">Administration</p>
          <h1 className="font-display text-3xl font-bold">Reports</h1>
          <p className="mt-1 text-sm text-text-dim">
            Trip activity, cost and fuel insights for {organization?.name || "your organization"}.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total trips"
            value={trips.length}
            icon={RouteIcon}
            description={`${stats.completedTrips} completed`}
            tone="bg-violet-500/12 text-violet-700"
          />
          <StatCard
            title="Distance covered"
            value={`${stats.totalDistance.toFixed(1)} km`}
            icon={MapPinned}
            description={trips.length ? `${(stats.totalDistance / trips.length).toFixed(1)} km avg/trip` : "—"}
            tone="bg-emerald-500/12 text-emerald-700"
          />
          <StatCard
            title="Revenue generated"
            value={formatCurrency(stats.totalRevenue)}
            icon={IndianRupee}
            description="Across non-cancelled trips"
            tone="bg-amber-500/12 text-amber-700"
          />
          <StatCard
            title="Active vehicles"
            value={stats.activeVehicles}
            icon={Car}
            description={`${vehicles.length} registered`}
            tone="bg-sky-500/12 text-sky-700"
          />
        </div>

        {/* Two graphs */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <PixelBarChart
            title="Fuel efficiency"
            subtitle="Estimated fleet average, km/l per month"
            icon={Fuel}
            data={fuelChartData}
            formatValue={(v) => `${v.toFixed(1)} km/l`}
            colorClass="bg-violet-600"
          />
          <PixelBarChart
            title="Costliest trips"
            subtitle="Highest fare-per-seat trips published"
            icon={IndianRupee}
            data={costliestData}
            formatValue={(v) => formatCurrency(v)}
            colorClass="bg-amber-500"
          />
        </div>

        {/* Financial summary */}
        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/12 text-violet-700">
              <Wallet size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold">Financial summary</h3>
              <p className="text-xs text-text-dim">Revenue vs. estimated fuel cost, by month.</p>
            </div>
          </div>

          {monthlyStats.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-text-dim">No trip data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-text-faint">
                    <th className="px-5 py-3 font-medium">Month</th>
                    <th className="px-5 py-3 font-medium">Trips</th>
                    <th className="px-5 py-3 font-medium">Distance</th>
                    <th className="px-5 py-3 font-medium">Revenue</th>
                    <th className="px-5 py-3 font-medium">Est. fuel cost</th>
                    <th className="px-5 py-3 font-medium">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {monthlyStats.map((m) => (
                    <tr key={m.key}>
                      <td className="px-5 py-3.5 font-medium">{m.label}</td>
                      <td className="px-5 py-3.5 text-text-dim">{m.trips}</td>
                      <td className="px-5 py-3.5 text-text-dim">{m.distance.toFixed(1)} km</td>
                      <td className="px-5 py-3.5 font-semibold text-emerald-700">{formatCurrency(m.revenue)}</td>
                      <td className="px-5 py-3.5 text-red-700">{formatCurrency(m.fuelCost)}</td>
                      <td className={`px-5 py-3.5 font-semibold ${m.net >= 0 ? "text-text" : "text-red-700"}`}>
                        {formatCurrency(m.net)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-black/[0.02] font-semibold">
                    <td className="px-5 py-3.5">Total</td>
                    <td className="px-5 py-3.5">{monthlyStats.reduce((s, m) => s + m.trips, 0)}</td>
                    <td className="px-5 py-3.5">{monthlyStats.reduce((s, m) => s + m.distance, 0).toFixed(1)} km</td>
                    <td className="px-5 py-3.5 text-emerald-700">
                      {formatCurrency(monthlyStats.reduce((s, m) => s + m.revenue, 0))}
                    </td>
                    <td className="px-5 py-3.5 text-red-700">
                      {formatCurrency(monthlyStats.reduce((s, m) => s + m.fuelCost, 0))}
                    </td>
                    <td className="px-5 py-3.5">{formatCurrency(monthlyStats.reduce((s, m) => s + m.net, 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminShell>
  );
}

export default ReportsDashboard;
