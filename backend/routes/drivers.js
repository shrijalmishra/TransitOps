const express = require('express');
const { auth, checkRole } = require('../middleware/auth');
const { Driver, Trip } = require('../models');
const { validate } = require('../middleware/validate');
const { driverSchemas } = require('../validations');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;
    const drivers = await Driver.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', auth, checkRole(['Admin', 'Fleet Manager']), validate(driverSchemas.create), async (req, res) => {
  try {
    const { licenseNumber } = req.body;
    const existing = await Driver.findOne({ where: { licenseNumber } });
    if (existing) return res.status(400).json({ message: 'Driver with this license number already exists' });
    const driver = await Driver.create(req.body);
    res.status(201).json(driver);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', auth, checkRole(['Admin', 'Fleet Manager']), validate(driverSchemas.update), async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    if (req.body.licenseNumber && req.body.licenseNumber !== driver.licenseNumber) {
      const existing = await Driver.findOne({ where: { licenseNumber: req.body.licenseNumber } });
      if (existing) return res.status(400).json({ message: 'Driver with this license number already exists' });
    }
    await driver.update(req.body);
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', auth, checkRole(['Admin', 'Fleet Manager']), async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    await driver.update({ status: 'Suspended' });
    res.json({ message: 'Driver suspended successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
