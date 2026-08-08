const Booking = require("../models/Booking");
const Ride = require("../models/Ride");

const bookRide = async (req, res) => {
  try {
    const { rideId, seatsToBook } = req.body;
    if (!rideId || !seatsToBook) {
      return res.status(400).json({ message: "rideId and seatsToBook are required" });
    }

    const seats = parseInt(seatsToBook, 10);
    if (!Number.isInteger(seats) || seats < 1) {
      return res.status(400).json({ message: "seatsToBook must be a positive integer" });
    }

    const rideCheck = await Ride.findById(rideId);
    if (!rideCheck) return res.status(404).json({ message: "Ride not found" });
    if (rideCheck.driver.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot book your own ride" });
    }

    // Atomic conditional decrement: the availableSeats >= seats guard is
    // checked and applied in the same DB write. If two requests race for
    // the last seat, only the first to reach Mongo will match the guard —
    // the second gets ride === null below rather than an overbooked count.
    const ride = await Ride.findOneAndUpdate(
      { _id: rideId, status: "Published", availableSeats: { $gte: seats } },
      [
        { $set: { availableSeats: { $subtract: ["$availableSeats", seats] } } },
        {
          $set: {
            status: { $cond: [{ $eq: ["$availableSeats", 0] }, "FullyBooked", "$status"] },
          },
        },
      ],
      { new: true }
    );

    if (!ride) {
      return res.status(409).json({
        message: "Not enough seats available — someone may have just booked them.",
      });
    }

    const totalFare = ride.farePerSeat * seats;

    const booking = await Booking.create({
      passenger: req.user._id,
      ride: rideId,
      driver: ride.driver,
      seatsBooked: seats,
      totalFare,
      status: "Confirmed",
      paymentStatus: "Pending",
    });

    res.status(201).json({ booking, ride });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ passenger: req.user._id })
      .populate({
        path: "ride",
        populate: { path: "driver vehicle", select: "name phone make model registrationNumber" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { bookRide, getMyBookings };