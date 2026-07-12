const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Trip = sequelize.define('Trip', {
  source: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  vehicleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'vehicles', key: 'id' },
  },
  driverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'drivers', key: 'id' },
  },
  cargoWeight: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0, isFloat: true },
  },
  plannedDistance: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0 },
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Dispatched', 'Completed', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Draft',
  },
  actualOdometer: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  fuelConsumed: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  revenue: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  tableName: 'trips',
  timestamps: true,
});

module.exports = Trip;
