const express = require("express");
const router = express.Router();
const { 
    publishRide, 
    searchRides, 
    getRideById 
} = require("../controllers/rideController");
const protect = require("../middlewares/userMiddleware");

router.use(protect);

router.route("/")
  .post(publishRide) // Offer a Ride
  .get(searchRides); // Find a Ride

router.route("/:id")
  .get(getRideById);

module.exports = router;