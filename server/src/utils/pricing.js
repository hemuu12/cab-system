import mongoose from 'mongoose';
import PricingClass from '../models/PricingClass.js';
import Vehicle from '../models/Vehicle.js';
import { fleet } from '../data/fleet.js';
import { PRICING_CLASSES } from '../data/pricingClasses.js';
import { calculateFare } from './fare.js';

const seatingClass = vehicle => (vehicle.pricingClass || (Number(vehicle.seats) > 5 ? '7-seater' : '5-seater'));

/** Rate cards keyed by class, from the database when it is available and from seed data otherwise. */
export async function loadPricingClasses() {
  if (mongoose.connection.readyState === 1) {
    const classes = await PricingClass.find({ active: true }).lean();
    if (classes.length) return new Map(classes.map(item => [item.key, item]));
  }
  return new Map(PRICING_CLASSES.map(item => [item.key, item]));
}

export async function loadActiveVehicles() {
  if (mongoose.connection.readyState === 1) {
    return Vehicle.find({ active: true, pricingConfigured: { $ne: false } })
      .sort({ featured: -1, createdAt: 1, name: 1 })
      .lean();
  }
  return fleet;
}

export async function loadVehicleById(id) {
  if (mongoose.connection.readyState === 1) {
    return Vehicle.findOne({ _id: id, active: true, pricingConfigured: { $ne: false } }).lean();
  }
  return fleet.find(vehicle => String(vehicle._id) === String(id)) || null;
}

/** Prices a trip for one vehicle. Throws if the vehicle's class has no rate card. */
export function quoteVehicle(trip, vehicle, classes) {
  return calculateFare(trip, vehicle, classes.get(seatingClass(vehicle)));
}

/** Prices a trip across the whole fleet, cheapest first. Vehicles without a rate card are skipped. */
export function quoteFleet(trip, vehicles, classes) {
  return vehicles
    .map(vehicle => {
      const rateCard = classes.get(seatingClass(vehicle));
      if (!rateCard) return null;
      return {
        vehicle: {
          _id: vehicle._id,
          name: vehicle.name,
          category: vehicle.category,
          seats: vehicle.seats,
          luggage: vehicle.luggage,
          pricingClass: seatingClass(vehicle),
          image: vehicle.images?.[0]?.url || null
        },
        fare: calculateFare(trip, vehicle, rateCard)
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.fare.total - b.fare.total);
}
