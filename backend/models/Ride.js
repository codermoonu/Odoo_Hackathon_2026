const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  driver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  organization: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Organization" 
  },
  vehicle: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Vehicle", 
    required: true 
  },
  pickupLocation: { 
    type: String, 
    required: true 
  },
  destination: { 
    type: String, 
    required: true 
  },
  travelDate: { 
    type: Date, 
    required: true 
  },
  travelTime: { 
    type: String, 
    required: true 
  },
  availableSeats: { 
    type: Number, 
    required: true 
  },
  farePerSeat: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["Published", "FullyBooked", "InProgress", "Completed", "Cancelled"], 
    default: "Published" 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model("Ride", rideSchema);