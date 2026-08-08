/**
 * Real-Time Vehicle Tracking Socket Handler
 * Enterprise Carpool Platform - Hackathon 2026
 */
const trackingService = require('../services/tracking');

/**
 * Handle tracking sockets for both Native WebSockets and Socket.io setups
 * @param {Object} socket - Socket connection instance
 * @param {Object} io - Socket.io or WebSocket Server instance
 */
function handleTrackingSockets(socket, io) {
  console.log('[TrackingSocket] Client connected:', socket.id || 'WebSocket Client');

  // Handle Joining Trip Room
  socket.on('join_trip', async (data) => {
    try {
      const { trip_id, role } = typeof data === 'string' ? JSON.parse(data) : data;
      if (!trip_id) return;

      const roomName = `trip_${trip_id}`;
      socket.join ? socket.join(roomName) : (socket.tripId = trip_id);
      socket.role = role || 'passenger';

      console.log(`[TrackingSocket] Client (${socket.role}) joined room: ${roomName}`);

      // Fetch latest trip tracking state
      const currentTripState = trackingService.getTripState(trip_id);
      const payload = {
        event: 'trip_state',
        trip_id,
        state: currentTripState
      };

      if (socket.emit) {
        socket.emit('trip_state', payload);
      } else {
        socket.send(JSON.stringify(payload));
      }
    } catch (err) {
      console.error('[TrackingSocket] Error joining trip room:', err.message);
    }
  });

  // Handle Driver Live Location Update
  socket.on('driver_location_update', async (data) => {
    try {
      const { trip_id, lat, lng, speed, heading } = typeof data === 'string' ? JSON.parse(data) : data;
      if (!trip_id || lat === undefined || lng === undefined) return;

      // Update location record in tracking service
      const updatedState = trackingService.updateLocation(trip_id, {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        speed: parseFloat(speed || 0),
        heading: parseFloat(heading || 0)
      });

      const broadcastPayload = {
        event: 'live_location_update',
        trip_id,
        location: updatedState.current_location,
        status: updatedState.status,
        updated_at: new Date().toISOString()
      };

      const roomName = `trip_${trip_id}`;

      // Broadcast to room if Socket.io or iterate if WebSocket server
      if (io && io.to) {
        io.to(roomName).emit('live_location_update', broadcastPayload);
      } else if (io && io.clients) {
        io.clients.forEach(client => {
          if (client.tripId === trip_id && client.readyState === 1) { // 1 = OPEN
            client.send(JSON.stringify(broadcastPayload));
          }
        });
      }
    } catch (err) {
      console.error('[TrackingSocket] Error updating driver location:', err.message);
    }
  });

  // Handle Trip Status Change (e.g. STARTED -> COMPLETED)
  socket.on('trip_status_change', async (data) => {
    try {
      const { trip_id, status } = typeof data === 'string' ? JSON.parse(data) : data;
      if (!trip_id || !status) return;

      const updatedState = trackingService.updateTripStatus(trip_id, status);
      const roomName = `trip_${trip_id}`;
      const statusPayload = {
        event: 'trip_status_updated',
        trip_id,
        status,
        state: updatedState
      };

      if (io && io.to) {
        io.to(roomName).emit('trip_status_updated', statusPayload);
      } else if (io && io.clients) {
        io.clients.forEach(client => {
          if (client.tripId === trip_id && client.readyState === 1) {
            client.send(JSON.stringify(statusPayload));
          }
        });
      }
    } catch (err) {
      console.error('[TrackingSocket] Error updating trip status:', err.message);
    }
  });

  // Handle Disconnection
  socket.on('disconnect', () => {
    console.log('[TrackingSocket] Client disconnected');
  });
}

module.exports = handleTrackingSockets;
