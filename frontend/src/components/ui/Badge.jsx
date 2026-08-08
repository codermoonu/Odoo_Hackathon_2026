const TONES = {
  neutral: "bg-white/8 text-text-dim",
  success: "bg-emerald-400/12 text-emerald-300",
  warning: "bg-amber-400/12 text-amber-300",
  danger: "bg-red-400/12 text-red-300",
  violet: "bg-violet-400/15 text-violet-300",
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
