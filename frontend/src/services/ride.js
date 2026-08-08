import api from "./api";

export function publishRide(payload) {
  return api.post("/rides", payload).then((res) => res.data);
}

export function searchRides({ pickupLocation, destination, travelDate, seatsRequired } = {}) {
  return api
    .get("/rides/search", { params: { pickupLocation, destination, travelDate, seatsRequired } })
    .then((res) => res.data);
}

export function getRideById(id) {
  return api.get(`/rides/${id}`).then((res) => res.data);
}