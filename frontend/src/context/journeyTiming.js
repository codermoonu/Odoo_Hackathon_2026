// Single source of truth for the splash -> landing car journey timing.
// Phase order: boot -> ready -> headlights -> driving -> leaving -> arriving -> stopped
export const PHASE_ORDER = [
  "boot",
  "ready",
  "headlights",
  "driving",
  "leaving",
  "arriving",
  "stopped",
];

export const TIMING = {
  phases: {
    ready: 900,
    headlights: 1600,
    driving: 2100,
    leaving: 4000,
    arriving: 4900,
    stopped: 7000,
  },
  navigateAt: 4300,
};

// Reduced-motion still tells the same story, just compressed to a near-instant cut.
export const REDUCED_TIMING = {
  phases: {
    ready: 80,
    headlights: 160,
    driving: 220,
    leaving: 380,
    arriving: 460,
    stopped: 620,
  },
  navigateAt: 400,
};

// How long it takes to transition INTO a given phase (i.e. the CSS
// transition-duration to use once `phase` becomes this value).
export function getPhaseDuration(timing, phase) {
  const idx = PHASE_ORDER.indexOf(phase);
  if (idx <= 0) return 0;
  const prevPhase = PHASE_ORDER[idx - 1];
  const end = timing.phases[phase] ?? 0;
  const start = prevPhase === "boot" ? 0 : timing.phases[prevPhase] ?? 0;
  return Math.max(end - start, 0);
}
