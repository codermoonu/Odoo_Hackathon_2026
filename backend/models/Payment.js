const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },

    // Wallet payments settle instantly from the user's own balance and have
    // no Razorpay order at all — `sparse` so those don't collide on the
    // unique index (multiple missing values aren't treated as duplicates).
    method: { type: String, enum: ["razorpay", "wallet"], default: "razorpay" },
    razorpayOrderId: { type: String, unique: true, sparse: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },

    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: "INR" },
    purpose: {
      type: String,
      enum: ["trip_fare", "wallet_topup", "other"],
      default: "other",
    },
    notes: { type: mongoose.Schema.Types.Mixed },

    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
  },
  { timestamps: true }
);

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

module.exports = Payment;
