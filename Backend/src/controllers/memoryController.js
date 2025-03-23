
const { Memory, Image, GeoLocation } = require('../models');
const { Sequelize } = require('sequelize');

// Get all memories for a couple
exports.getMemories = async (req, res) => {
  try {
    const { coupleId } = req.params;
    const { type, startDate, endDate } = req.query;

    // Build filter conditions
    const whereConditions = { coupleId };
    if (type) {
      whereConditions.type = type;
    }
    if (startDate && endDate) {
      whereConditions.startDate = {
        [Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereConditions.startDate = {
        [Sequelize.Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereConditions.startDate = {
        [Sequelize.Op.lte]: new Date(endDate)
      };
    }

    const memories = await Memory.findAll({
      where: whereConditions,
      include: [
        {
          model: GeoLocation,
          as: 'location',
          required: false
        },
        {
          model: Image,
          required: false
        }
      ],
      order: [['startDate', 'DESC']]
    });

    res.status(200).json(memories);
  } catch (error) {
    console.error('Get memories error:', error);
    res.status(500).json({ message: 'Error fetching memories', error: error.message });
  }
};

// Get memory by ID
exports.getMemory = async (req, res) => {
  try {
    const memory = await Memory.findByPk(req.params.memoryId, {
      include: [
        {
          model: GeoLocation,
          as: 'location',
          required: false
        },
        {
          model: Image,
          required: false,
          order: [['date', 'ASC']]
        }
      ]
    });

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    res.status(200).json(memory);
  } catch (error) {
    console.error('Get memory error:', error);
    res.status(500).json({ message: 'Error fetching memory', error: error.message });
  }
};

// Create memory
exports.createMemory = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      startDate,
      endDate,
      song,
      eventTag,
      imageIds,
      locationName,
      latitude,
      longitude
    } = req.body;

    // Create memory
    const memory = await Memory.create({
      title,
      description,
      type,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      song: song || null,
      eventTag: type === 'event' ? eventTag : null,
      userId: req.user.id,
      creatorName: req.user.name,
      coupleId: req.user.coupleId
    });

    // Create location if provided
    if (latitude && longitude) {
      const location = await GeoLocation.create({
        latitude,
        longitude,
        name: locationName,
        memoryId: memory.id,
        coupleId: req.user.coupleId
      });

      // Include the location in the response
      memory.dataValues.location = location;
    }

    // Associate images if provided
    if (imageIds && imageIds.length > 0) {
      await Image.update(
        { memoryId: memory.id },
        { where: { id: imageIds, coupleId: req.user.coupleId } }
      );

      // Get associated images
      const images = await Image.findAll({
        where: { id: imageIds, coupleId: req.user.coupleId }
      });

      memory.dataValues.images = images;
    } else {
      memory.dataValues.images = [];
    }

    res.status(201).json(memory);
  } catch (error) {
    console.error('Create memory error:', error);
    res.status(500).json({ message: 'Error creating memory', error: error.message });
  }
};

// Update memory
exports.updateMemory = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      startDate,
      endDate,
      song,
      eventTag,
      imageIds,
      locationName,
      latitude,
      longitude
    } = req.body;

    const memory = await Memory.findByPk(req.params.memoryId, {
      include: [
        {
          model: GeoLocation,
          as: 'location',
          required: false
        },
        {
          model: Image,
          required: false
        }
      ]
    });

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    // Check permission - only users in the same couple can update memories
    if (memory.coupleId !== req.user.coupleId) {
      return res.status(403).json({ message: 'Not authorized to update this memory' });
    }

    // Update memory
    await memory.update({
      title: title || memory.title,
      description: description !== undefined ? description : memory.description,
      type: type || memory.type,
      startDate: startDate ? new Date(startDate) : memory.startDate,
      endDate: endDate ? new Date(endDate) : memory.endDate,
      song: song !== undefined ? song : memory.song,
      eventTag: type === 'event' ? eventTag : null,
      updatedAt: new Date()
    });

    // Update or create location
    if (latitude && longitude) {
      if (memory.location) {
        await memory.location.update({
          latitude,
          longitude,
          name: locationName
        });
      } else {
        const location = await GeoLocation.create({
          latitude,
          longitude,
          name: locationName,
          memoryId: memory.id,
          coupleId: memory.coupleId
        });
        memory.dataValues.location = location;
      }
    } else if (memory.location && (latitude === null || longitude === null)) {
      // Remove location if explicitly set to null
      await memory.location.destroy();
      memory.dataValues.location = null;
    }

    // Update image associations if provided
    if (imageIds) {
      // First, remove memory association from all current images
      await Image.update(
        { memoryId: null },
        { where: { memoryId: memory.id } }
      );

      if (imageIds.length > 0) {
        // Then, associate new images
        await Image.update(
          { memoryId: memory.id },
          { where: { id: imageIds, coupleId: memory.coupleId } }
        );
      }

      // Get updated image list
      const images = await Image.findAll({
        where: { memoryId: memory.id }
      });

      memory.dataValues.images = images;
    }

    // Get the fully updated memory with all relations
    const updatedMemory = await Memory.findByPk(req.params.memoryId, {
      include: [
        {
          model: GeoLocation,
          as: 'location',
          required: false
        },
        {
          model: Image,
          required: false,
          order: [['date', 'ASC']]
        }
      ]
    });

    res.status(200).json(updatedMemory);
  } catch (error) {
    console.error('Update memory error:', error);
    res.status(500).json({ message: 'Error updating memory', error: error.message });
  }
};

// Delete memory
exports.deleteMemory = async (req, res) => {
  try {
    const memory = await Memory.findByPk(req.params.memoryId, {
      include: [
        {
          model: GeoLocation,
          as: 'location',
          required: false
        }
      ]
    });

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    // Check permission - only users in the same couple can delete memories
    if (memory.coupleId !== req.user.coupleId) {
      return res.status(403).json({ message: 'Not authorized to delete this memory' });
    }

    // First, unlink all images from this memory
    await Image.update(
      { memoryId: null },
      { where: { memoryId: memory.id } }
    );

    // Delete location if exists
    if (memory.location) {
      await memory.location.destroy();
    }

    // Delete memory
    await memory.destroy();

    res.status(200).json({ message: 'Memory deleted successfully' });
  } catch (error) {
    console.error('Delete memory error:', error);
    res.status(500).json({ message: 'Error deleting memory', error: error.message });
  }
};
