const express = require("express");
const router = express.Router();
const protect = require("../middlewares/userMiddleware");
const { bookRide, getMyBookings, getBookingById } = require("../controllers/bookingController");

router.use(protect);
router.post("/", bookRide);
router.get("/mine", getMyBookings);
// Must stay after /mine — /:id would otherwise swallow that literal path.
router.get("/:id", getBookingById);

module.exports = router;