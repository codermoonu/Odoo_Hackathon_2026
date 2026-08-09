import api from "./api";

// The rest of the app (SavedPlaces.jsx, FindRide.jsx) keys/renders off `id`,
// not Mongo's `_id` — normalize here so callers don't need to change.
function normalize(place) {
  return { ...place, id: place._id };
}

export function getSavedPlaces() {
  return api.get("/saved-places").then((res) => res.data.map(normalize));
}

export function createSavedPlace({ name, address, lat, lng, kind }) {
  return api.post("/saved-places", { name, address, lat, lng, kind }).then((res) => normalize(res.data));
}

export function updateSavedPlace(id, { name, address, lat, lng, kind }) {
  return api.put(`/saved-places/${id}`, { name, address, lat, lng, kind }).then((res) => normalize(res.data));
}

export function deleteSavedPlace(id) {
  return api.delete(`/saved-places/${id}`).then((res) => res.data);
}
