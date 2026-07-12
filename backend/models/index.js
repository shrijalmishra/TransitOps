const sequelize = require('./database');
const User = require('./User');
const Role = require('./Role');
const Vehicle = require('./Vehicle');
const Driver = require('./Driver');
const Trip = require('./Trip');
const Maintenance = require('./Maintenance');
const FuelLog = require('./FuelLog');
const Expense = require('./Expense');

Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

Vehicle.hasMany(Trip, { foreignKey: 'vehicleId', as: 'trips' });
Trip.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

Driver.hasMany(Trip, { foreignKey: 'driverId', as: 'trips' });
Trip.belongsTo(Driver, { foreignKey: 'driverId', as: 'driver' });

Vehicle.hasMany(Maintenance, { foreignKey: 'vehicleId', as: 'maintenances' });
Maintenance.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

Vehicle.hasMany(FuelLog, { foreignKey: 'vehicleId', as: 'fuelLogs' });
FuelLog.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

Trip.hasMany(FuelLog, { foreignKey: 'tripId', as: 'fuelLogs' });
FuelLog.belongsTo(Trip, { foreignKey: 'tripId', as: 'trip' });

Vehicle.hasMany(Expense, { foreignKey: 'vehicleId', as: 'expenses' });
Expense.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

Trip.hasMany(Expense, { foreignKey: 'tripId', as: 'expenses' });
Expense.belongsTo(Trip, { foreignKey: 'tripId', as: 'trip' });

module.exports = {
  sequelize,
  User,
  Role,
  Vehicle,
  Driver,
  Trip,
  Maintenance,
  FuelLog,
  Expense,
};
