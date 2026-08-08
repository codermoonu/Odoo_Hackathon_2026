const Trip = require('../models/Trip');

/**
 * Match search criteria against published trips and rank them.
 * 
 * @param {Object} criteria - The search parameters.
 * @param {string} criteria.pickupLocation - User's starting point.
 * @param {string} criteria.destination - User's drop-off point.
 * @param {number} criteria.seatsRequired - Number of seats needed.
 * @returns {Array} - Ranked list of matching trips.
 */
const searchAndMatchRides = async ({ pickupLocation, destination, seatsRequired = 1 }) => {
  try {
    // 1. Build the base query for active, published rides with enough seats
    const query = {
      status: 'PUBLISHED',
      available_seats: { $gte: parseInt(seatsRequired) }
    };

    // 2. Add location filters using case-insensitive regex for flexible matching
    if (pickupLocation) {
      query.start_address = { $regex: pickupLocation, $options: 'i' };
    }
    if (destination) {
      query.dest_address = { $regex: destination, $options: 'i' };
    }

    // 3. Execute query
    const matchingTrips = await Trip.find(query).lean();

    // 4. Rank/Filter results (Ranking by cheapest fare first)
    matchingTrips.sort((a, b) => a.fare_per_seat - b.fare_per_seat);

    return matchingTrips;
  } catch (error) {
    console.error("Error in ride matching service:", error.message);
    throw new Error("Failed to search for rides");
  }
};

module.exports = {
  searchAndMatchRides
};