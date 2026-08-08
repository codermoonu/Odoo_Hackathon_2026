import api from "./api";

export function geocode(query) {
  return api.get("/route/geocode", { params: { q: query } }).then((res) => res.data.results || []);
}

export function previewRoute({ origin_lat, origin_lng, dest_lat, dest_lng }) {
  return api
    .post("/route/preview", { origin_lat, origin_lng, dest_lat, dest_lng })
    .then((res) => res.data.route);
}

export function calculateFare(distanceKm) {
  return api
    .post("/route/calculate-fare", { distance_km: distanceKm })
    .then((res) => res.data.estimated_fare_per_seat);
}
