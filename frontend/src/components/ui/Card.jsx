function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface/80 shadow-[0_18px_40px_rgba(36,28,53,0.1)] backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
