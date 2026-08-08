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

    setFormErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleAddEmployee(e) {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    setSubmitting(true);

    try {
      await addEmployee({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        employeeId: form.employeeId.trim() || undefined,
        gender: form.gender || undefined,
        phone: form.phone ? Number(form.phone) : undefined,
      });

      setForm(EMPTY_FORM);
      setShowForm(false);
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
            <p className="text-sm text-violet-400">Administration</p>
            <h1 className="font-display text-3xl font-bold">Employees</h1>
            <p className="mt-1 text-sm text-text-dim">
              Add employees and manage their platform access.
            </p>
          </div>

          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? <X size={16} /> : <UserPlus size={16} />}
            {showForm ? "Cancel" : "Add Employee"}
          </Button>
        </div>

        {error && (
          <Card className="border-red-500/30 p-4">
            <p className="text-sm text-red-400">{error}</p>
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
