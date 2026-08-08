import { getAllTrips } from "./trip";
import { getVehicles } from "./vehicle";
import { getMyPayments } from "./payment";

export async function getReportsOverview() {
  const [tripsResult, vehiclesResult, paymentsResult] = await Promise.allSettled([
    getAllTrips(),
    getVehicles(),
    getMyPayments(),
  ]);

  const trips = tripsResult.status === "fulfilled" ? (Array.isArray(tripsResult.value) ? tripsResult.value : []) : [];
  const vehicles = vehiclesResult.status === "fulfilled" ? (Array.isArray(vehiclesResult.value) ? vehiclesResult.value : []) : [];
  const payments = paymentsResult.status === "fulfilled" ? (Array.isArray(paymentsResult.value) ? paymentsResult.value : []) : [];

  const paidPayments = payments.filter((payment) => String(payment?.status || "").toLowerCase() === "paid");
  const totalRevenue = paidPayments.reduce((sum, payment) => sum + Number(payment?.amount || 0), 0);
  const totalDistance = trips.reduce((sum, trip) => sum + Number(trip?.distance_km || 0), 0);
  const completedTrips = trips.filter((trip) => String(trip?.status || "").toUpperCase() === "COMPLETED");
  const activeVehicles = vehicles.filter((vehicle) => vehicle?.isActive !== false).length;

  const routeCounts = new Map();
  trips.forEach((trip) => {
    const route = `${trip?.start_address || "Unknown pickup"} → ${trip?.dest_address || "Unknown destination"}`;
    routeCounts.set(route, (routeCounts.get(route) || 0) + 1);
  });

  const topRoutes = [...routeCounts.entries()]
    .map(([route, count]) => ({ route, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    trips,
    vehicles,
    payments,
    totalTrips: trips.length,
    completedTrips: completedTrips.length,
    activeVehicles,
    totalDistance,
    totalRevenue,
    avgDistance: trips.length ? totalDistance / trips.length : 0,
    topRoutes,
  };
}
