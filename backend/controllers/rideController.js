const Ride = require("../models/Ride");
const Vehicle = require("../models/Vehicle");

// Geocoded addresses vary in how much admin hierarchy they include for the
// same place ("Jadavpur, Kolkata, West Bengal, India" vs "Jadavpur, Kolkata,
// Kolkata Metropolitan Area, Kolkata, West Bengal, India"), so matching the
// full query string as a substring against the stored address misses valid
// hits. Match on the query's first (most specific) segment instead.
function addressSearchRegex(query) {
  const primaryTerm = query.split(",")[0].trim();
  if (!primaryTerm) return null;
  const escaped = primaryTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return { $regex: escaped, $options: "i" };
}

const publishRide = async (req, res) => {
  try {
    const {
      pickupLocation, destination, travelDate, travelTime,
      availableSeats, farePerSeat, vehicleId, organization,
      pickupLat, pickupLng, destinationLat, destinationLng,
    } = req.body;

    if (!pickupLocation || !destination || !travelDate || !travelTime || !availableSeats || !farePerSeat || !vehicleId) {
      return res.status(400).json({ message: "All ride details including vehicleId are required." });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Invalid vehicle or unauthorized." });
    }
    if (availableSeats > vehicle.seatingCapacity) {
      return res.status(400).json({ message: "Available seats cannot exceed vehicle capacity." });
    }

    const ride = await Ride.create({
      driver: req.user._id,
      organization: organization || req.user.organization,
      vehicle: vehicleId,
      pickupLocation,
      pickupLat,
      pickupLng,
      destination,
      destinationLat,
      destinationLng,
      travelDate,
      travelTime,
      availableSeats,
      farePerSeat,
      status: "Published",
    });

    res.status(201).json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchRides = async (req, res) => {
  try {
    const { pickupLocation, destination, travelDate, seatsRequired } = req.query;

    let query = { status: "Published", driver: { $ne: req.user._id } };
    if (pickupLocation) {
      const regex = addressSearchRegex(pickupLocation);
      if (regex) query.pickupLocation = regex;
    }
    if (destination) {
      const regex = addressSearchRegex(destination);
      if (regex) query.destination = regex;
    }
    if (travelDate) query.travelDate = new Date(travelDate);
    if (seatsRequired) query.availableSeats = { $gte: parseInt(seatsRequired, 10) };

    const rides = await Ride.find(query)
      .populate("driver", "name email phone")
      .populate("vehicle", "make model registrationNumber")
      .sort({ travelDate: 1, travelTime: 1 });

    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate("driver", "name phone")
      .populate("vehicle", "make model registrationNumber");
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    res.status(200).json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { publishRide, searchRides, getRideById };