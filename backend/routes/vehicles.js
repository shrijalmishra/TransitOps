const express = require('express');
const { auth, checkRole } = require('../middleware/auth');
const { Vehicle, Trip, Maintenance, FuelLog, Expense } = require('../models');
const { validate } = require('../middleware/validate');
const { vehicleSchemas } = require('../validations');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { type, status, region } = req.query;
    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (region) where.region = region;
    const vehicles = await Vehicle.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', auth, checkRole(['Admin', 'Fleet Manager']), validate(vehicleSchemas.create), async (req, res) => {
  try {
    const { registrationNumber } = req.body;
    const existing = await Vehicle.findOne({ where: { registrationNumber } });
    if (existing) return res.status(400).json({ message: 'Vehicle with this registration number already exists' });
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', auth, checkRole(['Admin', 'Fleet Manager']), validate(vehicleSchemas.update), async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (req.body.registrationNumber && req.body.registrationNumber !== vehicle.registrationNumber) {
      const existing = await Vehicle.findOne({ where: { registrationNumber: req.body.registrationNumber } });
      if (existing) return res.status(400).json({ message: 'Vehicle with this registration number already exists' });
    }
    await vehicle.update(req.body);
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', auth, checkRole(['Admin', 'Fleet Manager']), async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    await vehicle.update({ status: 'Retired' });
    res.json({ message: 'Vehicle retired successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
