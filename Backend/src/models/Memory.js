
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Memory = sequelize.define('Memory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('travel', 'event', 'simple'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  song: {
    type: DataTypes.STRING,
    allowNull: true
  },
  eventTag: {
    type: DataTypes.ENUM('birthday', 'anniversary', 'gift', 'holiday', 'other'),
    allowNull: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  creatorName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  coupleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Couples',
      key: 'id'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true
});

module.exports = Memory;
