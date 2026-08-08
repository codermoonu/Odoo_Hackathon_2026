import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TIMING, REDUCED_TIMING } from "./journeyTiming";

const JourneyContext = createContext(null);

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}

export function JourneyProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // If the app is loaded directly on /landing (refresh, deep link, back button),
  // skip the drive sequence entirely and drop the car straight into its resting spot.
  // Lazy useState (not useRef) so the "only compute once" value is available
  // during the very first render without touching a ref while rendering.
  const [skippedIntro] = useState(() => location.pathname !== "/");
  const reducedMotion = useReducedMotion();
  const [timelineReducedMotion] = useState(() => reducedMotion);

  const [phase, setPhase] = useState(skippedIntro ? "stopped" : "boot");

  useEffect(() => {
    if (skippedIntro) return;

    const table = timelineReducedMotion ? REDUCED_TIMING : TIMING;
    const timers = Object.entries(table.phases).map(([ph, ms]) =>
      setTimeout(() => setPhase(ph), ms)
    );
    timers.push(setTimeout(() => navigate("/landing"), table.navigateAt));

    return () => timers.forEach(clearTimeout);
    // Intentionally run once: the timeline is fixed at mount, navigation happens exactly once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      phase,
      timing: timelineReducedMotion ? REDUCED_TIMING : TIMING,
      reducedMotion,
      skippedIntro,
      isDriving: phase === "driving" || phase === "leaving",
      hasArrived: phase === "arriving" || phase === "stopped",
      hasStopped: phase === "stopped",
    }),
    [phase, reducedMotion, skippedIntro, timelineReducedMotion]
  );

  return (
    <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- context + hook co-location is intentional
export function useJourney() {
  const ctx = useContext(JourneyContext);
  if (!ctx) {
    throw new Error("useJourney must be used within a JourneyProvider");
  }
  return ctx;
}
