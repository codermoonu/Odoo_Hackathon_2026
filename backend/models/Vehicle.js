const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },

    make: { type: String, trim: true },
    model: { type: String, required: true, trim: true },
    registrationNumber: { type: String, required: true, unique: true, trim: true },
    seatingCapacity: { type: Number, required: true, min: 1 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Vehicle = mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);

module.exports = Vehicle;
