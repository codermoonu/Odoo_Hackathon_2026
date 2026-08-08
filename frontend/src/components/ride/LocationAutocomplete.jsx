import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { useGeocodeSuggest } from "../../hooks/useGeocodeSuggest";

// Address input backed by the real GET /route/geocode endpoint (Nominatim).
// Calls onSelect({ address, lat, lng }) once the rider picks a suggestion.
function LocationAutocomplete({ label, placeholder, defaultValue = "", onSelect, required }) {
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const { results, loading } = useGeocodeSuggest(open ? query : "");
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex flex-col gap-1.5" ref={wrapperRef}>
      <label className="text-sm font-medium text-text-dim">
        {label} {required && <span className="text-violet-600">*</span>}
      </label>
      <div className="relative">
        <MapPin size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-text-faint" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-xl border border-border bg-surface-alt/60 py-2.5 pr-4 pl-10 text-[15px] text-text placeholder:text-text-faint outline-none transition-colors duration-150 focus:border-violet-400"
        />
        {loading && (
          <Loader2 size={16} className="absolute top-1/2 right-3.5 -translate-y-1/2 animate-spin text-text-faint" />
        )}
      </div>
      {open && results.length > 0 && (
        <ul className="absolute top-full z-30 mt-1 w-full overflow-hidden rounded-xl border border-border bg-surface-raised shadow-[0_18px_40px_rgba(6,4,16,0.55)]">
          {results.map((r, i) => (
            <li key={`${r.lat}-${r.lng}-${i}`}>
              <button
                type="button"
                onClick={() => {
                  setQuery(r.address);
                  setOpen(false);
                  onSelect(r);
                }}
                className="flex w-full cursor-pointer items-start gap-2 px-4 py-2.5 text-left text-sm text-text-dim hover:bg-black/5 hover:text-text"
              >
                <MapPin size={14} className="mt-0.5 shrink-0 text-violet-600" />
                <span className="line-clamp-2">{r.address}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LocationAutocomplete;
