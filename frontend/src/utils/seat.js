export function getAvailableSeats(trip, requestedSeats = 0) {
  const totalSeats = Number(trip?.available_seats ?? 0);
  const requested = Number(requestedSeats ?? 0);

  return Math.max(totalSeats - requested, 0);
}

export function getSeatStatusLabel(trip, requestedSeats = 0) {
  const seatsLeft = getAvailableSeats(trip, requestedSeats);

  if (seatsLeft <= 0) return "Full";
  if (seatsLeft === 1) return "1 seat left";
  return `${seatsLeft} seats left`;
}

export function isSeatAvailable(trip, requestedSeats = 0) {
  return getAvailableSeats(trip, requestedSeats) > 0;
}
