const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Ride = require("../models/Ride");

const bookRide = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { rideId, seatsToBook } = req.body;

    if (!rideId || !seatsToBook) {
      return res.status(400).json({ message: "rideId and seatsToBook are required" });
    }

    const ride = await Ride.findById(rideId).session(session);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.driver.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot book your own ride" });
    }

    if (ride.availableSeats < seatsToBook) {
      return res.status(400).json({ message: "Not enough seats available" });
    }

    // Deduct seats and update ride status if full
    ride.availableSeats -= seatsToBook;
    if (ride.availableSeats === 0) {
        ride.status = "FullyBooked";
    }
    await ride.save({ session });

    const totalFare = ride.farePerSeat * seatsToBook;

    const booking = await Booking.create([{
      passenger: req.user._id,
      ride: rideId,
      driver: ride.driver,
      seatsBooked: seatsToBook,
      totalFare: totalFare,
      status: "Confirmed", 
      paymentStatus: "Pending"
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(booking[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ passenger: req.user._id })
      .populate({
          path: 'ride',
          populate: { path: 'driver vehicle', select: 'name phone make model registrationNumber' }
      })
      .sort({ createdAt: -1 });
      
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { bookRide, getMyBookings };