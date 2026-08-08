import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { FormField } from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import { isValidEmail, isNonEmpty } from "../../utils/validators";
import { assets } from "../../assets/assets";

function AdminLogin() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setSubmitError("");
  }

  function validate() {
    const next = {};

    if (!isValidEmail(form.email)) {
      next.email = "Enter a valid email address";
    }

    if (!isNonEmpty(form.password)) {
      next.password = "Password is required";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSubmitError("");

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const loggedInUser = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      /*
       * The same backend login endpoint is used.
       * We simply check whether the authenticated
       * user's role is admin.
       */

      if (loggedInUser?.role !== "admin") {
        setSubmitError(
          "This account does not have administrator access."
        );
        return;
      }

      navigate("/admin", { replace: true });
    } catch (err) {
      setSubmitError(
        err.message || "Unable to log in as administrator"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">

      {/* =========================
          VISUAL PANEL
      ========================== */}

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-violet-800 via-violet-700 to-indigo-800 p-10 lg:flex lg:flex-col lg:justify-between">

        <div className="absolute inset-0 bg-black/10" />

        <Link
          to="/landing"
          className="relative z-10 flex items-center gap-2.5 text-white"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <img
              src={assets.logo}
              alt=""
              className="h-5 w-5"
            />
          </span>

          <span className="font-display text-lg font-bold tracking-wide">
            WAYFLOW
          </span>
        </Link>

        <div className="relative z-10">

          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <ShieldCheck
              size={34}
              className="text-white"
            />
          </div>

          <h2 className="max-w-sm font-display text-3xl leading-tight font-bold text-white">
            WAYFLOW Administration
          </h2>

          <p className="mt-3 max-w-sm text-sm leading-relaxed text-violet-100/80">
            Manage your organization, employees, vehicles,
            access permissions and reports from one place.
          </p>
        </div>

        <p className="relative z-10 text-xs text-violet-200/60">
          © {new Date().getFullYear()} WAYFLOW
        </p>
      </div>


      {/* =========================
          ADMIN LOGIN FORM
      ========================== */}

      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">

          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <img
              src={assets.logo}
              alt=""
              className="h-8 w-8"
            />

            <span className="font-display text-lg font-bold tracking-wide">
              WAYFLOW
            </span>
          </div>

          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
            <ShieldCheck
              size={24}
              className="text-violet-600"
            />
          </div>

          <h1 className="font-display text-2xl font-bold">
            Administrator Login
          </h1>

          <p className="mt-1.5 text-sm text-text-dim">
            Sign in with your administrator account.
          </p>


          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-8 flex flex-col gap-5"
          >

            {submitError && (
              <div
                role="alert"
                className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700"
              >
                {submitError}
              </div>
            )}

            <FormField
              label="Admin Email"
              type="email"
              icon={Mail}
              required
              autoComplete="email"
              placeholder="admin@company.com"
              value={form.email}
              error={errors.email}
              onChange={(e) =>
                update("email", e.target.value)
              }
            />

            <FormField
              label="Password"
              type={showPassword ? "text" : "password"}
              icon={Lock}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              error={errors.password}
              onChange={(e) =>
                update("password", e.target.value)
              }
              endAdornment={
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  className="cursor-pointer rounded-md p-1 text-text-faint hover:text-text-dim"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              }
            />

            <Button
              type="submit"
              loading={loading}
              className="mt-1 w-full justify-center"
            >
              Admin Login
              <ArrowRight size={16} />
            </Button>
          </form>


          {/* Back to normal login */}

          <Link
            to="/login"
            className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700"
          >
            <ArrowLeft size={15} />
            Back to regular login
          </Link>

        </div>
      </div>
    </div>
  );
}

export default AdminLogin;