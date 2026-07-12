const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Maintenance = sequelize.define('Maintenance', {
  vehicleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'vehicles', key: 'id' },
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cost: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0 },
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Completed'),
    allowNull: false,
    defaultValue: 'Active',
  },
}, {
  tableName: 'maintenances',
  timestamps: true,
});

module.exports = Maintenance;
