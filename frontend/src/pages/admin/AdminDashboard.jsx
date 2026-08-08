import { useEffect, useMemo } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Car,
  Building2,
  Activity,
  RefreshCw,
} from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useAdmin } from "./AdminContext";


function StatCard({ title, value, icon: Icon, description }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-dim">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {value}
          </h2>

          <p className="mt-1 text-xs text-text-faint">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-violet-500/10 p-3">
          <Icon
            size={22}
            className="text-violet-400"
          />
        </div>
      </div>
    </Card>
  );
}


function AdminDashboard() {
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
  }, []);


  const statistics = useMemo(() => {
    const totalEmployees = employees.length;

    const activeEmployees = employees.filter(
      (employee) => employee.isActive
    ).length;

    const inactiveEmployees =
      totalEmployees - activeEmployees;

    const totalVehicles = vehicles.length;

    return {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      totalVehicles,
    };
  }, [employees, vehicles]);


  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-text-dim">
          Loading dashboard...
        </p>
      </div>
    );
  }


  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-violet-400">
            Administration
          </p>

          <h1 className="font-display text-3xl font-bold">
            Admin Dashboard
          </h1>

          <p className="mt-1 text-sm text-text-dim">
            Manage your organization, employees and vehicles.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={loadDashboard}
        >
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>


      {/* Error */}
      {error && (
        <Card className="border-red-500/30 p-4">
          <p className="text-sm text-red-400">
            {error}
          </p>
        </Card>
      )}


      {/* Organization */}
      <Card className="p-5">
        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-violet-500/10 p-3">
            <Building2
              size={22}
              className="text-violet-400"
            />
          </div>

          <div>
            <p className="text-xs text-text-faint">
              Organization
            </p>

            <h2 className="font-display text-lg font-bold">
              {organization?.name ||
                organization?.organization?.name ||
                "Organization"}
            </h2>
          </div>

        </div>
      </Card>


      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          title="Total Employees"
          value={statistics.totalEmployees}
          icon={Users}
          description="Registered employees"
        />

        <StatCard
          title="Active Employees"
          value={statistics.activeEmployees}
          icon={UserCheck}
          description="Active accounts"
        />

        <StatCard
          title="Inactive Employees"
          value={statistics.inactiveEmployees}
          icon={UserX}
          description="Access disabled"
        />

        <StatCard
          title="Vehicles"
          value={statistics.totalVehicles}
          icon={Car}
          description="Organization vehicles"
        />

      </div>


      {/* Management Overview */}
      <div className="grid gap-5 lg:grid-cols-2">

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Users
              size={20}
              className="text-violet-400"
            />

            <div>
              <h2 className="font-display font-bold">
                Employee Management
              </h2>

              <p className="text-xs text-text-dim">
                Manage employee records and access.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">

            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-xs text-text-faint">
                Total
              </p>

              <p className="mt-1 text-2xl font-bold">
                {statistics.totalEmployees}
              </p>
            </div>

            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-xs text-text-faint">
                Active
              </p>

              <p className="mt-1 text-2xl font-bold">
                {statistics.activeEmployees}
              </p>
            </div>

          </div>
        </Card>


        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Car
              size={20}
              className="text-violet-400"
            />

            <div>
              <h2 className="font-display font-bold">
                Vehicle Management
              </h2>

              <p className="text-xs text-text-dim">
                Monitor your organization's vehicles.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-white/5 p-4">
            <p className="text-xs text-text-faint">
              Total Vehicles
            </p>

            <p className="mt-1 text-2xl font-bold">
              {statistics.totalVehicles}
            </p>
          </div>
        </Card>

      </div>


      {/* Engagement */}
      <Card className="p-5">

        <div className="flex items-center gap-3">

          <Activity
            size={20}
            className="text-violet-400"
          />

          <div>
            <h2 className="font-display font-bold">
              Employee Engagement
            </h2>

            <p className="text-xs text-text-dim">
              Employee activity overview.
            </p>
          </div>

        </div>

        <div className="mt-5 rounded-xl bg-white/5 p-4">

          {engagement ? (
            <pre className="overflow-auto text-xs text-text-dim">
              {JSON.stringify(
                engagement,
                null,
                2
              )}
            </pre>
          ) : (
            <p className="text-sm text-text-faint">
              No engagement data available.
            </p>
          )}

        </div>

      </Card>

    </div>
  );
}

export default AdminDashboard;