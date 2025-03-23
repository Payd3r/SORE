
const express = require('express');
const { 
  getImages, 
  getImage, 
  uploadImage, 
  updateImage, 
  deleteImage, 
  toggleFavorite 
} = require('../controllers/imageController');
const { authenticate, requireCouple } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

// Protected routes
router.get('/couples/:coupleId/images', authenticate, requireCouple, getImages);
router.get('/:imageId', authenticate, getImage);
router.post('/upload', authenticate, requireCouple, upload.array('images', 20), uploadImage);
router.put('/:imageId', authenticate, requireCouple, updateImage);
router.delete('/:imageId', authenticate, requireCouple, deleteImage);
router.put('/:imageId/favorite', authenticate, requireCouple, toggleFavorite);

module.exports = router;
