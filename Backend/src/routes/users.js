
const express = require('express');
const { getUser, updateUser } = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

// Protected routes
router.get('/:userId', authenticate, getUser);
router.put('/:userId', authenticate, upload.single('avatar'), updateUser);

module.exports = router;
