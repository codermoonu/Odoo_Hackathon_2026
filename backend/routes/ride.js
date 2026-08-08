const express = require("express");
const router = express.Router();
const protect = require("../middlewares/userMiddleware");
const { publishRide, searchRides, getRideById } = require("../controllers/rideController");

router.use(protect);
router.post("/", publishRide);
router.get("/search", searchRides);
router.get("/:id", getRideById);

module.exports = router;