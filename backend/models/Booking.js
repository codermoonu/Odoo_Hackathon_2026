const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    passenger: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ride: { type: mongoose.Schema.Types.ObjectId, ref: "Ride", required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seatsBooked: { type: Number, required: true, default: 1 },
    totalFare: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Confirmed", "Active", "Completed", "Cancelled"],
      default: "Confirmed",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Refunded"],
      default: "Pending",
    },
    paymentMethod: { type: String, enum: ["Cash", "Card", "UPI", "Wallet"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);