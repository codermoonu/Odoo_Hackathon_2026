import { useAuthContext } from "../context/AuthContext";

// Thin re-export so pages/components import from hooks/, not context/ directly.
export function useAuth() {
  return useAuthContext();
}
