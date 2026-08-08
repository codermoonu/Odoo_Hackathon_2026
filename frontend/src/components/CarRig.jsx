import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useJourney } from "../context/JourneyContext";
import { getPhaseDuration } from "../context/journeyTiming";
import { assets } from "../assets/assets";

// The hero car, mounted once in App.jsx (above the router outlet) so it is
// the same DOM node on the splash screen and on the landing page — there is
// nothing to unmount/remount, so the drive across the two screens can never
// jump or flicker. Each phase change just hands the browser a new
// top/right/scale target and a transition-duration pulled from the same
// timing table JourneyContext uses for navigation, and lets the browser's
// compositor animate it — no per-frame JS.
const POSES = {
  desktop: {
    boot: { top: 86, right: "44vw", scale: 0.5, opacity: 0 },
    ready: { top: 82, right: "44vw", scale: 0.58, opacity: 1 },
    headlights: { top: 82, right: "44vw", scale: 0.6, opacity: 1 },
    driving: { top: 79, right: "37vw", scale: 0.66, opacity: 1 },
    leaving: { top: 56, right: "17vw", scale: 1.08, opacity: 1 },
    arriving: { top: 43, right: "8vw", scale: 1.42, opacity: 1 },
    stopped: { top: 41, right: "clamp(24px, 7vw, 130px)", scale: 1.58, opacity: 1 },
  },
  tablet: {
    boot: { top: 88, right: "50vw", scale: 0.42, opacity: 0 },
    ready: { top: 85, right: "50vw", scale: 0.5, opacity: 1 },
    headlights: { top: 85, right: "50vw", scale: 0.52, opacity: 1 },
    driving: { top: 82, right: "46vw", scale: 0.58, opacity: 1 },
    leaving: { top: 66, right: "36vw", scale: 0.86, opacity: 1 },
    arriving: { top: 54, right: "28vw", scale: 1.05, opacity: 1 },
    stopped: { top: 52, right: "26vw", scale: 1.15, opacity: 1 },
  },
  mobile: {
    boot: { top: 90, right: "50vw", scale: 0.34, opacity: 0 },
    ready: { top: 87, right: "50vw", scale: 0.4, opacity: 1 },
    headlights: { top: 87, right: "50vw", scale: 0.42, opacity: 1 },
    driving: { top: 84, right: "48vw", scale: 0.46, opacity: 1 },
    leaving: { top: 74, right: "42vw", scale: 0.62, opacity: 1 },
    arriving: { top: 66, right: "38vw", scale: 0.76, opacity: 1 },
    stopped: { top: 64, right: "36vw", scale: 0.82, opacity: 1 },
  },
};

const EASE = {
  ready: "cubic-bezier(0.16,1,0.3,1)",
  headlights: "cubic-bezier(0.16,1,0.3,1)",
  driving: "cubic-bezier(0.55,0,0.85,0.35)",
  leaving: "cubic-bezier(0.65,0,0.35,1)",
  arriving: "cubic-bezier(0.16,1,0.3,1)",
  stopped: "cubic-bezier(0.22,1,0.36,1)",
};

function useBreakpoint() {
  const [bp, setBp] = useState(() => {
    if (typeof window === "undefined") return "desktop";
    if (window.innerWidth <= 640) return "mobile";
    if (window.innerWidth <= 1023) return "tablet";
    return "desktop";
  });

  useEffect(() => {
    const mqTablet = window.matchMedia("(max-width: 1023px)");
    const mqMobile = window.matchMedia("(max-width: 640px)");
    const update = () => setBp(mqMobile.matches ? "mobile" : mqTablet.matches ? "tablet" : "desktop");
    update();
    mqTablet.addEventListener("change", update);
    mqMobile.addEventListener("change", update);
    return () => {
      mqTablet.removeEventListener("change", update);
      mqMobile.removeEventListener("change", update);
    };
  }, []);

  return bp;
}

function CarRig() {
  const location = useLocation();
  const { phase, timing, reducedMotion, skippedIntro } = useJourney();
  const breakpoint = useBreakpoint();

  const onIntroRoute = location.pathname === "/" || location.pathname === "/landing";

  const pose = POSES[breakpoint][phase] ?? POSES[breakpoint].boot;
  const durationMs = skippedIntro ? 0 : getPhaseDuration(timing, phase);
  const easing = reducedMotion ? "ease-out" : EASE[phase] ?? "ease-out";
  const padVisible = phase === "arriving" || phase === "stopped";
  const settled = phase === "stopped" && !skippedIntro && !reducedMotion;

  if (!onIntroRoute) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-[70]"
      style={{
        top: `${pose.top}vh`,
        right: pose.right,
        width: "clamp(180px, 16vw, 320px)",
        opacity: pose.opacity,
        transitionProperty: "top, right, opacity, transform",
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: easing,
        transform: `scale(${pose.scale})`,
      }}
    >
      {/* landing-pad frame: only lights up once the car is arriving/parked */}
      <div
        className="absolute inset-[-20%] -z-20 rounded-[2.5rem] border border-violet-400/20 bg-gradient-to-br from-violet-600/20 to-purple-500/5 backdrop-blur-sm transition-opacity duration-700"
        style={{ opacity: padVisible ? 1 : 0 }}
      />
      <div
        className="absolute inset-[8%] -z-10 rounded-full bg-violet-600/35 blur-3xl transition-opacity duration-700"
        style={{ opacity: padVisible ? 1 : 0 }}
      />

      <img
        src={assets.main_car}
        alt=""
        className={`w-full scale-x-[-1] drop-shadow-[0_25px_45px_rgba(124,58,237,0.4)] ${
          settled ? "car-rig-settle" : ""
        }`}
      />
    </div>
  );
}

export default CarRig;
