const express = require('express');
const cors = require('cors');

// Import routes
const indexRoutes = require('./routes/index'); // Matches your require('./routes')
const tripRoutes = require('./routes/trip');
const bookingRoutes = require('./routes/booking');
const rideRoutes = require('./routes/ride');

const app = express();

// Middleware
app.use(cors());
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Health check route
app.get('/', (req, res) => {
  res.send('Carpooling API running');
});

// Mount Routes
app.use('/api', indexRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rides', rideRoutes);

// Export the configured app
module.exports = app;