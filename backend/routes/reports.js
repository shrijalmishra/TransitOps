const express = require('express');
const { auth } = require('../middleware/auth');
const { Vehicle, Trip, FuelLog, Maintenance, Expense } = require('../models');

const router = express.Router();

router.get('/fuel-efficiency', auth, async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({ attributes: ['id', 'registrationNumber', 'name'] });
    const trips = await Trip.findAll({
      where: { status: 'Completed' },
      attributes: ['id', 'vehicleId', 'plannedDistance', 'fuelConsumed'],
    });
    const efficiency = vehicles.map(v => {
      const vehicleTrips = trips.filter(t => t.vehicleId === v.id);
      const totalDistance = vehicleTrips.reduce((sum, t) => sum + (t.plannedDistance || 0), 0);
      const totalFuel = vehicleTrips.reduce((sum, t) => sum + (t.fuelConsumed || 0), 0);
      return {
        vehicleId: v.id,
        registrationNumber: v.registrationNumber,
        vehicleName: v.name,
        totalDistance,
        totalFuel,
        fuelEfficiency: totalFuel > 0 ? parseFloat((totalDistance / totalFuel).toFixed(2)) : 0,
      };
    });
    res.json(efficiency);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/operational-cost', auth, async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({ attributes: ['id', 'registrationNumber', 'name'] });
    const fuelLogs = await FuelLog.findAll({ attributes: ['vehicleId', 'totalCost'] });
    const expenses = await Expense.findAll({ attributes: ['vehicleId', 'amount'] });
    const cost = vehicles.map(v => {
      const fuelCost = fuelLogs
        .filter(f => f.vehicleId === v.id)
        .reduce((sum, f) => sum + (f.totalCost || 0), 0);
      const maintenanceCost = expenses
        .filter(e => e.vehicleId === v.id)
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      return {
        vehicleId: v.id,
        registrationNumber: v.registrationNumber,
        vehicleName: v.name,
        fuelCost,
        maintenanceCost,
        totalOperationalCost: fuelCost + maintenanceCost,
      };
    });
    res.json(cost);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/vehicle-roi', auth, async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({ attributes: ['id', 'registrationNumber', 'name', 'acquisitionCost'] });
    const trips = await Trip.findAll({
      where: { status: 'Completed' },
      attributes: ['vehicleId', 'revenue'],
    });
    const expenses = await Expense.findAll({ attributes: ['vehicleId', 'amount'] });
    const fuelLogs = await FuelLog.findAll({ attributes: ['vehicleId', 'totalCost'] });
    const roi = vehicles.map(v => {
      const revenue = trips
        .filter(t => t.vehicleId === v.id)
        .reduce((sum, t) => sum + (t.revenue || 0), 0);
      const maintenanceCost = expenses
        .filter(e => e.vehicleId === v.id)
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      const fuelCost = fuelLogs
        .filter(f => f.vehicleId === v.id)
        .reduce((sum, f) => sum + (f.totalCost || 0), 0);
      const totalCost = maintenanceCost + fuelCost;
      const netProfit = revenue - totalCost;
      const roiValue = v.acquisitionCost > 0 ? ((revenue - totalCost) / v.acquisitionCost) * 100 : 0;
      return {
        vehicleId: v.id,
        registrationNumber: v.registrationNumber,
        vehicleName: v.name,
        acquisitionCost: v.acquisitionCost,
        revenue,
        maintenanceCost,
        fuelCost,
        totalCost,
        netProfit,
        roi: parseFloat(roiValue.toFixed(2)),
      };
    });
    res.json(roi);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/export-csv', auth, async (req, res) => {
  try {
    const trips = await Trip.findAll({
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['registrationNumber', 'name'] },
        { model: Driver, as: 'driver', attributes: ['name', 'licenseNumber'] },
      ],
    });
    let csv = 'ID,Source,Destination,Vehicle Registration,Vehicle Name,Driver Name,Driver License,Cargo Weight,Planned Distance,Status,Actual Odometer,Fuel Consumed,Revenue,Created At\n';
    trips.forEach(t => {
      csv += `${t.id},"${t.source}","${t.destination}","${t.vehicle?.registrationNumber || ''}","${t.vehicle?.name || ''}","${t.driver?.name || ''}","${t.driver?.licenseNumber || ''}",${t.cargoWeight},${t.plannedDistance},${t.status},${t.actualOdometer || ''},${t.fuelConsumed || ''},${t.revenue || ''},"${t.createdAt}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=trips.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
