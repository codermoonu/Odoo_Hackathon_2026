import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "wayflow_saved_places";

const defaultPlaces = [
  { id: "home", name: "Home", address: "Koramangala, Bengaluru", lat: 12.9352, lng: 77.6146, kind: "home" },
  { id: "office", name: "Office", address: "MG Road, Bengaluru", lat: 12.9758, lng: 77.6045, kind: "work" },
];

// Shared saved-places store — backs both the Saved Places settings page
// and the "quick locations" shortcuts on Find a Ride. LocalStorage only
// for now (no backend model yet); same {id,name,address,lat,lng,kind}
// shape would map directly onto a SavedPlace collection later.
export function useSavedPlaces() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setPlaces(saved.length ? saved : defaultPlaces);
    } catch {
      setPlaces(defaultPlaces);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
    }
  }, [places, loading]);

  const upsertPlace = useCallback((place, editingId) => {
    setPlaces((current) => {
      if (editingId) {
        return current.map((p) => (p.id === editingId ? { ...place, id: editingId } : p));
      }
      return [{ ...place, id: `place-${Date.now()}` }, ...current];
    });
  }, []);

  const removePlace = useCallback((id) => {
    setPlaces((current) => current.filter((p) => p.id !== id));
  }, []);

  return { places, loading, upsertPlace, removePlace };
}