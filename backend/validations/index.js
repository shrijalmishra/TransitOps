const { z } = require('zod');

const authSchemas = {
  register: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(2),
      roleName: z.string().optional(),
    }),
  }),
  login: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }),
  }),
};

const vehicleSchemas = {
  create: z.object({
    body: z.object({
      registrationNumber: z.string().min(1),
      name: z.string().min(1),
      type: z.string().min(1),
      maxLoadCapacity: z.number().positive(),
      odometer: z.number().min(0).optional(),
      acquisitionCost: z.number().min(0),
      status: z.enum(['Available', 'On Trip', 'In Shop', 'Retired']).optional(),
    }),
  }),
  update: z.object({
    body: z.object({
      registrationNumber: z.string().min(1).optional(),
      name: z.string().min(1).optional(),
      type: z.string().min(1).optional(),
      maxLoadCapacity: z.number().positive().optional(),
      odometer: z.number().min(0).optional(),
      acquisitionCost: z.number().min(0).optional(),
      status: z.enum(['Available', 'On Trip', 'In Shop', 'Retired']).optional(),
    }),
  }),
};

const driverSchemas = {
  create: z.object({
    body: z.object({
      name: z.string().min(1),
      licenseNumber: z.string().min(1),
      licenseCategory: z.string().min(1),
      licenseExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
      contactNumber: z.string().min(1),
      safetyScore: z.number().min(0).max(100).optional(),
      status: z.enum(['Available', 'On Trip', 'Off Duty', 'Suspended']).optional(),
    }),
  }),
  update: z.object({
    body: z.object({
      name: z.string().min(1).optional(),
      licenseNumber: z.string().min(1).optional(),
      licenseCategory: z.string().min(1).optional(),
      licenseExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      contactNumber: z.string().min(1).optional(),
      safetyScore: z.number().min(0).max(100).optional(),
      status: z.enum(['Available', 'On Trip', 'Off Duty', 'Suspended']).optional(),
    }),
  }),
};

const tripSchemas = {
  create: z.object({
    body: z.object({
      source: z.string().min(1),
      destination: z.string().min(1),
      vehicleId: z.number().positive(),
      driverId: z.number().positive(),
      cargoWeight: z.number().positive(),
      plannedDistance: z.number().positive(),
    }),
  }),
  complete: z.object({
    body: z.object({
      actualOdometer: z.number().positive().optional(),
      fuelConsumed: z.number().positive().optional(),
      revenue: z.number().min(0).optional(),
    }),
  }),
};

const maintenanceSchemas = {
  create: z.object({
    body: z.object({
      vehicleId: z.number().positive(),
      type: z.string().min(1),
      description: z.string().optional(),
      cost: z.number().min(0),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      status: z.enum(['Active', 'Completed']).optional(),
    }),
  }),
  close: z.object({
    body: z.object({
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    }),
  }),
};

const fuelExpenseSchemas = {
  createFuelLog: z.object({
    body: z.object({
      vehicleId: z.number().positive(),
      tripId: z.number().positive().optional(),
      liters: z.number().positive(),
      costPerLiter: z.number().positive(),
      totalCost: z.number().positive(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    }),
  }),
  createExpense: z.object({
    body: z.object({
      vehicleId: z.number().positive(),
      tripId: z.number().positive().optional(),
      type: z.enum(['Toll', 'Maintenance', 'Other']),
      amount: z.number().positive(),
      description: z.string().optional(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    }),
  }),
};

module.exports = {
  authSchemas,
  vehicleSchemas,
  driverSchemas,
  tripSchemas,
  maintenanceSchemas,
  fuelExpenseSchemas,
};
