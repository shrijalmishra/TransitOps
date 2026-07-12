const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('Expense', {
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
  type: {
    type: DataTypes.ENUM('Toll', 'Maintenance', 'Other'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0 },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'expenses',
  timestamps: true,
});

module.exports = Expense;
