
const { User, Couple } = require('../models');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Get user by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check permission - only the user themselves can update their profile
    if (user.id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    const { name, bio } = req.body;
    let avatar = user.avatar;

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

      const filename = `user_${user.id}_${Date.now()}${path.extname(req.file.originalname)}`;
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
      if (user.avatar) {
        const oldFilePath = path.join(process.cwd(), user.avatar);
        const oldThumbPath = path.join(process.cwd(), user.avatar.replace('/media/', '/media/thumbs/'));
        
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

    // Update user
    await user.update({
      name: name || user.name,
      bio: bio !== undefined ? bio : user.bio,
      avatar
    });

    // Fetch updated user
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};
