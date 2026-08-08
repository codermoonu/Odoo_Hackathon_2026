import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Car, ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { FormField } from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import { isValidEmail, isNonEmpty } from "../../utils/validators";
import { assets } from "../../assets/assets";

function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(location.state?.from || "/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const next = {};
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address";
    if (!isNonEmpty(form.password)) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await login({ email: form.email.trim().toLowerCase(), password: form.password });
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      setSubmitError(err.message || "Unable to log in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-dvh w-full grid-cols-1 bg-bg text-text lg:grid-cols-2">
      {/* Visual panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-violet-700 via-violet-800 to-indigo-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div aria-hidden="true" className="absolute top-[-8rem] right-[-8rem] h-96 w-96 rounded-full bg-purple-400/25 blur-[120px]" />
        <div aria-hidden="true" className="absolute bottom-[-6rem] left-[-4rem] h-80 w-80 rounded-full bg-indigo-400/20 blur-[110px]" />

        <Link to="/landing" className="relative z-10 flex items-center gap-2.5 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Car size={18} />
          </span>
          <span className="font-display text-lg font-bold tracking-wide">CARPOOL</span>
        </Link>

        <div className="relative z-10">
          <img src={assets.banner_car_image} alt="" className="w-full max-w-md drop-shadow-2xl" />
          <h2 className="mt-8 max-w-sm font-display text-3xl leading-tight font-bold text-white">
            Welcome back to your daily ride.
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-violet-100/80">
            Log in to find a seat, offer one, and keep your commute simple.
          </p>
        </div>

        <p className="relative z-10 text-xs text-violet-200/60">© {new Date().getFullYear()} CARPOOL</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <img src={assets.logo} alt="" className="h-8 w-8" />
            <span className="font-display text-lg font-bold tracking-wide">CARPOOL</span>
          </div>

          <h1 className="font-display text-2xl font-bold">Log in</h1>
          <p className="mt-1.5 text-sm text-text-dim">
            New here?{" "}
            <Link to="/signup" className="font-semibold text-violet-400 hover:text-violet-300">
              Create an account
            </Link>
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
            {submitError && (
              <div role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {submitError}
              </div>
            )}

            <FormField
              label="Email"
              type="email"
              icon={Mail}
              required
              autoComplete="email"
              placeholder="you@company.com"
              value={form.email}
              error={errors.email}
              onChange={(e) => update("email", e.target.value)}
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
              onChange={(e) => update("password", e.target.value)}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="cursor-pointer rounded-md p-1 text-text-faint hover:text-text-dim"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              }
            />

            <Button type="submit" loading={loading} className="mt-1 w-full justify-center">
              Log in
              <ArrowRight size={16} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
