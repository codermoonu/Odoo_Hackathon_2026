import { useState } from "react";
import { Home, Briefcase, MapPin, Plus, Pencil, Trash2, Bookmark } from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { FormField, SelectField } from "../../components/ui/FormField";
import LocationAutocomplete from "../../components/ride/LocationAutocomplete";
import { useSavedPlaces } from "../../hooks/useSavedPlaces";

function getIcon(kind) {
  if (kind === "home") return Home;
  if (kind === "work") return Briefcase;
  return MapPin;
}

function SavedPlaces() {
  const { places, loading, upsertPlace, removePlace } = useSavedPlaces();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", address: "", lat: null, lng: null, kind: "other" });
  const [error, setError] = useState("");

  function resetForm() {
    setForm({ name: "", address: "", lat: null, lng: null, kind: "other" });
    setEditingId(null);
    setError("");
  }

  function openCreateModal() {
    resetForm();
    setModalOpen(true);
  }

  function openEditModal(place) {
    setEditingId(place.id);
    setForm({ name: place.name, address: place.address, lat: place.lat, lng: place.lng, kind: place.kind || "other" });
    setError("");
    setModalOpen(true);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const name = form.name.trim();
    if (!name || !form.address.trim()) {
      setError("Name and address are required.");
      return;
    }
    if (form.lat == null || form.lng == null) {
      setError("Pick an address from the suggestions so we can save its exact location.");
      return;
    }

    upsertPlace(
      { name, address: form.address.trim(), lat: form.lat, lng: form.lng, kind: form.kind },
      editingId
    );

    setModalOpen(false);
    resetForm();
  }

  return (
    <AppShell title="Saved Places">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold">Quick access locations</h2>
            <p className="mt-1 text-sm text-text-dim">
              Save frequent pickup and drop-off points — they'll show up as quick shortcuts on Find a Ride.
            </p>
          </div>
          <Button onClick={openCreateModal} className="justify-center">
            <Plus size={16} />
            Add place
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Card key={i} className="h-24 animate-pulse" />
            ))}
          </div>
        ) : places.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <Bookmark size={28} className="text-text-faint" />
            <p className="text-sm text-text-dim">No saved places yet.</p>
            <Button variant="secondary" onClick={openCreateModal} className="justify-center">
              <Plus size={16} />
              Save your first place
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {places.map((place) => {
              const Icon = getIcon(place.kind);
              return (
                <Card key={place.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text">{place.name}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-text-dim">
                        <MapPin size={12} className="shrink-0 text-text-faint" />
                        <span className="truncate">{place.address}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button variant="secondary" onClick={() => openEditModal(place)} className="px-3 py-2.5">
                      <Pencil size={15} />
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => removePlace(place.id)} className="px-3 py-2.5">
                      <Trash2 size={15} />
                      Delete
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); resetForm(); }} title={editingId ? "Edit saved place" : "Add saved place"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <FormField
            label="Place name"
            placeholder="Home, Office, Airport"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />

          {/* key forces remount so the input resets when switching between edit targets */}
          <LocationAutocomplete
            key={editingId || "new"}
            label="Address"
            placeholder="e.g. Koramangala, Bengaluru"
            defaultValue={form.address}
            onSelect={(place) => {
              setForm((prev) => ({ ...prev, address: place.address, lat: place.lat, lng: place.lng }));
              setError("");
            }}
            required
          />

          <SelectField
            label="Type"
            value={form.kind}
            onChange={(e) => setForm((prev) => ({ ...prev, kind: e.target.value }))}
          >
            <option value="home">Home</option>
            <option value="work">Work</option>
            <option value="other">Other</option>
          </SelectField>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setModalOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button type="submit">{editingId ? "Save changes" : "Add place"}</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

export default SavedPlaces;