
const { User, Memory, Image, Idea, GeoLocation, sequelize } = require('../models');
const { Sequelize } = require('sequelize');

// Get couple stats
exports.getCoupleStats = async (req, res) => {
  try {
    const { coupleId } = req.params;

    // Get total counts
    const totalMemories = await Memory.count({ where: { coupleId } });
    const totalImages = await Image.count({ where: { coupleId } });
    const totalIdeas = await Idea.count({ where: { coupleId } });
    const completedIdeas = await Idea.count({ where: { coupleId, completed: true } });
    const locationsVisited = await GeoLocation.count({
      where: { coupleId },
      distinct: true,
      col: 'name'
    });

    // Get counts by type
    const memoriesByType = await Memory.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { coupleId },
      group: ['type'],
      raw: true
    });

    const imagesByType = await Image.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { coupleId },
      group: ['type'],
      raw: true
    });

    const ideasByType = await Idea.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { coupleId },
      group: ['type'],
      raw: true
    });

    // Get stats by user
    const users = await User.findAll({
      where: { coupleId },
      attributes: ['id', 'name']
    });

    const userStats = [];
    
    for (const user of users) {
      const memoriesCreated = await Memory.count({ where: { coupleId, userId: user.id } });
      const imagesUploaded = await Image.count({ where: { coupleId, userId: user.id } });
      const ideasCreated = await Idea.count({ where: { coupleId, userId: user.id } });
      const ideasCompleted = await Idea.count({ where: { coupleId, completedById: user.id } });
      
      userStats.push({
        userId: user.id,
        name: user.name,
        memoriesCreated,
        imagesUploaded,
        ideasCreated,
        ideasCompleted
      });
    }

    // Format response
    const formatByTypeResult = (results, allTypes) => {
      const formatted = {};
      allTypes.forEach(type => {
        formatted[type] = 0;
      });
      
      results.forEach(result => {
        formatted[result.type] = parseInt(result.count);
      });
      
      return formatted;
    };

    // Format data
    const stats = {
      totalMemories,
      memoriesByType: formatByTypeResult(memoriesByType, ['travel', 'event', 'simple']),
      totalImages,
      imagesByType: formatByTypeResult(imagesByType, ['landscape', 'singlePerson', 'couple']),
      totalIdeas,
      completedIdeas,
      ideasByType: formatByTypeResult(ideasByType, ['travel', 'restaurant', 'general', 'challenge']),
      locationsVisited,
      userStats
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};
