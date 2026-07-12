const express = require('express');
const { auth, checkRole } = require('../middleware/auth');
const { FuelLog, Expense, Vehicle, Trip } = require('../models');
const { validate } = require('../middleware/validate');
const { fuelExpenseSchemas } = require('../validations');

const router = express.Router();

router.get('/fuel-logs', auth, checkRole(['Admin', 'Fleet Manager', 'Financial Analyst']), async (req, res) => {
  try {
    const { vehicleId, tripId } = req.query;
    const where = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (tripId) where.tripId = tripId;
    const logs = await FuelLog.findAll({
      where,
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'registrationNumber', 'name'] },
        { model: Trip, as: 'trip', attributes: ['id', 'source', 'destination'] },
      ],
      order: [['date', 'DESC']],
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/fuel-logs', auth, checkRole(['Admin', 'Fleet Manager', 'Financial Analyst']), validate(fuelExpenseSchemas.createFuelLog), async (req, res) => {
  try {
    const { vehicleId, tripId, liters, costPerLiter, totalCost, date } = req.body;
    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (tripId) {
      const trip = await Trip.findByPk(tripId);
      if (!trip) return res.status(404).json({ message: 'Trip not found' });
    }
    const log = await FuelLog.create({
      vehicleId,
      tripId: tripId || null,
      liters,
      costPerLiter,
      totalCost,
      date: date || new Date().toISOString().split('T')[0],
    });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/expenses', auth, checkRole(['Admin', 'Fleet Manager', 'Financial Analyst']), async (req, res) => {
  try {
    const { vehicleId, tripId, type } = req.query;
    const where = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (tripId) where.tripId = tripId;
    if (type) where.type = type;
    const expenses = await Expense.findAll({
      where,
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'registrationNumber', 'name'] },
        { model: Trip, as: 'trip', attributes: ['id', 'source', 'destination'] },
      ],
      order: [['date', 'DESC']],
    });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/expenses', auth, checkRole(['Admin', 'Fleet Manager', 'Financial Analyst']), validate(fuelExpenseSchemas.createExpense), async (req, res) => {
  try {
    const { vehicleId, tripId, type, amount, description, date } = req.body;
    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (tripId) {
      const trip = await Trip.findByPk(tripId);
      if (!trip) return res.status(404).json({ message: 'Trip not found' });
    }
    const expense = await Expense.create({
      vehicleId,
      tripId: tripId || null,
      type,
      amount,
      description: description || '',
      date: date || new Date().toISOString().split('T')[0],
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
