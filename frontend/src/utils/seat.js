export function getAvailableSeats(ride) {
  return Math.max(Number(ride?.availableSeats ?? 0), 0);
}

export function getSeatStatusLabel(ride) {
  const seatsLeft = getAvailableSeats(ride);
  if (seatsLeft <= 0) return "Full";
  if (seatsLeft === 1) return "1 seat left";
  return `${seatsLeft} seats left`;
}

export function isSeatAvailable(ride) {
  return getAvailableSeats(ride) > 0;
}

// Seat-scarcity tiers for the "seats left" badge:
//   red   — 2 or fewer seats  (book fast)
//   amber — exactly 3 seats   (getting limited)
//   green — 4+ seats          (plenty available)
export function getSeatUrgency(ride) {
  const seatsLeft = getAvailableSeats(ride);
  if (seatsLeft <= 2) return "red";
  if (seatsLeft === 3) return "amber";
  return "green";
}

export const SEAT_URGENCY_STYLES = {
  red: "bg-red-500/15 text-red-600 border border-red-400/30",
  amber: "bg-amber-500/15 text-amber-600 border border-amber-400/30",
  green: "bg-emerald-500/15 text-emerald-600 border border-emerald-400/30",
};