import api from "./api";

export function bookRide(rideId, seatsToBook = 1) {
  return api.post("/bookings", { rideId, seatsToBook }).then((res) => res.data);
}

export function getMyBookings() {
  return api.get("/bookings/mine").then((res) => res.data);
}

export function getBookingById(id) {
  return api.get(`/bookings/${id}`).then((res) => res.data);
}