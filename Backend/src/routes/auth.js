
const express = require('express');
const { register, login, getCurrentUser, logout } = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/user', authenticate, getCurrentUser);

module.exports = router;
