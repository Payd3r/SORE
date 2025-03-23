
const { User, Couple } = require('../models');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create a new couple
exports.createCouple = async (req, res) => {
  try {
    const { name, description, startDate, anniversaryDate } = req.body;

    // Create the couple
    const newCouple = await Couple.create({
      name,
      description,
      startDate: startDate || new Date(),
      anniversaryDate
    });

    // Update the current user with the coupleId
    await User.update(
      { coupleId: newCouple.id },
      { where: { id: req.user.id } }
    );

    // Get the updated user
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(201).json({
      couple: newCouple,
      user: updatedUser
    });
  } catch (error) {
    console.error('Create couple error:', error);
    res.status(500).json({ message: 'Error creating couple', error: error.message });
  }
};

// Get couple by ID
exports.getCouple = async (req, res) => {
  try {
    const couple = await Couple.findByPk(req.params.coupleId, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'avatar', 'bio']
        }
      ]
    });

    if (!couple) {
      return res.status(404).json({ message: 'Couple not found' });
    }

    res.status(200).json(couple);
  } catch (error) {
    console.error('Get couple error:', error);
    res.status(500).json({ message: 'Error fetching couple', error: error.message });
  }
};

// Update couple
exports.updateCouple = async (req, res) => {
  try {
    const { name, description, startDate, anniversaryDate } = req.body;
    const couple = await Couple.findByPk(req.params.coupleId);

    if (!couple) {
      return res.status(404).json({ message: 'Couple not found' });
    }

    // Check if user belongs to this couple
    const user = await User.findByPk(req.user.id);
    if (user.coupleId !== couple.id) {
      return res.status(403).json({ message: 'Not authorized to update this couple' });
    }

    let avatar = couple.avatar;

    // Handle avatar upload if it exists
    if (req.file) {
      const mediaFolder = process.env.MEDIA_PATH || '../media';
      const thumbsFolder = path.join(mediaFolder, 'thumbs');
      
      // Create folders if they don't exist
      if (!fs.existsSync(mediaFolder)) {
        fs.mkdirSync(mediaFolder, { recursive: true });
      }
      if (!fs.existsSync(thumbsFolder)) {
        fs.mkdirSync(thumbsFolder, { recursive: true });
      }

      const filename = `couple_${couple.id}_${Date.now()}${path.extname(req.file.originalname)}`;
      const filepath = path.join(mediaFolder, filename);
      const thumbpath = path.join(thumbsFolder, filename);

      // Write original file
      fs.writeFileSync(filepath, req.file.buffer);

      // Generate thumbnail
      await sharp(req.file.buffer)
        .resize(400, 400, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFile(thumbpath);

      // Delete old avatar file if it exists
      if (couple.avatar) {
        const oldFilePath = path.join(process.cwd(), couple.avatar);
        const oldThumbPath = path.join(process.cwd(), couple.avatar.replace('/media/', '/media/thumbs/'));
        
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
        if (fs.existsSync(oldThumbPath)) {
          fs.unlinkSync(oldThumbPath);
        }
      }

      // Set new avatar path
      avatar = `/media/${filename}`;
    }

    // Update couple
    await couple.update({
      name: name || couple.name,
      description: description !== undefined ? description : couple.description,
      startDate: startDate || couple.startDate,
      anniversaryDate: anniversaryDate !== undefined ? anniversaryDate : couple.anniversaryDate,
      avatar
    });

    // Get updated couple with members
    const updatedCouple = await Couple.findByPk(couple.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'avatar', 'bio']
        }
      ]
    });

    res.status(200).json(updatedCouple);
  } catch (error) {
    console.error('Update couple error:', error);
    res.status(500).json({ message: 'Error updating couple', error: error.message });
  }
};

// Join couple
exports.joinCouple = async (req, res) => {
  try {
    const { coupleId } = req.params;
    
    // Check if couple exists
    const couple = await Couple.findByPk(coupleId);
    if (!couple) {
      return res.status(404).json({ message: 'Couple not found' });
    }

    // Update user's coupleId
    await User.update(
      { coupleId },
      { where: { id: req.user.id } }
    );

    // Get updated user
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    // Get updated couple with members
    const updatedCouple = await Couple.findByPk(coupleId, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'avatar', 'bio']
        }
      ]
    });

    res.status(200).json({
      user: updatedUser,
      couple: updatedCouple
    });
  } catch (error) {
    console.error('Join couple error:', error);
    res.status(500).json({ message: 'Error joining couple', error: error.message });
  }
};

// Leave couple
exports.leaveCouple = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user.coupleId) {
      return res.status(400).json({ message: 'User is not in a couple' });
    }

    // Update user to remove coupleId
    await user.update({ coupleId: null });

    // Get updated user
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Leave couple error:', error);
    res.status(500).json({ message: 'Error leaving couple', error: error.message });
  }
};
