const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
  registrationNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  maxLoadCapacity: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0 },
  },
  odometer: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  acquisitionCost: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0 },
  },
  status: {
    type: DataTypes.ENUM('Available', 'On Trip', 'In Shop', 'Retired'),
    allowNull: false,
    defaultValue: 'Available',
  },
}, {
  tableName: 'vehicles',
  timestamps: true,
});

module.exports = Vehicle;
