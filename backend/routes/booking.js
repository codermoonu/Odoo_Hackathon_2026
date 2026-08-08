const express = require("express");
const router = express.Router();
const { 
    bookRide, 
    getMyBookings 
} = require("../controllers/bookingController");
const protect = require("../middlewares/userMiddleware");

router.use(protect);

router.route("/")
  .post(bookRide);

router.route("/my-bookings")
  .get(getMyBookings);

module.exports = router;