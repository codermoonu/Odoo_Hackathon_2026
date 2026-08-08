// Guards against feeding Leaflet a malformed position — it throws
// (uncaught, no recovery) on anything that isn't two finite numbers.
export function isValidCoord(c) {
  return !!c && Number.isFinite(c.lat) && Number.isFinite(c.lng);
}
