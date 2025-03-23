
const express = require('express');
const { 
  getMemories, 
  getMemory, 
  createMemory, 
  updateMemory, 
  deleteMemory 
} = require('../controllers/memoryController');
const { authenticate, requireCouple } = require('../middlewares/auth');

const router = express.Router();

// Protected routes
router.get('/couples/:coupleId/memories', authenticate, requireCouple, getMemories);
router.get('/:memoryId', authenticate, getMemory);
router.post('/', authenticate, requireCouple, createMemory);
router.put('/:memoryId', authenticate, requireCouple, updateMemory);
router.delete('/:memoryId', authenticate, requireCouple, deleteMemory);

module.exports = router;
