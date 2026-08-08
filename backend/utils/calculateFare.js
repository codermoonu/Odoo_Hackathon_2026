/**
 * Enterprise Fare Calculation Utility
 * Enterprise Carpool Platform - Hackathon 2026
 */
const mapsConfig = require('../config/maps');

/**
 * Calculate per-seat trip fare based on distance and admin configuration
 * @param {number} distanceKm Total distance in kilometers
 * @param {Object} [customFareConfig] Optional custom admin fare configuration
 * @returns {number} Estimated fare per seat
 */
function calculateFare(distanceKm, customFareConfig) {
  const config = customFareConfig || mapsConfig.FARE_CONFIG;
  const baseFare = config.BASE_FARE || 20.0;
  const costPerKm = config.COST_PER_KM || 8.5;
  const fuelFactor = config.FUEL_RATE_FACTOR || 1.25;

  if (!distanceKm || distanceKm <= 0) return baseFare;

  const totalCalculatedFare = baseFare + (distanceKm * costPerKm * fuelFactor);
  return +totalCalculatedFare.toFixed(2);
}

module.exports = {
  calculateFare
};
