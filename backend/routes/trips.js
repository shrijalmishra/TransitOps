const express = require('express');
const { auth, checkRole } = require('../middleware/auth');
const { Vehicle, Driver, Trip, Maintenance } = require('../models');
const { validate } = require('../middleware/validate');
const { tripSchemas } = require('../validations');

const router = express.Router();

router.get('/', auth, checkRole(['Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst', 'Driver']), async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;
    const trips = await Trip.findAll({
      where,
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'registrationNumber', 'name'] },
        { model: Driver, as: 'driver', attributes: ['id', 'name', 'licenseNumber'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', auth, checkRole(['Admin', 'Fleet Manager']), validate(tripSchemas.create), async (req, res) => {
  try {
    const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance } = req.body;
    const vehicle = await Vehicle.findByPk(vehicleId);
    const driver = await Driver.findByPk(driverId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    if (vehicle.status === 'Retired' || vehicle.status === 'In Shop') {
      return res.status(400).json({ message: 'Vehicle is not available for trips' });
    }
    if (driver.status === 'Suspended') {
      return res.status(400).json({ message: 'Driver is suspended' });
    }
    const today = new Date().toISOString().split('T')[0];
    if (driver.licenseExpiryDate < today) {
      return res.status(400).json({ message: 'Driver license has expired' });
    }
    if (driver.status === 'On Trip') {
      return res.status(400).json({ message: 'Driver is already on a trip' });
    }
    if (vehicle.status === 'On Trip') {
      return res.status(400).json({ message: 'Vehicle is already on a trip' });
    }
    if (cargoWeight > vehicle.maxLoadCapacity) {
      return res.status(400).json({ message: `Cargo weight exceeds vehicle max load capacity of ${vehicle.maxLoadCapacity}` });
    }

    const trip = await Trip.create({
      source,
      destination,
      vehicleId,
      driverId,
      cargoWeight,
      plannedDistance,
      status: 'Draft',
    });
    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id/dispatch', auth, checkRole(['Admin', 'Fleet Manager']), async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Driver, as: 'driver' },
      ],
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft trips can be dispatched' });
    }

    const vehicle = await Vehicle.findByPk(trip.vehicleId);
    const driver = await Driver.findByPk(trip.driverId);

    if (vehicle.status === 'Retired' || vehicle.status === 'In Shop') {
      return res.status(400).json({ message: 'Vehicle is not available for trips' });
    }
    if (driver.status === 'Suspended') {
      return res.status(400).json({ message: 'Driver is suspended' });
    }
    const today = new Date().toISOString().split('T')[0];
    if (driver.licenseExpiryDate < today) {
      return res.status(400).json({ message: 'Driver license has expired' });
    }
    if (driver.status === 'On Trip') {
      return res.status(400).json({ message: 'Driver is already on a trip' });
    }
    if (vehicle.status === 'On Trip') {
      return res.status(400).json({ message: 'Vehicle is already on a trip' });
    }
    if (trip.cargoWeight > vehicle.maxLoadCapacity) {
      return res.status(400).json({ message: `Cargo weight exceeds vehicle max load capacity of ${vehicle.maxLoadCapacity}` });
    }

    await trip.update({ status: 'Dispatched' });
    await vehicle.update({ status: 'On Trip' });
    await driver.update({ status: 'On Trip' });

    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id/complete', auth, checkRole(['Admin', 'Fleet Manager']), validate(tripSchemas.complete), async (req, res) => {
  try {
    const { actualOdometer, fuelConsumed, revenue } = req.body;
    const trip = await Trip.findByPk(req.params.id, {
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Driver, as: 'driver' },
      ],
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.status !== 'Dispatched') {
      return res.status(400).json({ message: 'Only dispatched trips can be completed' });
    }

    await trip.update({
      status: 'Completed',
      actualOdometer: actualOdometer || trip.actualOdometer,
      fuelConsumed: fuelConsumed !== undefined ? fuelConsumed : trip.fuelConsumed,
      revenue: revenue !== undefined ? revenue : trip.revenue,
    });

    const vehicle = await Vehicle.findByPk(trip.vehicleId);
    const driver = await Driver.findByPk(trip.driverId);
    if (vehicle) {
      const newStatus = vehicle.status === 'Retired' ? 'Retired' : 'Available';
      await vehicle.update({ status: newStatus });
    }
    if (driver) {
      await driver.update({ status: 'Available' });
    }

    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id/cancel', auth, checkRole(['Admin', 'Fleet Manager']), async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Driver, as: 'driver' },
      ],
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.status !== 'Draft' && trip.status !== 'Dispatched') {
      return res.status(400).json({ message: 'Only draft or dispatched trips can be cancelled' });
    }

    await trip.update({ status: 'Cancelled' });

    const vehicle = await Vehicle.findByPk(trip.vehicleId);
    const driver = await Driver.findByPk(trip.driverId);
    if (vehicle) {
      const newStatus = vehicle.status === 'Retired' ? 'Retired' : 'Available';
      await vehicle.update({ status: newStatus });
    }
    if (driver) {
      await driver.update({ status: 'Available' });
    }

    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
