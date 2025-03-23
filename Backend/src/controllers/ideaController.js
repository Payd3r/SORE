
const { Idea, GeoLocation } = require('../models');
const { Sequelize } = require('sequelize');

// Get all ideas for a couple
exports.getIdeas = async (req, res) => {
  try {
    const { coupleId } = req.params;
    const { type, completed } = req.query;

    // Build filter conditions
    const whereConditions = { coupleId };
    if (type) {
      whereConditions.type = type;
    }
    if (completed !== undefined) {
      whereConditions.completed = completed === 'true';
    }

    const ideas = await Idea.findAll({
      where: whereConditions,
      include: [
        {
          model: GeoLocation,
          as: 'location',
          required: false
        }
      ],
      order: [
        ['completed', 'ASC'],
        ['createdAt', 'DESC']
      ]
    });

    res.status(200).json(ideas);
  } catch (error) {
    console.error('Get ideas error:', error);
    res.status(500).json({ message: 'Error fetching ideas', error: error.message });
  }
};

// Get idea by ID
exports.getIdea = async (req, res) => {
  try {
    const idea = await Idea.findByPk(req.params.ideaId, {
      include: [
        {
          model: GeoLocation,
          as: 'location',
          required: false
        }
      ]
    });

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    res.status(200).json(idea);
  } catch (error) {
    console.error('Get idea error:', error);
    res.status(500).json({ message: 'Error fetching idea', error: error.message });
  }
};

// Create idea
exports.createIdea = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      priority,
      dueDate,
      locationName,
      latitude,
      longitude
    } = req.body;

    // Create idea
    const idea = await Idea.create({
      title,
      description,
      type,
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      completed: false,
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
        ideaId: idea.id,
        coupleId: req.user.coupleId
      });

      // Include the location in the response
      idea.dataValues.location = location;
    }

    res.status(201).json(idea);
  } catch (error) {
    console.error('Create idea error:', error);
    res.status(500).json({ message: 'Error creating idea', error: error.message });
  }
};

// Update idea
exports.updateIdea = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      priority,
      dueDate,
      locationName,
      latitude,
      longitude
    } = req.body;

    const idea = await Idea.findByPk(req.params.ideaId, {
      include: [
        {
          model: GeoLocation,
          as: 'location',
          required: false
        }
      ]
    });

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    // Check permission - only users in the same couple can update ideas
    if (idea.coupleId !== req.user.coupleId) {
      return res.status(403).json({ message: 'Not authorized to update this idea' });
    }

    // Update idea
    await idea.update({
      title: title || idea.title,
      description: description !== undefined ? description : idea.description,
      type: type || idea.type,
      priority: priority || idea.priority,
      dueDate: dueDate ? new Date(dueDate) : idea.dueDate
    });

    // Update or create location
    if (latitude && longitude) {
      if (idea.location) {
        await idea.location.update({
          latitude,
          longitude,
          name: locationName
        });
      } else {
        const location = await GeoLocation.create({
          latitude,
          longitude,
          name: locationName,
          ideaId: idea.id,
          coupleId: idea.coupleId
        });
        idea.dataValues.location = location;
      }
    } else if (idea.location && (latitude === null || longitude === null)) {
      // Remove location if explicitly set to null
      await idea.location.destroy();
      idea.dataValues.location = null;
    }

    // Get the fully updated idea
    const updatedIdea = await Idea.findByPk(req.params.ideaId, {
      include: [
        {
          model: GeoLocation,
          as: 'location',
          required: false
        }
      ]
    });

    res.status(200).json(updatedIdea);
  } catch (error) {
    console.error('Update idea error:', error);
    res.status(500).json({ message: 'Error updating idea', error: error.message });
  }
};

// Complete idea
exports.completeIdea = async (req, res) => {
  try {
    const idea = await Idea.findByPk(req.params.ideaId);

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    // Check permission - only users in the same couple can update ideas
    if (idea.coupleId !== req.user.coupleId) {
      return res.status(403).json({ message: 'Not authorized to update this idea' });
    }

    // Update idea
    await idea.update({
      completed: true,
      completedAt: new Date(),
      completedById: req.user.id,
      completedByName: req.user.name
    });

    // Get the updated idea
    const updatedIdea = await Idea.findByPk(req.params.ideaId, {
      include: [
        {
          model: GeoLocation,
          as: 'location',
          required: false
        }
      ]
    });

    res.status(200).json(updatedIdea);
  } catch (error) {
    console.error('Complete idea error:', error);
    res.status(500).json({ message: 'Error completing idea', error: error.message });
  }
};

// Delete idea
exports.deleteIdea = async (req, res) => {
  try {
    const idea = await Idea.findByPk(req.params.ideaId, {
      include: [
        {
          model: GeoLocation,
          as: 'location',
          required: false
        }
      ]
    });

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    // Check permission - only users in the same couple can delete ideas
    if (idea.coupleId !== req.user.coupleId) {
      return res.status(403).json({ message: 'Not authorized to delete this idea' });
    }

    // Delete location if exists
    if (idea.location) {
      await idea.location.destroy();
    }

    // Delete idea
    await idea.destroy();

    res.status(200).json({ message: 'Idea deleted successfully' });
  } catch (error) {
    console.error('Delete idea error:', error);
    res.status(500).json({ message: 'Error deleting idea', error: error.message });
  }
};
