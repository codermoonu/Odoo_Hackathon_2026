const express = require("express");
const authRoutes = require("./auth");
const vehicleRoutes = require("./vehicle");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/vehicles", vehicleRoutes);

module.exports = router;
