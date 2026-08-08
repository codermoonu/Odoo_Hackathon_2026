import { useMemo } from "react";
import { useJourney } from "../context/JourneyContext";
import { getPhaseDuration } from "../context/journeyTiming";
import CarSVG from "./CarSVG";
import "./CarRig.css";

// One continuous journey, told as a handful of target poses. Every time
// `phase` advances, we hand the browser a new transform target plus the
// exact duration until the *next* phase fires (pulled from the same timing
// table JourneyContext uses for navigation) — so the car glides from pose
// to pose on a single CSS transition instead of being driven frame-by-frame
// from JS. No layout is touched (position: fixed + transform only), and the
// component is mounted once in App.jsx, above <Routes>, so the same DOM
// node survives the splash -> landing route swap: nothing to re-mount,
// nothing to desync.
const POSES = {
  boot: { x: -18, y: 80, scale: 0.75, rotate: -2 },
  ready: { x: 8, y: 79, scale: 0.84, rotate: 0 },
  headlights: { x: 9, y: 79, scale: 0.85, rotate: 0 },
  driving: { x: 12, y: 79, scale: 0.87, rotate: -0.4 },
  leaving: { x: 55, y: 72, scale: 1, rotate: -1.2 },
  arriving: { x: 66, y: 69, scale: 1.1, rotate: -0.4 },
  stopped: { x: 68, y: 67, scale: 1.18, rotate: 0 },
};

const EASE = {
  ready: "cubic-bezier(0.16,1,0.3,1)",
  headlights: "cubic-bezier(0.16,1,0.3,1)",
  driving: "cubic-bezier(0.55,0,0.85,0.35)",
  leaving: "cubic-bezier(0.7,0,0.84,0)",
  arriving: "cubic-bezier(0.33,1,0.68,1)",
  stopped: "cubic-bezier(0.22,1,0.36,1)",
};

const WHEEL_BUCKET = {
  boot: "idle",
  ready: "idle",
  headlights: "idle",
  driving: "prep",
  leaving: "cruise",
  arriving: "decel",
  stopped: "stopped",
};

function CarRig() {
  const { phase, timing, reducedMotion, skippedIntro } = useJourney();

  const pose = POSES[phase] ?? POSES.boot;
  const lit = phase !== "boot" && phase !== "ready";
  const wheelBucket = WHEEL_BUCKET[phase] ?? "idle";
  const cruising = phase === "leaving" && !reducedMotion;

  const { transform, transitionDuration, transitionTimingFunction } =
    useMemo(() => {
      const appliedPose = reducedMotion ? { ...pose, rotate: 0 } : pose;
      const durationMs = skippedIntro ? 0 : getPhaseDuration(timing, phase);
      return {
        transform: `translate3d(calc(${appliedPose.x}vw - 50%), calc(${appliedPose.y}vh - 50%), 0) rotate(${appliedPose.rotate}deg) scale(${appliedPose.scale})`,
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: reducedMotion
          ? "ease-out"
          : EASE[phase] ?? "ease-out",
      };
    }, [phase, pose, reducedMotion, skippedIntro, timing]);

  return (
    <div
      className="car-rig"
      style={{ transform, transitionDuration, transitionTimingFunction }}
      aria-hidden="true"
    >
      <div
        className={`car-rig__shake${cruising ? " car-rig__shake--cruise" : ""}${
          phase === "stopped" && !skippedIntro ? " car-rig__shake--settle" : ""
        }`}
      >
        <div
          className="car-rig__ground-glow"
          style={{ opacity: lit ? 1 : 0 }}
        />
        <CarSVG lit={lit} className={`car-rig__svg wheels-${wheelBucket}`} />
        <div className="car-rig__reflection" aria-hidden="true">
          <CarSVG lit={lit} className={`car-rig__svg wheels-${wheelBucket}`} />
        </div>
      </div>
    </div>
  );
}

export default CarRig;
