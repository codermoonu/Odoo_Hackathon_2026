import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  Car,
  Building2,
  Activity,
  RefreshCw,
  ArrowRight,
  Clock,
  UserPlus,
} from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { useAdmin } from "./AdminContext";
import AdminShell from "./AdminShell";
import { formatDate } from "../../utils/formatDate";

const AVATAR_TONES = [
  "bg-violet-500/15 text-violet-700",
  "bg-emerald-500/15 text-emerald-700",
  "bg-amber-500/15 text-amber-700",
  "bg-fuchsia-500/15 text-fuchsia-700",
  "bg-sky-500/15 text-sky-700",
];

function toneForName(name) {
  const code = (name || "?").charCodeAt(0) || 0;
  return AVATAR_TONES[code % AVATAR_TONES.length];
}

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

function StatCard({ title, value, icon: Icon, description, tone = "violet" }) {
  const toneClasses = {
    violet: "bg-violet-500/12 text-violet-700",
    emerald: "bg-emerald-500/12 text-emerald-700",
    red: "bg-red-500/12 text-red-700",
  }[tone];

  return (
    <Card className="p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-400/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-dim">{title}</p>
          <h2 className="mt-2 font-display text-3xl font-bold">{value}</h2>
          <p className="mt-1 text-xs text-text-faint">{description}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClasses}`}>
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}

// A thin, rounded, part-to-whole meter — status color always reserved for
// what it represents (active = success, revoked/inactive = danger).
function SplitMeter({ segments, total }) {
  return (
    <div>
      <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-black/[0.05]">
        {segments.map((s) =>
          s.value > 0 ? (
            <div
              key={s.label}
              className={`h-full rounded-full ${s.fill}`}
              style={{ width: `${(s.value / Math.max(total, 1)) * 100}%` }}
            />
          ) : null
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {segments.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5 text-xs text-text-dim">
            <span className={`h-2 w-2 rounded-full ${s.dot}`} />
            {s.label} <span className="font-semibold text-text">{s.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const {
    organization,
    employees,
    vehicles,
    engagement,
    loading,
    error,
    loadDashboard,
  } = useAdmin();

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statistics = useMemo(() => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter((employee) => employee.isActive).length;
    const inactiveEmployees = totalEmployees - activeEmployees;

    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter((v) => v.isActive !== false).length;
    const inactiveVehicles = totalVehicles - activeVehicles;

    return {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      totalVehicles,
      activeVehicles,
      inactiveVehicles,
    };
  }, [employees, vehicles]);

  const recentEmployees = useMemo(
    () =>
      [...employees]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5),
    [employees]
  );

  const orgName = organization?.name || organization?.organization?.name || "Organization";

  if (loading) {
    return (
      <AdminShell title="Admin Dashboard">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="h-32 animate-pulse" />
          ))}
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Admin Dashboard">
      <div className="space-y-6">
        {/* Hero */}
        <div className="animate-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-purple-600 p-6 text-white shadow-[0_20px_45px_rgba(124,58,237,0.25)] sm:p-8">
          <div aria-hidden="true" className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-purple-300/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <Building2 size={26} />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-violet-100/80 uppercase">Administration</p>
                <h1 className="font-display text-xl font-bold sm:text-2xl">{orgName}</h1>
                <p className="mt-1 text-sm text-violet-100/80">Manage your organization, employees and vehicles.</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => navigate("/admin/settings")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Settings
                <ArrowRight size={15} />
              </button>
              <button
                onClick={loadDashboard}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <Card className="border-red-500/30 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Employees"
            value={statistics.totalEmployees}
            icon={Users}
            description="Registered employees"
            tone="violet"
          />
          <StatCard
            title="Active Employees"
            value={statistics.activeEmployees}
            icon={UserCheck}
            description="Active accounts"
            tone="emerald"
          />
          <StatCard
            title="Inactive Employees"
            value={statistics.inactiveEmployees}
            icon={UserX}
            description="Access disabled"
            tone="red"
          />
          <StatCard
            title="Vehicles"
            value={statistics.totalVehicles}
            icon={Car}
            description="Organization vehicles"
            tone="violet"
          />
        </div>

        {/* Management Overview */}
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/12 text-violet-700">
                  <Users size={18} />
                </div>
                <div>
                  <h2 className="font-display font-bold">Employee Access</h2>
                  <p className="text-xs text-text-dim">Who can currently use the platform.</p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => navigate("/admin/employees")}>
                Manage
                <ArrowRight size={16} />
              </Button>
            </div>

            <div className="mt-5">
              <SplitMeter
                total={statistics.totalEmployees}
                segments={[
                  { label: "Active", value: statistics.activeEmployees, fill: "bg-emerald-500", dot: "bg-emerald-500" },
                  { label: "Revoked", value: statistics.inactiveEmployees, fill: "bg-red-500", dot: "bg-red-500" },
                ]}
              />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/12 text-violet-700">
                  <Car size={18} />
                </div>
                <div>
                  <h2 className="font-display font-bold">Vehicle Fleet</h2>
                  <p className="text-xs text-text-dim">Active vs. suspended vehicles.</p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => navigate("/admin/vehicles")}>
                Manage
                <ArrowRight size={16} />
              </Button>
            </div>

            <div className="mt-5">
              <SplitMeter
                total={statistics.totalVehicles}
                segments={[
                  { label: "Active", value: statistics.activeVehicles, fill: "bg-emerald-500", dot: "bg-emerald-500" },
                  { label: "Suspended", value: statistics.inactiveVehicles, fill: "bg-red-500", dot: "bg-red-500" },
                ]}
              />
            </div>
          </Card>
        </div>

        {/* Engagement + Recent employees */}
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/12 text-violet-700">
                <Activity size={18} />
              </div>
              <div>
                <h2 className="font-display font-bold">Engagement</h2>
                <p className="text-xs text-text-dim">Login activity, last 7 days.</p>
              </div>
            </div>

            {engagement ? (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-black/[0.03] p-4">
                  <p className="text-xs text-text-faint">Active this week</p>
                  <p className="mt-1 font-display text-2xl font-bold text-emerald-700">
                    {engagement.activeInLast7Days}
                  </p>
                </div>
                <div className="rounded-xl bg-black/[0.03] p-4">
                  <p className="text-xs text-text-faint">Never logged in</p>
                  <p className="mt-1 font-display text-2xl font-bold text-text">
                    {engagement.neverLoggedIn}
                  </p>
                </div>
                <div className="rounded-xl bg-black/[0.03] p-4">
                  <p className="text-xs text-text-faint">Access granted</p>
                  <p className="mt-1 font-display text-2xl font-bold text-text">
                    {engagement.activeAccess}
                  </p>
                </div>
                <div className="rounded-xl bg-black/[0.03] p-4">
                  <p className="text-xs text-text-faint">Access revoked</p>
                  <p className="mt-1 font-display text-2xl font-bold text-text">
                    {engagement.revokedAccess}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm text-text-faint">No engagement data available.</p>
            )}
          </Card>

          <Card className="overflow-hidden lg:col-span-3">
            <div className="flex items-center justify-between gap-3 border-b border-border p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/12 text-violet-700">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h2 className="font-display font-bold">Recently Joined</h2>
                  <p className="text-xs text-text-dim">Newest members of your organization.</p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => navigate("/admin/employees")}>
                View all
              </Button>
            </div>

            {recentEmployees.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-text-dim">No employees yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentEmployees.map((employee) => (
                  <li key={employee._id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${toneForName(
                          employee.name
                        )}`}
                      >
                        {initials(employee.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{employee.name}</p>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-text-faint">
                          <Clock size={11} />
                          Joined {formatDate(employee.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge tone={employee.isActive ? "success" : "danger"}>
                      {employee.isActive ? "Active" : "Revoked"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}

export default AdminDashboard;
