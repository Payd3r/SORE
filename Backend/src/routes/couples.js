
const express = require('express');
const { 
  createCouple, 
  getCouple, 
  updateCouple, 
  joinCouple, 
  leaveCouple 
} = require('../controllers/coupleController');
const { authenticate, requireCouple } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

// Protected routes
router.post('/', authenticate, createCouple);
router.get('/:coupleId', authenticate, getCouple);
router.put('/:coupleId', authenticate, requireCouple, upload.single('avatar'), updateCouple);
router.post('/:coupleId/members', authenticate, joinCouple);
router.delete('/:coupleId/members', authenticate, requireCouple, leaveCouple);

module.exports = router;
