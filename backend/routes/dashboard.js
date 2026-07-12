const express = require('express');
const { auth } = require('../middleware/auth');
const { Vehicle, Trip, Driver } = require('../models');

const router = express.Router();

router.get('/kpis', auth, async (req, res) => {
  try {
    const { region } = req.query;
    const vehicleWhere = {};
    if (region) vehicleWhere.region = region;
    const vehicles = await Vehicle.findAll({ where: vehicleWhere });
    const trips = await Trip.findAll();
    const drivers = await Driver.findAll();

    const activeVehicles = vehicles.filter(v => v.status !== 'Retired').length;
    const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
    const inMaintenanceVehicles = vehicles.filter(v => v.status === 'In Shop').length;
    const activeTrips = trips.filter(t => t.status === 'Dispatched').length;
    const pendingTrips = trips.filter(t => t.status === 'Draft' || t.status === 'Dispatched').length;
    const driversOnDuty = drivers.filter(d => d.status === 'Available' || d.status === 'On Trip').length;
    const fleetUtilization = activeVehicles > 0 ? ((activeTrips / activeVehicles) * 100).toFixed(2) : 0;

    res.json({
      activeVehicles,
      availableVehicles,
      inMaintenanceVehicles,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilization: parseFloat(fleetUtilization),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
