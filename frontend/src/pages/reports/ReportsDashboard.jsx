import { useEffect, useMemo, useState, useId } from "react";
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

// Shared plot geometry for both charts below — a sketchbook-style "paper"
// panel (warm off-white, faint dot grid) sitting inside the app's normal
// white Card, so the charts read as hand-drafted without breaking the
// rest of the light theme.
const CHART_W = 640;
const CHART_H = 220;
const PAD = { top: 16, right: 16, bottom: 26, left: 42 };
const PLOT_W = CHART_W - PAD.left - PAD.right;
const PLOT_H = CHART_H - PAD.top - PAD.bottom;

const PAPER_STYLE = {
  backgroundColor: "#fbf8f0",
  backgroundImage: "radial-gradient(rgba(36,28,53,0.14) 1px, transparent 1px)",
  backgroundSize: "13px 13px",
};

function ChartHeader({ title, subtitle, icon: Icon, readout }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/12 text-violet-700">
          <Icon size={18} />
        </div>
        <div>
          <h3 className="font-display font-bold">{title}</h3>
          <p className="text-xs text-text-dim">{subtitle}</p>
        </div>
      </div>
      {readout && (
        <div className="text-right">
          <p className="text-[11px] text-text-faint">{readout.label}</p>
          <p className="text-sm font-semibold text-text">{readout.value}</p>
        </div>
      )}
    </div>
  );
}

// A real line chart — single trend line + point markers, hand-drafted
// "graph paper" panel, hover crosshair.
function SketchLineChart({ title, subtitle, icon: Icon, data, formatValue, formatTick = formatValue, lineColor }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const max = Math.max(...data.map((d) => d.value), 1) * 1.15;
  const n = data.length;

  function xAt(i) {
    return PAD.left + (n > 1 ? (PLOT_W / (n - 1)) * i : PLOT_W / 2);
  }
  function yFor(v) {
    return PAD.top + PLOT_H - (v / max) * PLOT_H;
  }

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const points = data.map((d, i) => `${xAt(i)},${yFor(d.value)}`).join(" ");
  const active = hoverIndex != null ? data[hoverIndex] : null;
  const latest = data[data.length - 1];

  return (
    <Card className="overflow-hidden p-0">
      <ChartHeader
        title={title}
        subtitle={subtitle}
        icon={Icon}
        readout={
          data.length > 0 && {
            label: active ? active.label : "Latest",
            value: formatValue((active || latest)?.value || 0),
          }
        }
      />

      {data.length === 0 ? (
        <p className="px-5 pb-5 text-sm text-text-faint">Not enough data yet.</p>
      ) : (
        <div className="mx-5 mb-5 rounded-2xl border border-[#e7ddc4] p-3" style={PAPER_STYLE}>
          <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full touch-none select-none" role="img" aria-label={title}>
            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={PAD.left}
                  x2={CHART_W - PAD.right}
                  y1={yFor(t)}
                  y2={yFor(t)}
                  stroke="rgba(36,28,53,0.14)"
                  strokeWidth="1"
                />
                <text x={PAD.left - 8} y={yFor(t) + 3} textAnchor="end" fontSize="10" fill="rgba(36,28,53,0.5)">
                  {formatTick(t)}
                </text>
              </g>
            ))}

            {active && (
              <line
                x1={xAt(hoverIndex)}
                x2={xAt(hoverIndex)}
                y1={PAD.top}
                y2={CHART_H - PAD.bottom}
                stroke="rgba(124,58,237,0.35)"
                strokeWidth="1.5"
                strokeDasharray="3,3"
              />
            )}

            <polyline points={points} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {data.map((d, i) => (
              <circle
                key={`${d.label}-${i}`}
                cx={xAt(i)}
                cy={yFor(d.value)}
                r={hoverIndex === i ? 5.5 : 3.5}
                fill="#fbf8f0"
                stroke={lineColor}
                strokeWidth="2.5"
              />
            ))}

            {data.map((d, i) => (
              <text key={`${d.label}-${i}`} x={xAt(i)} y={CHART_H - 6} textAnchor="middle" fontSize="10" fill="rgba(36,28,53,0.55)">
                {d.shortLabel}
              </text>
            ))}

            {data.map((d, i) => (
              <rect
                key={`${d.label}-${i}`}
                x={n > 1 ? xAt(i) - PLOT_W / (n - 1) / 2 : PAD.left}
                y={0}
                width={n > 1 ? PLOT_W / (n - 1) : PLOT_W}
                height={CHART_H}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                className="cursor-pointer"
              />
            ))}
          </svg>
        </div>
      )}
    </Card>
  );
}

