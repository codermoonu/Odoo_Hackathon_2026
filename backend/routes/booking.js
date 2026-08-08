const express = require("express");
const router = express.Router();
const protect = require("../middlewares/userMiddleware");
const { bookRide, getMyBookings } = require("../controllers/bookingController");

router.use(protect);
router.post("/", bookRide);
router.get("/mine", getMyBookings);

module.exports = router;