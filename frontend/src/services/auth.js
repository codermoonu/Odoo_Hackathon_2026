import api from "./api";

export function registerUser({ name, email, password }) {
  return api.post("/auth/register", { name, email, password }).then((res) => res.data);
}

export function loginUser({ email, password }) {
  return api.post("/auth/login", { email, password }).then((res) => res.data);
}
