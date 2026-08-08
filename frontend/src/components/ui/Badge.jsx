const TONES = {
  neutral: "bg-black/5 text-text-dim",
  success: "bg-emerald-500/12 text-emerald-700",
  warning: "bg-amber-500/12 text-amber-700",
  danger: "bg-red-500/12 text-red-700",
  violet: "bg-violet-500/12 text-violet-700",
};

function Badge({ tone = "neutral", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
