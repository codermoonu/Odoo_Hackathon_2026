import { useId } from "react";

export function FormField({
  label,
  error,
  required,
  type = "text",
  icon: Icon,
  className = "",
  inputClassName = "",
  endAdornment,
  ...props
}) {
  const id = useId();
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-text-dim">
        {label} {required && <span className="text-violet-600">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-text-faint"
          />
        )}
        <input
          id={id}
          type={type}
          className={`w-full rounded-xl border bg-surface-alt/60 px-4 py-2.5 text-[15px] text-text placeholder:text-text-faint outline-none transition-colors duration-150 focus:border-violet-400 ${
            Icon ? "pl-10" : ""
          } ${endAdornment ? "pr-11" : ""} ${
            error ? "border-red-400/60" : "border-border"
          } ${inputClassName}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {endAdornment && (
          <div className="absolute top-1/2 right-2.5 -translate-y-1/2">{endAdornment}</div>
        )}
      </div>
      {error && (
        <span id={`${id}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}

export function SelectField({ label, error, required, className = "", children, ...props }) {
  const id = useId();
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-text-dim">
        {label} {required && <span className="text-violet-600">*</span>}
      </label>
      <select
        id={id}
        className={`w-full rounded-xl border bg-surface-alt/60 px-4 py-2.5 text-[15px] text-text outline-none transition-colors duration-150 focus:border-violet-400 ${
          error ? "border-red-400/60" : "border-border"
        }`}
        aria-invalid={!!error}
        {...props}
      >
        {children}
      </select>
      {error && (
        <span role="alert" className="text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
