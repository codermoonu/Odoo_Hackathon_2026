import { Car } from "lucide-react";
import { useJourney } from "../context/JourneyContext";
import RoadBackground from "../components/RoadBackground";
import "./Splash.css";

// The splash screen owns only the intro chrome (logo, tagline, loading
// indicator) and the ambient scene behind it. The car itself is rendered
// once in App.jsx (see CarRig) so it can drive straight through the
// splash -> landing route swap without ever unmounting.
function Splash() {
  const { phase, timing, reducedMotion } = useJourney();

  const chromeLeaving = phase === "leaving" || phase === "arriving" || phase === "stopped";
  const progressSeconds = Math.max(timing.phases.leaving / 1000, 0.2);

  return (
    <main className="splash">
      <RoadBackground variant="splash" />

      <div className={`splash__chrome ${chromeLeaving ? "splash__chrome--out" : ""}`}>
        <div className="splash__brand">
          <span className="splash__logo-mark">
            <Car size={26} strokeWidth={2} />
          </span>
          <span className="splash__logo-text">CARPOOL</span>
        </div>

        <p className="splash__tagline">Smart commute. Engineered for the drive.</p>

        <h1 className="splash__headline">
          Your daily commute,
          <br />
          <span className="splash__headline-accent">shared &amp; simplified.</span>
        </h1>

        <div className="splash__progress" aria-hidden="true">
          <div
            className="splash__progress-fill"
            style={
              reducedMotion
                ? { width: "100%" }
                : { animationDuration: `${progressSeconds}s` }
            }
          />
        </div>
        <p className="splash__hint">Preparing your commute&hellip;</p>
      </div>
    </main>
  );
}

export default Splash;
