/**
 * Maps & Routing Service Configurations
 * Enterprise Carpool Platform - Hackathon 2026
 */
module.exports = {
  // OSRM Base URL for driving routing calculation
  OSRM_BASE_URL: process.env.OSRM_BASE_URL || 'https://router.project-osrm.org/route/v1/driving',

  // Nominatim OpenStreetMap Geocoding API Base URL
  NOMINATIM_BASE_URL: process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org/search',

  // Default Map center coordinates (Default: Bengaluru India, editable)
  DEFAULT_CENTER: {
    lat: 12.9716,
    lng: 77.5946,
    zoom: 12
  },

  // Map Tile Provider Settings (CartoDB Dark Matter / OpenStreetMap)
  TILE_PROVIDER: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  },

  // Organization-wide Operational Cost Parameters for Fare Calculations
  FARE_CONFIG: {
    BASE_FARE: 20.0,        // Base ride charge
    COST_PER_KM: 8.5,       // Operational cost per kilometer
    FUEL_RATE_FACTOR: 1.25  // Multiplier considering current fuel efficiency trends
  }
};
