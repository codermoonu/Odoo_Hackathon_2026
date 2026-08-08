import api from "./api";

export function registerUser({ name, email, password }) {
  return api.post("/auth/register", { name, email, password }).then((res) => res.data);
}

export function loginUser({ email, password }) {
  return api.post("/auth/login", { email, password }).then((res) => res.data);
}

export function updateProfileImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  return api
    .put("/auth/profile-image", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((res) => res.data);
}

export function updateProfile({ name }) {
  return api.put("/auth/profile", { name }).then((res) => res.data);
}

export function updatePassword({ currentPassword, newPassword }) {
  return api.put("/auth/password", { currentPassword, newPassword }).then((res) => res.data);
}
