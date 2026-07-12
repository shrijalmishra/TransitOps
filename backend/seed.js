require('dotenv').config();
const { sequelize, User, Role, Vehicle, Driver, Trip } = require('./models');

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced');

    const roles = await Role.bulkCreate([
      { name: 'Admin' },
      { name: 'Fleet Manager' },
      { name: 'Driver' },
      { name: 'Safety Officer' },
      { name: 'Financial Analyst' },
    ], { ignoreDuplicates: true });
    console.log('Roles created');

    const adminRole = await Role.findOne({ where: { name: 'Admin' } });
    const fleetManagerRole = await Role.findOne({ where: { name: 'Fleet Manager' } });
    const driverRole = await Role.findOne({ where: { name: 'Driver' } });

    const adminUser = await User.create({
      email: 'admin@transitops.com',
      password: 'admin123',
      name: 'Admin User',
      roleId: adminRole.id,
    });
    console.log('Admin user created');

    const vehicles = await Vehicle.bulkCreate([
      {
        registrationNumber: 'TN-01-1234',
        name: 'Tata Ace',
        type: 'Light Commercial',
        maxLoadCapacity: 750,
        odometer: 45000,
        acquisitionCost: 350000,
        status: 'Available',
        region: 'Chennai',
      },
      {
        registrationNumber: 'TN-02-5678',
        name: 'Ashok Leyland',
        type: 'Medium Commercial',
        maxLoadCapacity: 3000,
        odometer: 78000,
        acquisitionCost: 850000,
        status: 'Available',
        region: 'Coimbatore',
      },
      {
        registrationNumber: 'TN-03-9012',
        name: 'Eicher Pro',
        type: 'Heavy Commercial',
        maxLoadCapacity: 10000,
        odometer: 120000,
        acquisitionCost: 1500000,
        status: 'Available',
        region: 'Hyderabad',
      },
    ]);
    console.log('Vehicles created');

    const drivers = await Driver.bulkCreate([
      {
        name: 'Ravi Kumar',
        licenseNumber: 'DL-2024-001',
        licenseCategory: 'LMV',
        licenseExpiryDate: '2026-12-31',
        contactNumber: '9876543210',
        safetyScore: 92,
        status: 'Available',
      },
      {
        name: 'Suresh Babu',
        licenseNumber: 'DL-2024-002',
        licenseCategory: 'HMV',
        licenseExpiryDate: '2027-08-15',
        contactNumber: '9876543211',
        safetyScore: 88,
        status: 'Available',
      },
    ]);
    console.log('Drivers created');

    const trips = await Trip.bulkCreate([
      {
        source: 'Chennai',
        destination: 'Bangalore',
        vehicleId: vehicles[0].id,
        driverId: drivers[0].id,
        cargoWeight: 500,
        plannedDistance: 350,
        status: 'Draft',
      },
      {
        source: 'Coimbatore',
        destination: 'Hyderabad',
        vehicleId: vehicles[1].id,
        driverId: drivers[1].id,
        cargoWeight: 2500,
        plannedDistance: 600,
        status: 'Draft',
      },
    ]);
    console.log('Trips created');

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
