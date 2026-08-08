import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-[0_8px_24px_rgba(124,58,237,0.35)] hover:shadow-[0_10px_30px_rgba(124,58,237,0.5)] hover:brightness-110",
  secondary:
    "bg-surface-alt text-text border border-border hover:border-violet-400/50 hover:bg-surface-raised",
  ghost: "bg-transparent text-text-dim hover:text-text hover:bg-black/5",
  danger:
    "bg-red-500/10 text-red-700 border border-red-500/30 hover:bg-red-500/20",
};

function Button({
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  children,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

export default Button;
