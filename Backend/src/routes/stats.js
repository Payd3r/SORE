
const express = require('express');
const { getCoupleStats } = require('../controllers/statsController');
const { authenticate, requireCouple } = require('../middlewares/auth');

const router = express.Router();

// Protected routes
router.get('/couples/:coupleId/stats', authenticate, requireCouple, getCoupleStats);

module.exports = router;
