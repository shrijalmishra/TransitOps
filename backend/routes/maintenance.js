const express = require('express');
const { auth, checkRole } = require('../middleware/auth');
const { Maintenance, Vehicle } = require('../models');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const maintenances = await Maintenance.findAll({
      include: [{ model: Vehicle, as: 'vehicle', attributes: ['id', 'registrationNumber', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(maintenances);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', auth, checkRole(['Admin', 'Fleet Manager', 'Safety Officer']), async (req, res) => {
  try {
    const { vehicleId, type, description, cost, startDate, endDate, status } = req.body;
    if (!vehicleId || !type || !cost || !startDate) {
      return res.status(400).json({ message: 'Please provide vehicleId, type, cost, and startDate' });
    }
    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const maintenanceStatus = status || 'Active';
    const maintenance = await Maintenance.create({
      vehicleId,
      type,
      description,
      cost,
      startDate,
      endDate: endDate || null,
      status: maintenanceStatus,
    });

    if (maintenanceStatus === 'Active' && vehicle.status !== 'Retired') {
      await vehicle.update({ status: 'In Shop' });
    }

    res.status(201).json(maintenance);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id/close', auth, checkRole(['Admin', 'Fleet Manager', 'Safety Officer']), async (req, res) => {
  try {
    const maintenance = await Maintenance.findByPk(req.params.id, {
      include: [{ model: Vehicle, as: 'vehicle' }],
    });
    if (!maintenance) return res.status(404).json({ message: 'Maintenance record not found' });
    if (maintenance.status === 'Completed') {
      return res.status(400).json({ message: 'Maintenance already completed' });
    }

    const { endDate } = req.body;
    await maintenance.update({ status: 'Completed', endDate: endDate || new Date().toISOString().split('T')[0] });

    if (maintenance.vehicle && maintenance.vehicle.status !== 'Retired') {
      await maintenance.vehicle.update({ status: 'Available' });
    }

    res.json(maintenance);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
