
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GeoLocation = sequelize.define('GeoLocation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  memoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Memories',
      key: 'id'
    }
  },
  imageId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Images',
      key: 'id'
    }
  },
  ideaId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Ideas',
      key: 'id'
    }
  },
  coupleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Couples',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = GeoLocation;
