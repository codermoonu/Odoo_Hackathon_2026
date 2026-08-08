import { useState, useCallback } from "react";

// Prompts the browser for geolocation access and returns the coordinates.
// Used to power "rides near me" style filtering — does NOT touch the
// driver live-tracking socket, which is a separate feature.
export function useCurrentLocation() {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | requesting | granted | denied | unsupported
  const [error, setError] = useState("");

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      setError("Your browser doesn't support location services.");
      return;
    }

    setStatus("requesting");
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setStatus("granted");
      },
      (err) => {
        setStatus("denied");
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location access was denied. Enable it in your browser settings to see rides near you."
            : "Couldn't get your location right now."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return { coords, status, error, requestLocation };
}