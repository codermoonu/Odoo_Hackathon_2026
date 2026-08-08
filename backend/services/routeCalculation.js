/**
 * Route Calculation & Geocoding Service
 * Enterprise Carpool Platform - Hackathon 2026
 */
const mapsConfig = require('../config/maps');
const { calculateFare } = require('../utils/calculateFare');

class RouteCalculationService {
  /**
   * Geocode address string to latitude & longitude coordinates using Nominatim API
   * @param {string} query Search location address
   * @returns {Promise<Array>} List of geocoded result objects
   */
  static async geocode(query) {
    if (!query || typeof query !== 'string') return [];

    const url = `${mapsConfig.NOMINATIM_BASE_URL}?q=${encodeURIComponent(query)}&format=json&limit=5`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'EnterpriseCarpoolPlatform/1.0' }
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed with status: ${response.statusText}`);
    }

    const results = await response.json();
    return results.map(item => ({
      address: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    }));
  }

  /**
   * Calculate driving route between origin and destination via OSRM Engine API
   * @param {number} originLat 
   * @param {number} originLng 
   * @param {number} destLat 
   * @param {number} destLng 
   * @returns {Promise<Object>} Route data object containing distance, duration, fare, and geometry
   */
  static async calculateRoute(originLat, originLng, destLat, destLng) {
    // OSRM coordinates format: "longitude,latitude;longitude,latitude"
    const coordsStr = `${originLng},${originLat};${destLng},${destLat}`;
    const url = `${mapsConfig.OSRM_BASE_URL}/${coordsStr}?overview=full&geometries=geojson&steps=true`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OSRM Route Calculation error: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No driving route found between specified points.');
    }

    const route = data.routes[0];
    const distanceKm = +(route.distance / 1000).toFixed(2);
    const durationMins = +(route.duration / 60).toFixed(1);
    const farePerSeat = calculateFare(distanceKm);

    return {
      distance_km: distanceKm,
      duration_mins: durationMins,
      fare_per_seat: farePerSeat,
      geometry: route.geometry, // GeoJSON LineString coordinates [[lng, lat], ...]
      steps: route.legs[0]?.steps?.map(step => ({
        instruction: step.maneuver?.type,
        name: step.name || 'Road',
        distance_m: step.distance
      })) || []
    };
  }
}

module.exports = RouteCalculationService;
