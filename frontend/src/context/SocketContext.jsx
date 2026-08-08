import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";

const SocketContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api";
const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export function SocketProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    function teardown() {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
    }

    if (!isAuthenticated) {
      teardown();
      return;
    }

    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({
      connected,
      // (tripId, role?) => void — joins a trip's tracking room; server replies with a "trip_state" event.
      joinTrip: (tripId, role = "passenger") => {
        socketRef.current?.emit("join_trip", { trip_id: tripId, role });
      },
      // (event, handler) => unsubscribe — thin wrapper so consumers don't need the raw socket instance.
      on: (event, handler) => {
        socketRef.current?.on(event, handler);
        return () => socketRef.current?.off(event, handler);
      },
      emit: (event, payload) => {
        socketRef.current?.emit(event, payload);
      },
    }),
    [connected]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- context + hook co-location matches AuthContext/JourneyContext's pattern
export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return ctx;
}
