
const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const coupleRoutes = require('./couples');
const memoryRoutes = require('./memories');
const imageRoutes = require('./images');
const ideaRoutes = require('./ideas');
const statsRoutes = require('./stats');

const router = express.Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/couples', coupleRoutes);
router.use('/memories', memoryRoutes);
router.use('/images', imageRoutes);
router.use('/ideas', ideaRoutes);
router.use('/stats', statsRoutes);

module.exports = router;
