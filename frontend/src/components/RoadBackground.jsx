import { useEffect, useRef } from "react";
import { useJourney } from "../context/JourneyContext";
import "./RoadBackground.css";

const PARTICLE_COUNT = 14;
const STREAK_COUNT = 6;

// Ambient dark-cinematic scene: gradient sky, a converging road, drifting
// particles and speed streaks, plus a subtle cursor-parallax on desktop.
// Pure CSS animation/transform — the only JS in here is a rAF-throttled
// pointer listener, which is the one place a per-frame callback is
// actually justified (following the cursor can't be expressed as a fixed
// CSS transition).
function RoadBackground({ variant = "splash" }) {
  const { phase, reducedMotion } = useJourney();
  const rootRef = useRef(null);
  const rafRef = useRef(null);

  const cruising = phase === "leaving" || phase === "arriving";
  const lit = phase !== "boot" && phase !== "ready";

  useEffect(() => {
    if (reducedMotion) return;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (isCoarsePointer) return;

    const node = rootRef.current;
    if (!node) return;

    const handlePointerMove = (e) => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        node.style.setProperty("--pointer-x", nx.toFixed(4));
        node.style.setProperty("--pointer-y", ny.toFixed(4));
        rafRef.current = null;
      });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={rootRef}
      className={`road-bg road-bg--${variant} ${cruising ? "road-bg--cruise" : ""}`}
      aria-hidden="true"
    >
      <div className="road-bg__sky" />
      <div className="road-bg__glow road-bg__glow--a" />
      <div className="road-bg__glow road-bg__glow--b" />

      <div className="road-bg__parallax road-bg__parallax--far">
        {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
          <span
            key={i}
            className="road-bg__particle"
            style={{
              left: `${(i * 7.3) % 100}%`,
              animationDelay: `${(i * 0.6) % PARTICLE_COUNT}s`,
              animationDuration: `${6 + (i % 5)}s`,
            }}
          />
        ))}
      </div>

      <div className="road-bg__parallax road-bg__parallax--near">
        <div className="road-bg__road">
          <div className="road-bg__horizon" />
          <div className="road-bg__lanes">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="road-bg__lane-dash" />
            ))}
          </div>
        </div>
      </div>

      <div className={`road-bg__streaks ${lit ? "road-bg__streaks--visible" : ""}`}>
        {Array.from({ length: STREAK_COUNT }).map((_, i) => (
          <span
            key={i}
            className="road-bg__streak"
            style={{
              top: `${58 + i * 4}%`,
              animationDelay: `${i * 0.35}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default RoadBackground;
