import axios from "axios";
import { STORAGE_KEYS } from "../utils/constants";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api";

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AuthContext registers itself here so a 401/403 anywhere (expired token,
// admin-revoked access) can force a clean logout without api.js importing
// the context directly (that would be a circular import).
let unauthorizedHandler = null;
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    // Most controllers reply { message }; the trip/route routers reply { error } instead — check both.
    const message =
      error.response?.data?.message || error.response?.data?.error || error.message || "Something went wrong";

    // 401 is always "your session is invalid". 403 is used both for that
    // (access revoked) and for ordinary per-resource ownership checks
    // ("Not authorized to access this vehicle") — only the former should
    // force a logout, so we match on the specific disabled-account message.
    const sessionInvalid = status === 401 || (status === 403 && message.includes("account access has been disabled"));
    if (sessionInvalid && unauthorizedHandler) {
      unauthorizedHandler(message);
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
