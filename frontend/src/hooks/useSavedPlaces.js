import { useCallback, useEffect, useState } from "react";
import { getSavedPlaces, createSavedPlace, updateSavedPlace, deleteSavedPlace } from "../services/savedPlace";

// Backed by a per-user SavedPlace collection on the backend, scoped to the
// logged-in user via the auth token — previously this lived in one flat
// localStorage key shared by whoever happened to be logged into the browser,
// so every account saw the same places.
export function useSavedPlaces() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    function fail(err) {
      setError(err.message || "Could not load saved places");
      setLoading(false);
    }

    getSavedPlaces()
      .then((data) => {
        if (!active) return;
        setPlaces(data);
        setLoading(false);
      })
      .catch((err) => {
        if (active) fail(err);
      });

    return () => {
      active = false;
    };
  }, []);

  const upsertPlace = useCallback(async (place, editingId) => {
    try {
      if (editingId) {
        const updated = await updateSavedPlace(editingId, place);
        setPlaces((current) => current.map((p) => (p.id === editingId ? updated : p)));
      } else {
        const created = await createSavedPlace(place);
        setPlaces((current) => [created, ...current]);
      }
    } catch (err) {
      setError(err.message || "Could not save this place");
    }
  }, []);

  const removePlace = useCallback(async (id) => {
    try {
      await deleteSavedPlace(id);
      setPlaces((current) => current.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message || "Could not remove this place");
    }
  }, []);

  return { places, loading, error, upsertPlace, removePlace };
}
