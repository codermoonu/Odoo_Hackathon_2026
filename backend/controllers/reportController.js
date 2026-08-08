const Trip = require('../models/Trip');
const Payment = require('../models/Payment');
const Vehicle = require('../models/Vehicle');

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const getRouteKey = (trip) => {
  const from = trip?.start_address || 'Unknown pickup';
  const to = trip?.dest_address || 'Unknown destination';
  return `${from} → ${to}`;
};

const buildTripStats = (trips = []) => {
  const totalTrips = trips.length;
  const completedTrips = trips.filter((trip) => String(trip?.status || '').toUpperCase() === 'COMPLETED').length;
  const startedTrips = trips.filter((trip) => String(trip?.status || '').toUpperCase() === 'STARTED').length;
  const cancelledTrips = trips.filter((trip) => String(trip?.status || '').toUpperCase() === 'CANCELLED').length;
  const totalDistance = trips.reduce((sum, trip) => sum + toNumber(trip?.distance_km), 0);
  const avgDistance = totalTrips ? totalDistance / totalTrips : 0;

  const routeCounts = new Map();
  trips.forEach((trip) => {
    const route = getRouteKey(trip);
    routeCounts.set(route, (routeCounts.get(route) || 0) + 1);
  });

  const topRoutes = [...routeCounts.entries()]
    .map(([route, count]) => ({ route, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentTrips = [...trips]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  return {
    totalTrips,
    completedTrips,
    startedTrips,
    cancelledTrips,
    totalDistance,
    avgDistance,
    topRoutes,
    recentTrips,
  };
};

const buildPaymentStats = (payments = []) => {
  const paidPayments = payments.filter((payment) => String(payment?.status || '').toLowerCase() === 'paid');
  const totalRevenue = paidPayments.reduce((sum, payment) => sum + toNumber(payment?.amount), 0);
  const tripFarePayments = paidPayments.filter((payment) => String(payment?.purpose || '').toLowerCase() === 'trip_fare');
  const walletTopups = paidPayments.filter((payment) => String(payment?.purpose || '').toLowerCase() === 'wallet_topup');

  return {
    totalRevenue,
    paidPaymentsCount: paidPayments.length,
    tripFarePaymentsCount: tripFarePayments.length,
    walletTopupCount: walletTopups.length,
  };
};

const buildVehicleStats = (vehicles = []) => {
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter((vehicle) => vehicle?.isActive !== false).length;
  const inactiveVehicles = totalVehicles - activeVehicles;
  const totalSeats = vehicles.reduce((sum, vehicle) => sum + toNumber(vehicle?.seatingCapacity), 0);

  return {
    totalVehicles,
    activeVehicles,
    inactiveVehicles,
    totalSeats,
    avgSeats: totalVehicles ? totalSeats / totalVehicles : 0,
  };
};

exports.getReportsOverview = async (req, res) => {
  try {
    const [trips, payments, vehicles] = await Promise.all([
      Trip.find({}).sort({ createdAt: -1 }).lean(),
      Payment.find({}).sort({ createdAt: -1 }).lean(),
      Vehicle.find({}).sort({ createdAt: -1 }).lean(),
    ]);

    const tripStats = buildTripStats(trips);
    const paymentStats = buildPaymentStats(payments);
    const vehicleStats = buildVehicleStats(vehicles);

    res.status(200).json({
      success: true,
      overview: {
        totalTrips: tripStats.totalTrips,
        completedTrips: tripStats.completedTrips,
        startedTrips: tripStats.startedTrips,
        cancelledTrips: tripStats.cancelledTrips,
        totalDistance: tripStats.totalDistance,
        avgDistance: tripStats.avgDistance,
        totalRevenue: paymentStats.totalRevenue,
        paidPaymentsCount: paymentStats.paidPaymentsCount,
        activeVehicles: vehicleStats.activeVehicles,
        totalVehicles: vehicleStats.totalVehicles,
        topRoutes: tripStats.topRoutes,
        recentTrips: tripStats.recentTrips,
      },
      trips,
      payments,
      vehicles,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTripAnalytics = async (req, res) => {
  try {
    const trips = await Trip.find({}).sort({ createdAt: -1 }).lean();
    const tripStats = buildTripStats(trips);

    res.status(200).json({
      success: true,
      ...tripStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRevenueAnalytics = async (req, res) => {
  try {
    const payments = await Payment.find({}).sort({ createdAt: -1 }).lean();
    const paymentStats = buildPaymentStats(payments);

    res.status(200).json({
      success: true,
      ...paymentStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVehicleAnalytics = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({}).sort({ createdAt: -1 }).lean();
    const vehicleStats = buildVehicleStats(vehicles);

    res.status(200).json({
      success: true,
      ...vehicleStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getReportsOverview,
  getTripAnalytics,
  getRevenueAnalytics,
  getVehicleAnalytics,
};
