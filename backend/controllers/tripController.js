/**
 * Trip Controller for MongoDB & Fallback Memory Persistence
 */
const Trip = require('../models/Trip');
const trackingService = require('../services/tracking');

/**
 * Create & Confirm a Published Ride / Trip
 */
exports.createTrip = async (req, res) => {
  try {
    const {
      start_address,
      start_coords,
      dest_address,
      dest_coords,
      route_geometry,
      distance_km,
      duration_mins,
      fare_per_seat,
      driver_name,
      vehicle,
      available_seats
    } = req.body;

    if (!start_coords || !dest_coords || !route_geometry) {
      return res.status(400).json({
        success: false,
        error: 'Missing start_coords, dest_coords, or route_geometry.'
      });
    }

    const tripId = 'TRIP-' + Math.floor(100000 + Math.random() * 900000);

    const tripPayload = {
      trip_id: tripId,
      driver_name: driver_name || 'John Doe (Employee #402)',
      vehicle: vehicle || 'Toyota Camry (KA-01-AB-1234)',
      start_address,
      start_coords: { lat: parseFloat(start_coords.lat), lng: parseFloat(start_coords.lng) },
      dest_address,
      dest_coords: { lat: parseFloat(dest_coords.lat), lng: parseFloat(dest_coords.lng) },
      route_geometry: route_geometry.type ? route_geometry : { type: 'LineString', coordinates: route_geometry.coordinates },
      distance_km: parseFloat(distance_km),
      duration_mins: parseFloat(duration_mins),
      fare_per_seat: parseFloat(fare_per_seat),
      available_seats: available_seats || 3,
      status: 'PUBLISHED',
      current_location: { lat: parseFloat(start_coords.lat), lng: parseFloat(start_coords.lng) }
    };

    // Save in Tracking Service Memory State
    trackingService.getTripState(tripId, tripPayload);

    // Save to MongoDB if connected
    try {
      if (Trip.db && Trip.db.readyState === 1) {
        const newTrip = new Trip(tripPayload);
        await newTrip.save();
      }
    } catch (dbErr) {
      console.warn('[DB Notice] Stored in-memory fallback:', dbErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Trip successfully published and confirmed!',
      trip: { ...tripPayload, id: tripId }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get All Active Trips
 */
exports.getAllTrips = async (req, res) => {
  try {
    if (Trip.db && Trip.db.readyState === 1) {
      const trips = await Trip.find().sort({ createdAt: -1 });
      return res.json({ success: true, trips });
    }

    // Fallback to tracking service state
    const states = Array.from(trackingService.tripStates.values());
    res.json({ success: true, trips: states });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get Single Trip Details by ID
 */
exports.getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    if (Trip.db && Trip.db.readyState === 1) {
      const trip = await Trip.findOne({ trip_id: id });
      if (trip) {
        return res.json({ success: true, trip });
      }
    }

    const state = trackingService.getTripState(id);
    if (!state) {
      return res.status(404).json({ success: false, error: 'Trip not found.' });
    }

    res.json({
      success: true,
      trip: state,
      location_history: trackingService.getLocationHistory(id)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Update Trip Status (STARTED, COMPLETED, CANCELLED)
 */
exports.updateTripStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedState = trackingService.updateTripStatus(id, status);

    if (Trip.db && Trip.db.readyState === 1) {
      await Trip.findOneAndUpdate({ trip_id: id }, { status });
    }

    res.json({
      success: true,
      message: `Trip status updated to ${status}`,
      trip: updatedState
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
