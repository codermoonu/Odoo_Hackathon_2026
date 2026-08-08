import api from "./api";

export function addVehicle({ make, model, registrationNumber, seatingCapacity }) {
  return api
    .post("/vehicles", { make, model, registrationNumber, seatingCapacity })
    .then((res) => res.data);
}

export function getVehicles() {
  return api.get("/vehicles").then((res) => res.data);
}

export function getVehicleById(id) {
  return api.get(`/vehicles/${id}`).then((res) => res.data);
}

export function updateVehicle(id, updates) {
  return api.put(`/vehicles/${id}`, updates).then((res) => res.data);
}

export function deleteVehicle(id) {
  return api.delete(`/vehicles/${id}`).then((res) => res.data);
}
