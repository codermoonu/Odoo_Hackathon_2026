/**
 * Trip Express API Routes
 * Enterprise Carpool Platform - Hackathon 2026
 */
const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const protect = require('../middlewares/userMiddleware');

router.post('/', protect, tripController.createTrip);
router.get('/', tripController.getAllTrips);
router.get('/:id', tripController.getTripById);
router.post('/:id/status', protect, tripController.updateTripStatus);

module.exports = router;
