import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { loginUser, registerUser } from "../services/auth";
import { setUnauthorizedHandler } from "../services/api";
import { STORAGE_KEYS } from "../utils/constants";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.token));
  const [sessionMessage, setSessionMessage] = useState(null);

  const persistSession = useCallback((nextUser, nextToken) => {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));
    localStorage.setItem(STORAGE_KEYS.token, nextToken);
    setUser(nextUser);
    setToken(nextToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.token);
    setUser(null);
    setToken(null);
  }, []);

  // Any 401, or a 403 caused by an admin revoking access mid-session, routes
  // through here — api.js calls this instead of importing AuthContext
  // directly (that would be circular).
  useEffect(() => {
    setUnauthorizedHandler((message) => {
      logout();
      setSessionMessage(message);
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const clearSessionMessage = useCallback(() => setSessionMessage(null), []);

  const login = useCallback(
    async (credentials) => {
      const data = await loginUser(credentials);
      persistSession(data.user, data.token);
      return data.user;
    },
    [persistSession]
  );

  const register = useCallback(
    async (payload) => {
      const data = await registerUser(payload);
      persistSession(data.user, data.token);
      return data.user;
    },
    [persistSession]
  );

  const updateUser = useCallback((nextUser) => {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      sessionMessage,
      clearSessionMessage,
      login,
      register,
      logout,
      updateUser,
    }),
    [user, token, sessionMessage, clearSessionMessage, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- context + hook co-location matches JourneyContext's pattern
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return ctx;
}
