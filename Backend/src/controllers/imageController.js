
const { Image, User, Memory, Couple, GeoLocation } = require('../models');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

// Get all images for a couple
exports.getImages = async (req, res) => {
  try {
    const { coupleId } = req.params;
    const { type, startDate, endDate } = req.query;

    // Build filter conditions
    const whereConditions = { coupleId };
    if (type) {
      whereConditions.type = type;
    }
    if (startDate && endDate) {
      whereConditions.date = {
        [Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereConditions.date = {
        [Sequelize.Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereConditions.date = {
        [Sequelize.Op.lte]: new Date(endDate)
      };
    }

    const images = await Image.findAll({
      where: whereConditions,
      include: [
        {
          model: GeoLocation,
          as: 'location',
          required: false
        }
      ],
      order: [['date', 'DESC']]
    });

    res.status(200).json(images);
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ message: 'Error fetching images', error: error.message });
  }
};

// Get image by ID
exports.getImage = async (req, res) => {
  try {
    const image = await Image.findByPk(req.params.imageId, {
      include: [
        {
          model: GeoLocation,
          as: 'location',
          required: false
        },
        {
          model: Memory,
          required: false,
          attributes: ['id', 'title']
        }
      ]
    });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.status(200).json(image);
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ message: 'Error fetching image', error: error.message });
  }
};

// Upload image
exports.uploadImage = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files uploaded' });
    }

    const { name, type, memoryId, date, locationName, latitude, longitude } = req.body;
    const coupleId = req.body.coupleId || req.user.coupleId;

    if (!coupleId) {
      return res.status(400).json({ message: 'User must be in a couple to upload images' });
    }

    const mediaFolder = process.env.MEDIA_PATH || '../media';
    const thumbsFolder = path.join(mediaFolder, 'thumbs');
    
    // Create folders if they don't exist
    if (!fs.existsSync(mediaFolder)) {
      fs.mkdirSync(mediaFolder, { recursive: true });
    }
    if (!fs.existsSync(thumbsFolder)) {
      fs.mkdirSync(thumbsFolder, { recursive: true });
    }

    const uploadedImages = [];

    // Process each file
    for (const file of req.files) {
      const imageId = uuidv4();
      const filename = `image_${imageId}_${Date.now()}${path.extname(file.originalname)}`;
      const filepath = path.join(mediaFolder, filename);
      const thumbpath = path.join(thumbsFolder, filename);

      // Write original file
      fs.writeFileSync(filepath, file.buffer);

      // Generate thumbnail
      await sharp(file.buffer)
        .resize(400, 400, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFile(thumbpath);

      // Create image record
      const image = await Image.create({
        id: imageId,
        name: name || file.originalname,
        url: `/media/${filename}`,
        thumbnailUrl: `/media/thumbs/${filename}`,
        type: type || 'landscape',
        date: date ? new Date(date) : new Date(),
        memoryId: memoryId || null,
        userId: req.user.id,
        uploaderName: req.user.name,
        coupleId
      });

      // Create location if provided
      if (latitude && longitude) {
        const location = await GeoLocation.create({
          latitude,
          longitude,
          name: locationName,
          imageId: image.id,
          coupleId
        });

        // Include the location in the response
        image.dataValues.location = location;
      }

      uploadedImages.push(image);

      // Increment user's uploadCount
      await User.increment('uploadCount', {
        by: 1,
        where: { id: req.user.id }
      });
    }

    res.status(201).json(uploadedImages);
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
};

// Update image
exports.updateImage = async (req, res) => {
  try {
    const { name, type, memoryId, isFavorite, locationName, latitude, longitude } = req.body;
    const image = await Image.findByPk(req.params.imageId, {
      include: [
        {
          model: GeoLocation,
          as: 'location',
          required: false
        }
      ]
    });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Check permission - only users in the same couple can update images
    if (image.coupleId !== req.user.coupleId) {
      return res.status(403).json({ message: 'Not authorized to update this image' });
    }

    // Update image
    await image.update({
      name: name !== undefined ? name : image.name,
      type: type || image.type,
      memoryId: memoryId !== undefined ? memoryId : image.memoryId,
      isFavorite: isFavorite !== undefined ? isFavorite : image.isFavorite
    });

    // Update or create location
    if (latitude && longitude) {
      if (image.location) {
        await image.location.update({
          latitude,
          longitude,
          name: locationName
        });
      } else {
        const location = await GeoLocation.create({
          latitude,
          longitude,
          name: locationName,
          imageId: image.id,
          coupleId: image.coupleId
        });
        image.dataValues.location = location;
      }
    } else if (image.location && (latitude === null || longitude === null)) {
      // Remove location if explicitly set to null
      await image.location.destroy();
      image.dataValues.location = null;
    }

    // Get updated image
    const updatedImage = await Image.findByPk(req.params.imageId, {
      include: [
        {
          model: GeoLocation,
          as: 'location',
          required: false
        },
        {
          model: Memory,
          required: false,
          attributes: ['id', 'title']
        }
      ]
    });

    res.status(200).json(updatedImage);
  } catch (error) {
    console.error('Update image error:', error);
    res.status(500).json({ message: 'Error updating image', error: error.message });
  }
};

// Delete image
exports.deleteImage = async (req, res) => {
  try {
    const image = await Image.findByPk(req.params.imageId, {
      include: [
        {
          model: GeoLocation,
          as: 'location',
          required: false
        }
      ]
    });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Check permission - only users in the same couple can delete images
    if (image.coupleId !== req.user.coupleId) {
      return res.status(403).json({ message: 'Not authorized to delete this image' });
    }

    // Delete physical files
    const originalPath = path.join(process.cwd(), image.url);
    const thumbPath = path.join(process.cwd(), image.thumbnailUrl);
    
    if (fs.existsSync(originalPath)) {
      fs.unlinkSync(originalPath);
    }
    if (fs.existsSync(thumbPath)) {
      fs.unlinkSync(thumbPath);
    }

    // Delete location if exists
    if (image.location) {
      await image.location.destroy();
    }

    // Delete image record
    await image.destroy();

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
};

// Toggle favorite status
exports.toggleFavorite = async (req, res) => {
  try {
    const { isFavorite } = req.body;
    const image = await Image.findByPk(req.params.imageId);

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Check permission - only users in the same couple can update images
    if (image.coupleId !== req.user.coupleId) {
      return res.status(403).json({ message: 'Not authorized to update this image' });
    }

    // Update favorite status
    await image.update({ isFavorite });

    res.status(200).json({ id: image.id, isFavorite });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Error updating favorite status', error: error.message });
  }
};
