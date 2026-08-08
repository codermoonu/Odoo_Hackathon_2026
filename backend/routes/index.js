const express = require("express");
const authRoutes = require("./auth");
const vehicleRoutes = require("./vehicle");
const paymentRoutes = require("./payment");
const adminRoutes = require("./admin");
const tripRoutes = require("./trip");
const routeRoutes = require("./route");
const rideRoutes = require("./ride");         // NEW
const bookingRoutes = require("./booking");   // NEW

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin", adminRoutes);
router.use("/trips", tripRoutes);
router.use("/route", routeRoutes);
router.use("/rides", rideRoutes);       // NEW
router.use("/bookings", bookingRoutes); // NEW

module.exports = router;
