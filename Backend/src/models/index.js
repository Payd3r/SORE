
const sequelize = require('../config/database');
const User = require('./User');
const Couple = require('./Couple');
const Memory = require('./Memory');
const Image = require('./Image');
const GeoLocation = require('./GeoLocation');
const Idea = require('./Idea');

// Define relationships
User.belongsTo(Couple, { foreignKey: 'coupleId' });
Couple.hasMany(User, { foreignKey: 'coupleId' });

Memory.belongsTo(User, { foreignKey: 'userId' });
Memory.belongsTo(Couple, { foreignKey: 'coupleId' });
User.hasMany(Memory, { foreignKey: 'userId' });
Couple.hasMany(Memory, { foreignKey: 'coupleId' });

Image.belongsTo(User, { foreignKey: 'userId' });
Image.belongsTo(Couple, { foreignKey: 'coupleId' });
Image.belongsTo(Memory, { foreignKey: 'memoryId' });
User.hasMany(Image, { foreignKey: 'userId' });
Couple.hasMany(Image, { foreignKey: 'coupleId' });
Memory.hasMany(Image, { foreignKey: 'memoryId' });

GeoLocation.belongsTo(Memory, { foreignKey: 'memoryId' });
GeoLocation.belongsTo(Image, { foreignKey: 'imageId' });
GeoLocation.belongsTo(Idea, { foreignKey: 'ideaId' });
GeoLocation.belongsTo(Couple, { foreignKey: 'coupleId' });
Memory.hasOne(GeoLocation, { foreignKey: 'memoryId' });
Image.hasOne(GeoLocation, { foreignKey: 'imageId' });
Idea.hasOne(GeoLocation, { foreignKey: 'ideaId' });
Couple.hasMany(GeoLocation, { foreignKey: 'coupleId' });

Idea.belongsTo(User, { foreignKey: 'userId' });
Idea.belongsTo(Couple, { foreignKey: 'coupleId' });
User.hasMany(Idea, { foreignKey: 'userId' });
Couple.hasMany(Idea, { foreignKey: 'coupleId' });

// Initialize all models
const models = {
  User,
  Couple,
  Memory,
  Image,
  GeoLocation,
  Idea,
  sequelize
};

module.exports = models;
