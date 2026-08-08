/**
 * Route & Maps Express API Routes
 * Enterprise Carpool Platform - Hackathon 2026
 */
const express = require('express');
const router = express.Router();
const routeCalculationService = require('../services/routeCalculation');
const { calculateFare } = require('../utils/calculateFare');

/**
 * @route   GET /api/route/geocode
 * @desc    Geocode address string to latitude/longitude
 * @access  Public / Authenticated Employees
 */
router.get('/geocode', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, error: 'Query parameter "q" is required.' });
    }

    const matches = await routeCalculationService.geocode(q);
    res.json({ success: true, results: matches });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   POST /api/route/preview
 * @desc    Calculate OSRM driving route preview, distance, travel time & fare
 * @access  Public / Authenticated Employees
 */
router.post('/preview', async (req, res) => {
  try {
    const { origin_lat, origin_lng, dest_lat, dest_lng } = req.body;
    if (!origin_lat || !origin_lng || !dest_lat || !dest_lng) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: origin_lat, origin_lng, dest_lat, dest_lng'
      });
    }

    const routeResult = await routeCalculationService.calculateRoute(
      parseFloat(origin_lat),
      parseFloat(origin_lng),
      parseFloat(dest_lat),
      parseFloat(dest_lng)
    );

    res.json({
      success: true,
      route: routeResult
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   POST /api/route/calculate-fare
 * @desc    Calculate fare estimate based on distance
 * @access  Public / Authenticated Employees
 */
router.post('/calculate-fare', (req, res) => {
  try {
    const { distance_km } = req.body;
    if (distance_km === undefined) {
      return res.status(400).json({ success: false, error: 'Parameter "distance_km" is required.' });
    }

    const fare = calculateFare(parseFloat(distance_km));
    res.json({
      success: true,
      distance_km: parseFloat(distance_km),
      estimated_fare_per_seat: fare
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
