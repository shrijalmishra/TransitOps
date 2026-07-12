const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FuelLog = sequelize.define('FuelLog', {
  vehicleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'vehicles', key: 'id' },
  },
  tripId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'trips', key: 'id' },
  },
  liters: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0 },
  },
  costPerLiter: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0 },
  },
  totalCost: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0 },
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'fuel_logs',
  timestamps: true,
});

module.exports = FuelLog;
