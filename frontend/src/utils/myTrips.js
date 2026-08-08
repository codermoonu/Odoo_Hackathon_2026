// Trip documents don't carry a driver user-id (only a free-text driver_name),
// so "mine" is tracked client-side: every trip this browser has published.
const STORAGE_KEY = "wayflow_my_trip_ids";

export function getPublishedTripIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function rememberPublishedTrip(tripId) {
  if (!tripId) return;
  const ids = getPublishedTripIds();
  if (!ids.includes(tripId)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, tripId]));
  }
}
