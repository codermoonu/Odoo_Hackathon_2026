import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldOff,
  X,
  Mail,
  Lock,
  Phone,
  Badge as BadgeIcon,
  Car,
  Hash,
  Armchair,
} from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { FormField, SelectField } from "../../components/ui/FormField";
import { isValidEmail, isNonEmpty } from "../../utils/validators";
import { useAdmin } from "./AdminContext";
import AdminShell from "./AdminShell";

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  employeeId: "",
  gender: "",
  phone: "",
  vehicleMake: "",
  vehicleModel: "",
  vehicleRegistration: "",
  vehicleSeats: "",
};

function ManageEmployees() {
  const { employees, loading, error, fetchEmployees, addEmployee, setEmployeeAccess } =
    useAdmin();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setFormErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const next = {};

    if (!isNonEmpty(form.name)) next.name = "Name is required";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address";
    if (!isNonEmpty(form.password) || form.password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }

    // Vehicle details are optional as a whole, but once any field is
    // touched the ones the Vehicle model actually requires must be filled.
    const anyVehicleField = form.vehicleModel || form.vehicleRegistration || form.vehicleSeats;
    if (anyVehicleField) {
      if (!isNonEmpty(form.vehicleModel)) next.vehicleModel = "Model is required";
      if (!isNonEmpty(form.vehicleRegistration)) next.vehicleRegistration = "Registration number is required";
      if (!form.vehicleSeats) next.vehicleSeats = "Seating capacity is required";
    }

    setFormErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleAddEmployee(e) {
    e.preventDefault();
    setSubmitError("");
    setNotice(null);

    if (!validate()) return;

    setSubmitting(true);

    const vehicle =
      form.vehicleModel && form.vehicleRegistration && form.vehicleSeats
        ? {
            make: form.vehicleMake.trim() || undefined,
            model: form.vehicleModel.trim(),
            registrationNumber: form.vehicleRegistration.trim(),
            seatingCapacity: Number(form.vehicleSeats),
          }
        : undefined;

    try {
      const result = await addEmployee({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        employeeId: form.employeeId.trim() || undefined,
        gender: form.gender || undefined,
        phone: form.phone ? Number(form.phone) : undefined,
        vehicle,
      });

      setForm(EMPTY_FORM);
      setShowForm(false);

      if (result?.vehicleError) {
        setNotice({ tone: "warning", text: `Employee created, but vehicle registration failed: ${result.vehicleError}` });
      } else if (result?.vehicle) {
        setNotice({ tone: "success", text: `${result.name} was added with vehicle ${result.vehicle.registrationNumber}.` });
      } else {
        setNotice({ tone: "success", text: `${result.name} was added.` });
      }
    } catch (err) {
      setSubmitError(err.message || "Unable to add employee");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleAccess(employee) {
    setBusyId(employee._id);

    try {
      await setEmployeeAccess(employee._id, !employee.isActive);
    } catch {
      // fetchEmployees already re-syncs state; surfacing per-row errors
      // isn't critical here since the list simply reflects the last known state.
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminShell title="Manage Employees">
      <div className="space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-violet-700">Administration</p>
            <h1 className="font-display text-3xl font-bold">Employees</h1>
            <p className="mt-1 text-sm text-text-dim">
              Add employees and manage their platform access.
            </p>
          </div>

          <Button
            onClick={() => {
              setShowForm((v) => !v);
              setNotice(null);
            }}
          >
            {showForm ? <X size={16} /> : <UserPlus size={16} />}
            {showForm ? "Cancel" : "Add Employee"}
          </Button>
        </div>

        {error && (
          <Card className="border-red-500/30 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        )}

        {notice && (
          <Card
            className={`p-4 ${
              notice.tone === "warning" ? "border-amber-500/30" : "border-emerald-500/30"
            }`}
          >
            <p className={`text-sm ${notice.tone === "warning" ? "text-amber-700" : "text-emerald-700"}`}>
              {notice.text}
            </p>
          </Card>
        )}

        {showForm && (
          <Card className="p-5">
            <h2 className="font-display font-bold">New Employee</h2>

            <form onSubmit={handleAddEmployee} noValidate className="mt-4 space-y-4">
              {submitError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700"
                >
                  {submitError}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Full Name"
                  required
                  placeholder="Jane Doe"
                  value={form.name}
                  error={formErrors.name}
                  onChange={(e) => update("name", e.target.value)}
                />

                <FormField
                  label="Email"
                  type="email"
                  icon={Mail}
                  required
                  placeholder="jane@company.com"
                  value={form.email}
                  error={formErrors.email}
                  onChange={(e) => update("email", e.target.value)}
                />

                <FormField
                  label="Password"
                  type="password"
                  icon={Lock}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  error={formErrors.password}
                  onChange={(e) => update("password", e.target.value)}
                />

                <FormField
                  label="Employee ID"
                  icon={BadgeIcon}
                  placeholder="EMP-001"
                  value={form.employeeId}
                  onChange={(e) => update("employeeId", e.target.value)}
                />

                <SelectField
                  label="Gender"
                  value={form.gender}
                  onChange={(e) => update("gender", e.target.value)}
                >
                  <option value="">Not selected</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </SelectField>

                <FormField
                  label="Phone"
                  icon={Phone}
                  type="tel"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>

              <div className="border-t border-border pt-4">
                <div className="mb-3 flex items-center gap-2">
                  <Car size={15} className="text-violet-700" />
                  <p className="text-sm font-semibold text-text">Vehicle (optional)</p>
                </div>
                <p className="mb-3 text-xs text-text-faint">
                  Register a vehicle for this employee now so they can offer rides right away.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Brand / Make"
                    icon={Car}
                    placeholder="Maruti Suzuki"
                    value={form.vehicleMake}
                    onChange={(e) => update("vehicleMake", e.target.value)}
                  />

                  <FormField
                    label="Model"
                    icon={Car}
                    placeholder="Swift"
                    value={form.vehicleModel}
                    error={formErrors.vehicleModel}
                    onChange={(e) => update("vehicleModel", e.target.value)}
                  />

                  <FormField
                    label="Registration Number"
                    icon={Hash}
                    placeholder="KA-01-AB-1234"
                    value={form.vehicleRegistration}
                    error={formErrors.vehicleRegistration}
                    onChange={(e) => update("vehicleRegistration", e.target.value)}
                  />

                  <FormField
                    label="Seating Capacity"
                    icon={Armchair}
                    type="number"
                    min={1}
                    placeholder="4"
                    value={form.vehicleSeats}
                    error={formErrors.vehicleSeats}
                    onChange={(e) => update("vehicleSeats", e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" loading={submitting}>
                <UserPlus size={16} />
                Create Employee
              </Button>
            </form>
          </Card>
        )}

        <Card className="overflow-hidden">
          {loading ? (
            <p className="px-6 py-10 text-center text-sm text-text-dim">Loading employees...</p>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <Users size={28} className="text-text-faint" />
              <p className="text-sm text-text-dim">No employees yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {employees.map((employee) => (
                <li
                  key={employee._id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text">
                      {employee.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-text-faint">
                      {employee.email}
                      {employee.employeeId ? ` · ${employee.employeeId}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge tone={employee.isActive ? "success" : "danger"}>
                      {employee.isActive ? "Active" : "Access revoked"}
                    </Badge>

                    <Button
                      variant={employee.isActive ? "danger" : "secondary"}
                      loading={busyId === employee._id}
                      onClick={() => toggleAccess(employee)}
                    >
                      {employee.isActive ? (
                        <ShieldOff size={16} />
                      ) : (
                        <ShieldCheck size={16} />
                      )}
                      {employee.isActive ? "Revoke Access" : "Grant Access"}
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

export default ManageEmployees;