// A real bar chart — single solid bars (no stacking) with a hand-drawn
// diagonal hatch fill, on the same graph-paper panel as the line chart.
function SketchBarChart({ title, subtitle, icon: Icon, data, formatValue, formatTick = formatValue, barColor }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const hatchId = useId();
  const max = Math.max(...data.map((d) => d.value), 1) * 1.15;
  const n = data.length;
  const band = n ? PLOT_W / n : PLOT_W;

  function xCenter(i) {
    return PAD.left + band * i + band / 2;
  }
  function yFor(v) {
    return PAD.top + PLOT_H - (v / max) * PLOT_H;
  }

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const active = hoverIndex != null ? data[hoverIndex] : null;
  const top = data.reduce((best, d) => (d.value > (best?.value ?? -Infinity) ? d : best), data[0]);

  return (
    <Card className="overflow-hidden p-0">
      <ChartHeader
        title={title}
        subtitle={subtitle}
        icon={Icon}
        readout={
          data.length > 0 && {
            label: active ? active.label : "Highest",
            value: formatValue((active || top)?.value || 0),
          }
        }
      />

      {data.length === 0 ? (
        <p className="px-5 pb-5 text-sm text-text-faint">Not enough data yet.</p>
      ) : (
        <>
          <div className="mx-5 rounded-2xl border border-[#e7ddc4] p-3" style={PAPER_STYLE}>
            <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full touch-none select-none" role="img" aria-label={title}>
              <defs>
                <pattern id={hatchId} patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">
                  <rect width="7" height="7" fill={barColor} fillOpacity="0.18" />
                  <line x1="0" y1="0" x2="0" y2="7" stroke={barColor} strokeWidth="2.5" />
                </pattern>
              </defs>

              {ticks.map((t) => (
                <g key={t}>
                  <line
                    x1={PAD.left}
                    x2={CHART_W - PAD.right}
                    y1={yFor(t)}
                    y2={yFor(t)}
                    stroke="rgba(36,28,53,0.14)"
                    strokeWidth="1"
                  />
                  <text x={PAD.left - 8} y={yFor(t) + 3} textAnchor="end" fontSize="10" fill="rgba(36,28,53,0.5)">
                    {formatTick(t)}
                  </text>
                </g>
              ))}

              {data.map((d, i) => {
                const barW = band * 0.5;
                const x = xCenter(i) - barW / 2;
                const y = yFor(d.value);
                const h = CHART_H - PAD.bottom - y;
                return (
                  <rect
                    key={`${d.label}-${i}`}
                    x={x}
                    y={y}
                    width={barW}
                    height={h}
                    fill={`url(#${hatchId})`}
                    stroke={barColor}
                    strokeWidth={hoverIndex === i ? 2.5 : 1.5}
                  />
                );
              })}

              {data.map((d, i) => (
                <text key={`${d.label}-${i}`} x={xCenter(i)} y={CHART_H - 6} textAnchor="middle" fontSize="10" fill="rgba(36,28,53,0.55)">
                  {d.shortLabel}
                </text>
              ))}

              {data.map((d, i) => (
                <rect
                  key={`${d.label}-${i}`}
                  x={PAD.left + band * i}
                  y={0}
                  width={band}
                  height={CHART_H}
                  fill="transparent"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                  className="cursor-pointer"
                />
              ))}
            </svg>
          </div>

          {/* Legend — full route names, since the chart only fits #rank labels */}
          <div className="mx-5 mt-3 mb-5 flex flex-col gap-1">
            {data.map((d, i) => (
              <div
                key={`${d.label}-${i}`}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                className={`flex items-center justify-between gap-3 rounded-lg px-2 py-1 text-xs transition-colors ${
                  hoverIndex === i ? "bg-black/[0.03]" : ""
                }`}
              >
                <span className="flex min-w-0 items-center gap-1.5 truncate text-text-dim">
                  <span className="shrink-0 font-mono text-[10px] text-text-faint">{d.shortLabel}</span>
                  <span className="truncate">{d.label}</span>
                </span>
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
          <SketchLineChart
            title="Fuel efficiency"
            subtitle="Estimated fleet average, km/l per month"
            icon={Fuel}
            data={fuelChartData}
            formatValue={(v) => `${v.toFixed(1)} km/l`}
            formatTick={(v) => v.toFixed(0)}
            lineColor="#7c3aed"
          />
          <SketchBarChart
            title="Costliest trips"
            subtitle="Highest fare-per-seat trips published"
            icon={IndianRupee}
            data={costliestData}
            formatValue={(v) => formatCurrency(v)}
            formatTick={(v) => `₹${Math.round(v)}`}
            barColor="#d97706"
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
