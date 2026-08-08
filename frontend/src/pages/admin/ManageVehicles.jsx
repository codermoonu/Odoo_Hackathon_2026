import { useEffect, useState } from "react";
import { Car, ShieldCheck, ShieldOff } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { useAdmin } from "./AdminContext";
import AdminShell from "./AdminShell";

function ManageVehicles() {
  const { vehicles, loading, error, fetchVehicles, setVehicleStatus } = useAdmin();
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleStatus(vehicle) {
    setBusyId(vehicle._id);

    try {
      await setVehicleStatus(vehicle._id, !vehicle.isActive);
    } catch {
      // fetchVehicles already re-syncs state after the request settles.
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminShell title="Manage Vehicles">
      <div className="space-y-6">

        <div>
          <p className="text-sm text-violet-700">Administration</p>
          <h1 className="font-display text-3xl font-bold">Vehicles</h1>
          <p className="mt-1 text-sm text-text-dim">
            Oversee registered vehicles across your organization.
          </p>
        </div>

        {error && (
          <Card className="border-red-500/30 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        )}

        <Card className="overflow-hidden">
          {loading ? (
            <p className="px-6 py-10 text-center text-sm text-text-dim">Loading vehicles...</p>
          ) : vehicles.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <Car size={28} className="text-text-faint" />
              <p className="text-sm text-text-dim">No vehicles registered yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {vehicles.map((vehicle) => (
                <li
                  key={vehicle._id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text">
                      {vehicle.make ? `${vehicle.make} ` : ""}
                      {vehicle.model}
                      {" · "}
                      {vehicle.registrationNumber}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-text-faint">
                      {vehicle.owner?.name || "Unassigned"}
                      {vehicle.owner?.email ? ` (${vehicle.owner.email})` : ""}
                      {" · "}
                      {vehicle.seatingCapacity} seats
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge tone={vehicle.isActive ? "success" : "danger"}>
                      {vehicle.isActive ? "Active" : "Suspended"}
                    </Badge>

                    <Button
                      variant={vehicle.isActive ? "danger" : "secondary"}
                      loading={busyId === vehicle._id}
                      onClick={() => toggleStatus(vehicle)}
                    >
                      {vehicle.isActive ? (
                        <ShieldOff size={16} />
                      ) : (
                        <ShieldCheck size={16} />
                      )}
                      {vehicle.isActive ? "Suspend" : "Reinstate"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

      </div>
    </AdminShell>
  );
}

export default ManageVehicles;
