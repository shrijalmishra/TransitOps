export type UserRole = 'admin' | 'manager' | 'dispatcher' | 'driver'

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
}

export type VehicleType =
  | 'Light Commercial'
  | 'Medium Commercial'
  | 'Heavy Commercial'

export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired'

export interface Vehicle {
  id: number
  registrationNumber: string
  name: string
  type: VehicleType
  maxLoadCapacity: number
  odometer: number
  acquisitionCost: number
  status: VehicleStatus
  createdAt: string
  updatedAt: string
}

export type LicenseCategory = 'LMV' | 'LMV-TR' | 'HMV' | 'HMV-TR' | 'Other'

export type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended'

export interface Driver {
  id: number
  name: string
  licenseNumber: string
  licenseCategory: string
  licenseExpiryDate: string
  contactNumber: string
  safetyScore: number
  status: DriverStatus
  createdAt: string
  updatedAt: string
}

export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled'

export interface Trip {
  id: number
  source: string
  destination: string
  vehicleId: number
  driverId: number
  cargoWeight: number
  plannedDistance: number
  status: TripStatus
  actualOdometer?: number
  fuelConsumed?: number
  revenue?: number
  vehicle?: Vehicle | null
  driver?: Driver | null
  createdAt: string
  updatedAt: string
}

export type MaintenanceStatus = 'Active' | 'Completed'

export interface Maintenance {
  id: number
  vehicleId: number
  type: string
  description?: string
  cost: number
  startDate: string
  endDate?: string
  status: MaintenanceStatus
  vehicle?: Vehicle | null
  createdAt: string
  updatedAt: string
}

export interface FuelLog {
  id: number
  vehicleId: number
  tripId?: number
  liters: number
  costPerLiter: number
  totalCost: number
  date: string
  vehicle?: Vehicle | null
  trip?: Trip | null
  createdAt: string
  updatedAt: string
}

export type ExpenseType = 'Toll' | 'Maintenance' | 'Other'

export interface Expense {
  id: number
  vehicleId: number
  tripId?: number
  type: ExpenseType
  amount: number
  description?: string
  date: string
  vehicle?: Vehicle | null
  trip?: Trip | null
  createdAt: string
  updatedAt: string
}

export interface DashboardKpis {
  activeVehicles: number
  availableVehicles: number
  inMaintenanceVehicles: number
  activeTrips: number
  pendingTrips: number
  driversOnDuty: number
  fleetUtilization: number
}

export interface FuelEfficiency {
  vehicleId: number
  registrationNumber: string
  vehicleName: string
  totalDistance: number
  totalFuel: number
  fuelEfficiency: number
}

export interface OperationalCost {
  vehicleId: number
  registrationNumber: string
  vehicleName: string
  fuelCost: number
  maintenanceCost: number
  totalOperationalCost: number
}

export interface VehicleRoi {
  vehicleId: number
  registrationNumber: string
  vehicleName: string
  acquisitionCost: number
  revenue: number
  maintenanceCost: number
  fuelCost: number
  totalCost: number
  netProfit: number
  roi: number
}

export interface AuthResponse {
  token: string
  user: User
}

export const VEHICLE_STATUSES: VehicleStatus[] = [
  'Available',
  'On Trip',
  'In Shop',
  'Retired',
]

export const VEHICLE_TYPES: VehicleType[] = [
  'Light Commercial',
  'Medium Commercial',
  'Heavy Commercial',
]

export const DRIVER_STATUSES: DriverStatus[] = [
  'Available',
  'On Trip',
  'Off Duty',
  'Suspended',
]

export const LICENSE_CATEGORIES: LicenseCategory[] = [
  'LMV',
  'LMV-TR',
  'HMV',
  'HMV-TR',
  'Other',
]

export const TRIP_STATUSES: TripStatus[] = [
  'Draft',
  'Dispatched',
  'Completed',
  'Cancelled',
]

export const MAINTENANCE_STATUSES: MaintenanceStatus[] = ['Active', 'Completed']

export const MAINTENANCE_TYPES: string[] = [
  'Oil Change',
  'Brake Service',
  'Tire Replacement',
  'Inspection',
  'Repair',
  'Other',
]

export const EXPENSE_TYPES: ExpenseType[] = ['Toll', 'Maintenance', 'Other']
