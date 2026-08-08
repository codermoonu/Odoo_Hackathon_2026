/**
 * Distance Calculation Utilities
 * Enterprise Carpool Platform - Hackathon 2026
 */

/**
 * Calculate straight-line distance between two coordinates using the Haversine Formula
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Distance in kilometers
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2);
}

/**
 * Calculate total distance along a GeoJSON line string geometry path
 * @param {Array<Array<number>>} coordinates Array of [lng, lat]
 * @returns {number} Distance in kilometers
 */
function calculatePolylineDistance(coordinates) {
  if (!coordinates || coordinates.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[i + 1];
    // GeoJSON point format is [lng, lat]
    totalDistance += calculateHaversineDistance(p1[1], p1[0], p2[1], p2[0]);
  }
  
  return +totalDistance.toFixed(2);
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

module.exports = {
  calculateHaversineDistance,
  calculatePolylineDistance
};
