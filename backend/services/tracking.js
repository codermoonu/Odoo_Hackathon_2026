/**
 * Live Tracking Service
 * Enterprise Carpool Platform - Hackathon 2026
 */

class TrackingService {
  constructor() {
    // Map of active trip states: tripId -> state object
    this.tripStates = new Map();
    // Map of location history logs: tripId -> Array of coordinate logs
    this.locationHistory = new Map();
  }

  /**
   * Initialize or retrieve trip tracking state
   * @param {string} tripId 
   * @param {Object} [initialTripData] 
   * @returns {Object} Trip tracking state
   */
  getTripState(tripId, initialTripData = null) {
    if (this.tripStates.has(tripId)) {
      return this.tripStates.get(tripId);
    }

    if (initialTripData) {
      const newState = {
        trip_id: tripId,
        status: initialTripData.status || 'PUBLISHED',
        current_location: initialTripData.start_coords || { lat: 0, lng: 0 },
        last_updated: new Date().toISOString()
      };
      this.tripStates.set(tripId, newState);
      this.locationHistory.set(tripId, [newState.current_location]);
      return newState;
    }

    return null;
  }

  /**
   * Update current live vehicle location for an active trip
   * @param {string} tripId 
   * @param {Object} locationData { lat, lng, speed, heading }
   * @returns {Object} Updated trip state
   */
  updateLocation(tripId, locationData) {
    let state = this.tripStates.get(tripId);
    if (!state) {
      state = {
        trip_id: tripId,
        status: 'IN_PROGRESS',
        current_location: locationData,
        last_updated: new Date().toISOString()
      };
    } else {
      state.current_location = locationData;
      state.last_updated = new Date().toISOString();
      if (state.status === 'STARTED' || state.status === 'PUBLISHED') {
        state.status = 'IN_PROGRESS';
      }
    }

    this.tripStates.set(tripId, state);

    // Save location log entry
    const history = this.locationHistory.get(tripId) || [];
    history.push({ ...locationData, timestamp: new Date().toISOString() });
    this.locationHistory.set(tripId, history);

    return state;
  }

  /**
   * Update active trip execution status
   * @param {string} tripId 
   * @param {string} status ('STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED')
   * @returns {Object} Updated trip state
   */
  updateTripStatus(tripId, status) {
    let state = this.tripStates.get(tripId) || {
      trip_id: tripId,
      current_location: { lat: 0, lng: 0 }
    };

    state.status = status;
    state.last_updated = new Date().toISOString();

    this.tripStates.set(tripId, state);
    return state;
  }

  /**
   * Get location history logs for trip reporting & analytics
   * @param {string} tripId 
   * @returns {Array} Array of historical coordinates
   */
  getLocationHistory(tripId) {
    return this.locationHistory.get(tripId) || [];
  }
}

// Singleton instance
module.exports = new TrackingService();
