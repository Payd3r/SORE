
const express = require('express');
const { 
  getIdeas, 
  getIdea, 
  createIdea,
  updateIdea, 
  completeIdea, 
  deleteIdea 
} = require('../controllers/ideaController');
const { authenticate, requireCouple } = require('../middlewares/auth');

const router = express.Router();

// Protected routes
router.get('/couples/:coupleId/ideas', authenticate, requireCouple, getIdeas);
router.get('/:ideaId', authenticate, getIdea);
router.post('/', authenticate, requireCouple, createIdea);
router.put('/:ideaId', authenticate, requireCouple, updateIdea);
router.put('/:ideaId/complete', authenticate, requireCouple, completeIdea);
router.delete('/:ideaId', authenticate, requireCouple, deleteIdea);

module.exports = router;
