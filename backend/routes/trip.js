/**
 * Trip Express API Routes
 * Enterprise Carpool Platform - Hackathon 2026
 */
const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

router.post('/', tripController.createTrip);
router.get('/', tripController.getAllTrips);
router.get('/:id', tripController.getTripById);
router.post('/:id/status', tripController.updateTripStatus);

module.exports = router;
