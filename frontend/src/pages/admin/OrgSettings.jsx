import { useEffect, useState } from "react";
import { Building2, Save, CheckCircle } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import { useAdmin } from "./AdminContext";
import AdminShell from "./AdminShell";

const EMPTY_FORM = {
  name: "",
  fuelCostPerLitre: "",
  avgFuelEfficiencyKmpl: "",
  baseFare: "",
  costPerKm: "",
  fuelRateFactor: "",
};

function toForm(organization) {
  if (!organization) return EMPTY_FORM;

  return {
    name: organization.name ?? "",
    fuelCostPerLitre: organization.fuelCostPerLitre ?? "",
    avgFuelEfficiencyKmpl: organization.avgFuelEfficiencyKmpl ?? "",
    baseFare: organization.fareConfig?.baseFare ?? "",
    costPerKm: organization.fareConfig?.costPerKm ?? "",
    fuelRateFactor: organization.fareConfig?.fuelRateFactor ?? "",
  };
}

function OrgSettings() {
  const { organization, loading, error, fetchOrganization, updateOrganization } = useAdmin();

  const [form, setForm] = useState(EMPTY_FORM);
  const [loadedOrgId, setLoadedOrgId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchOrganization();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync the form from freshly fetched organization data without an extra
  // render pass (see https://react.dev/learn/you-might-not-need-an-effect).
  if (organization && organization._id !== loadedOrgId) {
    setLoadedOrgId(organization._id);
    setForm(toForm(organization));
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaveError("");
    setSaving(true);

    try {
      await updateOrganization({
        name: form.name.trim(),
        fuelCostPerLitre: Number(form.fuelCostPerLitre),
        avgFuelEfficiencyKmpl: Number(form.avgFuelEfficiencyKmpl),
        fareConfig: {
          baseFare: Number(form.baseFare),
          costPerKm: Number(form.costPerKm),
          fuelRateFactor: Number(form.fuelRateFactor),
        },
      });

      setSaved(true);
    } catch (err) {
      setSaveError(err.message || "Unable to save organization settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell title="Organization Settings">
      <div className="space-y-6">

        <div>
          <p className="text-sm text-violet-700">Administration</p>
          <h1 className="font-display text-3xl font-bold">Organization Settings</h1>
          <p className="mt-1 text-sm text-text-dim">
            Configure fuel cost, efficiency and fare calculation for your organization.
          </p>
        </div>

        {error && (
          <Card className="border-red-500/30 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        )}

        {loading && !organization ? (
          <Card className="px-6 py-16 text-center text-sm text-text-dim">
            Loading organization...
          </Card>
        ) : (
          <Card className="p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-violet-500/10 p-3">
                <Building2 size={22} className="text-violet-700" />
              </div>
              <div>
                <h2 className="font-display font-bold">{organization?.name || "Organization"}</h2>
                <p className="text-xs text-text-dim">Operational cost configuration</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {saveError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700"
                >
                  {saveError}
                </div>
              )}

              {saved && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
                  <CheckCircle size={16} />
                  Settings saved successfully.
                </div>
              )}

              <FormField
                label="Organization Name"
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Fuel Cost per Litre"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.fuelCostPerLitre}
                  onChange={(e) => update("fuelCostPerLitre", e.target.value)}
                />

                <FormField
                  label="Avg Fuel Efficiency (km/l)"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.avgFuelEfficiencyKmpl}
                  onChange={(e) => update("avgFuelEfficiencyKmpl", e.target.value)}
                />
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-text">Fare Configuration</p>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    label="Base Fare"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form.baseFare}
                    onChange={(e) => update("baseFare", e.target.value)}
                  />

                  <FormField
                    label="Cost per Km"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form.costPerKm}
                    onChange={(e) => update("costPerKm", e.target.value)}
                  />

                  <FormField
                    label="Fuel Rate Factor"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form.fuelRateFactor}
                    onChange={(e) => update("fuelRateFactor", e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" loading={saving}>
                <Save size={16} />
                Save Settings
              </Button>
            </form>
          </Card>
        )}

      </div>
    </AdminShell>
  );
}

export default OrgSettings;
