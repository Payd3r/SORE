
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure storage
const storage = multer.memoryStorage();

// Configure file filter
const fileFilter = (req, file, cb) => {
  // Accept images only, including HEIC files
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|heic|HEIC)$/i)) {
    return cb(new Error('Solo file immagine sono permessi!'), false);
  }
  cb(null, true);
};

// Configure upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max file size
  }
});

module.exports = upload;
