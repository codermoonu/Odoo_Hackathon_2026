import { useJourney } from "../context/JourneyContext";
import { assets } from "../assets/assets";

// Owns only the intro chrome + ambient violet scene. JourneyContext drives
// the phase timeline and navigates to /landing once it completes.
function Splash() {
  const { phase, timing, reducedMotion } = useJourney();

  const chromeLeaving = phase === "leaving" || phase === "arriving" || phase === "stopped";
  const progressSeconds = Math.max(timing.phases.leaving / 1000, 0.2);

  return (
    <main className="relative flex h-dvh w-screen items-center justify-center overflow-hidden bg-bg">
      {/* ambient glow field */}
      <div
        aria-hidden="true"
        className="motion-safe:animate-pulse absolute top-1/4 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="motion-safe:animate-pulse absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-indigo-500/15 blur-[100px]"
        style={{ animationDelay: "1s" }}
      />
      <div
        aria-hidden="true"
        className="motion-safe:animate-pulse absolute right-1/4 bottom-10 h-64 w-64 rounded-full bg-purple-500/15 blur-[100px]"
        style={{ animationDelay: "2s" }}
      />

      <div
        className={`relative z-10 flex flex-col items-center px-6 text-center transition-all duration-500 ease-out ${
          chromeLeaving ? "translate-y-[-10px] opacity-0 blur-sm" : "animate-fade-up opacity-100"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-[0_0_0_1px_rgba(167,139,250,0.35),0_8px_24px_rgba(124,58,237,0.45)]">
            <img src={assets.logo} alt="" className="h-6 w-6" />
          </span>
          <span className="font-display text-xl font-bold tracking-[0.14em] text-text">WAYFLOW</span>
        </div>

        <p className="mt-4 text-xs font-semibold tracking-[0.18em] text-violet-300 uppercase">
          Smart commute, engineered for the drive
        </p>

        <h1 className="mt-6 max-w-xs font-display text-3xl leading-tight font-bold text-text sm:max-w-sm sm:text-4xl">
          Your daily commute,
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
            shared &amp; simplified.
          </span>
        </h1>

        <div className="relative mt-10 h-[3px] w-52 overflow-hidden rounded-full bg-white/10">
          <div
            className="splash-progress-fill h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 shadow-[0_0_12px_rgba(167,139,250,0.7)]"
            style={reducedMotion ? { width: "100%" } : { animationDuration: `${progressSeconds}s` }}
          />
        </div>
        <p className="mt-3 text-xs tracking-wide text-text-faint">Preparing your commute&hellip;</p>
      </div>
    </main>
  );
}

export default Splash;
