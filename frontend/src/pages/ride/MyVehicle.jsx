import { useEffect, useState } from "react";
import { Plus, Car, Pencil, Trash2, Users } from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { FormField } from "../../components/ui/FormField";
import { getVehicles, addVehicle, updateVehicle, deleteVehicle } from "../../services/vehicle";
import { createOrganization } from "../../services/admin";
import { useAuth } from "../../hooks/useAuth";

const EMPTY_FORM = { make: "", model: "", registrationNumber: "", seatingCapacity: "" };

function MyVehicle() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function loadVehicles() {
    getVehicles()
      .then(setVehicles)
      .catch((err) => setLoadError(err.message || "Could not load your vehicles"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  function openAddModal() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(vehicle) {
    setEditingId(vehicle._id);
    setForm({
      make: vehicle.make || "",
      model: vehicle.model,
      registrationNumber: vehicle.registrationNumber,
      seatingCapacity: vehicle.seatingCapacity,
    });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError("");
    if (!form.model.trim() || !form.registrationNumber.trim() || !form.seatingCapacity) {
      setFormError("Model, registration number and seating capacity are required");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, seatingCapacity: Number(form.seatingCapacity) };
      if (editingId) {
        const updated = await updateVehicle(editingId, payload);
        setVehicles((vs) => vs.map((v) => (v._id === editingId ? updated : v)));
      } else {
        let created;
        try {
          created = await addVehicle(payload);
        } catch (err) {
          // First vehicle for a brand-new account: bootstrap a personal
          // organization (this also promotes the user to its admin) and retry once.
          if (!err.message?.includes("organization")) throw err;
          await createOrganization({ name: `${user?.name || "My"}'s Team` });
          created = await addVehicle(payload);
        }
        setVehicles((vs) => [created, ...vs]);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message || "Could not save this vehicle");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteVehicle(deleteTarget._id);
      setVehicles((vs) => vs.filter((v) => v._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setLoadError(err.message || "Could not delete this vehicle");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AppShell
      title="My Vehicle"
      actions={
        <Button onClick={openAddModal} className="hidden sm:inline-flex">
          <Plus size={16} />
          Add vehicle
        </Button>
      }
    >
      <Button onClick={openAddModal} className="mb-5 w-full justify-center sm:hidden">
        <Plus size={16} />
        Add vehicle
      </Button>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <Card key={i} className="h-36 animate-pulse" />
          ))}
        </div>
      ) : loadError ? (
        <Card className="px-6 py-14 text-center text-sm text-red-300">{loadError}</Card>
      ) : vehicles.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <Car size={30} className="text-text-faint" />
          <div>
            <h2 className="font-display text-lg font-bold">No vehicles yet</h2>
            <p className="mt-1 max-w-xs text-sm text-text-dim">
              Register a vehicle so you can start offering rides to coworkers.
            </p>
          </div>
          <Button onClick={openAddModal}>
            <Plus size={16} />
            Add your first vehicle
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {vehicles.map((v) => (
            <Card key={v._id} className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                    <Car size={20} />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {v.make} {v.model}
                    </p>
                    <p className="text-xs text-text-faint">{v.registrationNumber}</p>
                  </div>
                </div>
                <Badge tone={v.isActive === false ? "neutral" : "success"}>
                  {v.isActive === false ? "Inactive" : "Active"}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-text-dim">
                <Users size={15} className="text-violet-400" />
                {v.seatingCapacity} seats
              </div>

              <div className="mt-1 flex gap-2 border-t border-border pt-4">
                <Button variant="secondary" className="flex-1 justify-center" onClick={() => openEditModal(v)}>
                  <Pencil size={15} />
                  Edit
                </Button>
                <Button variant="danger" className="flex-1 justify-center" onClick={() => setDeleteTarget(v)}>
                  <Trash2 size={15} />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit vehicle" : "Add vehicle"}>
        <form onSubmit={handleSave} noValidate className="flex flex-col gap-4">
          {formError && (
            <div role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Make"
              value={form.make}
              onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
              placeholder="Toyota"
            />
            <FormField
              label="Model"
              required
              value={form.model}
              onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              placeholder="Camry"
            />
          </div>
          <FormField
            label="Registration number"
            required
            value={form.registrationNumber}
            onChange={(e) => setForm((f) => ({ ...f, registrationNumber: e.target.value }))}
            placeholder="KA-01-AB-1234"
          />
          <FormField
            label="Seating capacity"
            type="number"
            min={1}
            required
            value={form.seatingCapacity}
            onChange={(e) => setForm((f) => ({ ...f, seatingCapacity: e.target.value }))}
            placeholder="4"
          />
          <Button type="submit" loading={saving} className="mt-1 w-full justify-center">
            {editingId ? "Save changes" : "Add vehicle"}
          </Button>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete vehicle?">
        <p className="text-sm text-text-dim">
          This will permanently remove{" "}
          <span className="font-semibold text-text">
            {deleteTarget?.make} {deleteTarget?.model}
          </span>{" "}
          ({deleteTarget?.registrationNumber}). This can't be undone.
        </p>
        <div className="mt-5 flex gap-3">
          <Button variant="secondary" className="flex-1 justify-center" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1 justify-center" loading={deleting} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}

export default MyVehicle;
