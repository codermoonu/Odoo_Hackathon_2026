import api from "./api";

export function createTrip(payload) {
  return api.post("/trips", payload).then((res) => res.data.trip);
}

export function getAllTrips() {
  return api.get("/trips").then((res) => res.data.trips || []);
}

export function getTripById(id) {
  return api.get(`/trips/${id}`).then((res) => res.data.trip);
}

export function updateTripStatus(id, status) {
  return api.post(`/trips/${id}/status`, { status }).then((res) => res.data.trip);
}
