import { useEffect, useRef, useState } from "react";
import { geocode } from "../services/route";

// Debounced address -> coordinate suggestions, backed by the real
// GET /route/geocode endpoint (Nominatim under the hood, no API key needed).
export function useGeocodeSuggest(query, { minLength = 3, delay = 400 } = {}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const id = ++requestId.current;

    const timer = setTimeout(() => {
      if (!query || query.trim().length < minLength) {
        if (requestId.current === id) setResults([]);
        return;
      }

      setLoading(true);
      geocode(query)
        .then((matches) => {
          if (requestId.current === id) setResults(matches);
        })
        .catch(() => {
          if (requestId.current === id) setResults([]);
        })
        .finally(() => {
          if (requestId.current === id) setLoading(false);
        });
    }, delay);

    return () => clearTimeout(timer);
  }, [query, minLength, delay]);

  return { results, loading };
}
