const mongoose = require("mongoose");

/**
 * Location Sub-schema
 * -----------------------------------------------------------------------
 * Used for both pickup and destination. Stored as GeoJSON Point so we
 * can run $near / $geoWithin queries during ride matching (Find a Ride).
 */
const locationSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    coordinates: {
      // GeoJSON: [longitude, latitude] — order matters for Mongo geo queries
      type: [Number],
      required: true,
      validate: {
        validator: (val) => Array.isArray(val) && val.length === 2,
        message: "Coordinates must be an array of [longitude, latitude]",
      },
    },
  },
  { _id: false }
);

const geoPointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },
  { _id: false }
);

/**
 * Route Snapshot Sub-schema
 * -----------------------------------------------------------------------
 * Captures the result of the Route Confirmation step (calculated via the
 * Maps service) at the time the ride was published or searched. Stored so
 * "Available Rides" can display route info without re-calling the Maps API.
 */
const routeSnapshotSchema = new mongoose.Schema(
  {
    distanceInKm: { type: Number, required: true },
    durationInMinutes: { type: Number, required: true },
    polyline: { type: String }, // encoded polyline for map rendering
  },
  { _id: false }
);

/**
 * Recurring Ride Sub-schema
 * -----------------------------------------------------------------------
 * "Recurring Ride" is a required field in Find/Offer a Ride. This captures
 * the pattern so the matching service can expand it into individual
 * ride instances or match against a recurring offer.
 */
const recurrenceSchema = new mongoose.Schema(
  {
    isRecurring: { type: Boolean, default: false },
    daysOfWeek: {
      // e.g. ["MON", "TUE", "WED", "THU", "FRI"]
      type: [String],
      enum: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
      default: [],
    },
    endDate: {
      // recurrence stops after this date; optional
      type: Date,
    },
  },
  { _id: false }
);

/**
 * Ride Schema
 * -----------------------------------------------------------------------
 * Represents a ride PUBLISHED by a driver (Offer a Ride). This same
 * document is what gets returned/matched against during Find a Ride
 * search, and what Available Rides renders.
 */
const rideSchema = new mongoose.Schema(
  {
    // ---- Driver & Vehicle ----
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "A registered vehicle is required to publish a ride"],
    },

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    // ---- Required Information (Find a Ride / Offer a Ride) ----
    pickup: {
      type: locationSchema,
      required: true,
    },

    destination: {
      type: locationSchema,
      required: true,
    },

    // Separate geo point fields (mirrors pickup/destination coordinates)
    // purely so we can attach 2dsphere indexes cleanly for $near queries.
    pickupPoint: {
      type: geoPointSchema,
      required: true,
    },

    destinationPoint: {
      type: geoPointSchema,
      required: true,
    },

    travelDate: {
      type: Date,
      required: [true, "Travel date is required"],
    },

    travelTime: {
      // stored as "HH:mm" (24hr) — kept separate from travelDate for
      // simpler search-by-time-window queries
      type: String,
      required: [true, "Travel time is required"],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Travel time must be in HH:mm format"],
    },

    availableSeats: {
      type: Number,
      required: [true, "Available seats is required"],
      min: [0, "Available seats cannot be negative"],
    },

    totalSeats: {
      // snapshot of seats offered at publish time; availableSeats decreases
      // as bookings come in, totalSeats stays fixed for reporting.
      type: Number,
      required: true,
    },

    farePerSeat: {
      type: Number,
      required: [true, "Fare per seat is required"],
      min: [0, "Fare cannot be negative"],
    },

    recurrence: {
      type: recurrenceSchema,
      default: () => ({}),
    },

    // ---- Route Confirmation ----
    route: {
      type: routeSnapshotSchema,
      required: true,
    },

    // ---- Ride lifecycle ----
    status: {
      type: String,
      enum: ["active", "full", "cancelled", "completed", "expired"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

// Geo indexes power proximity-based ride matching in rideMatching.service.js
rideSchema.index({ pickupPoint: "2dsphere" });
rideSchema.index({ destinationPoint: "2dsphere" });

// Common compound index for the Find a Ride search
// (date + time + status are filtered on almost every search query)
rideSchema.index({ travelDate: 1, status: 1 });

// Prevents overbooking: available seats must never exceed total seats
rideSchema.pre("save", function (next) {
  if (this.availableSeats > this.totalSeats) {
    return next(new Error("availableSeats cannot exceed totalSeats"));
  }
  next();
});

module.exports = mongoose.model("Ride", rideSchema);