const mongoose = require("mongoose");

const coordSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
}, { _id: false });

const tripSchema = new mongoose.Schema({
  trip_id: { 
    type: String, 
    required: true, 
    unique: true 
  },
  driver_name: { 
    type: String, 
    required: true 
  },
  vehicle: { 
    type: String, 
    required: true 
  },
  start_address: { 
    type: String, 
    required: true 
  },
  start_coords: coordSchema,
  dest_address: { 
    type: String, 
    required: true 
  },
  dest_coords: coordSchema,
  route_geometry: {
    type: mongoose.Schema.Types.Mixed, // Allows flexible GeoJSON storage (LineString)
    required: true
  },
  distance_km: { 
    type: Number, 
    required: true 
  },
  duration_mins: { 
    type: Number, 
    required: true 
  },
  fare_per_seat: { 
    type: Number, 
    required: true 
  },
  available_seats: { 
    type: Number, 
    required: true,
    default: 3
  },
  status: { 
    type: String, 
    enum: ["PUBLISHED", "STARTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
    default: "PUBLISHED" 
  },
  current_location: coordSchema
}, { 
  timestamps: true 
});

module.exports = mongoose.model("Trip", tripSchema);