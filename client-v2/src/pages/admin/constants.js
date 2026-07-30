import { BookOpen, CarFront, CircleUserRound, Gauge, MapPinned, MessageSquareText, Star, UsersRound } from 'lucide-react';

/** Sidebar sections. The label doubles as the RTK Query cache key and URL segment (lower-cased). */
export const SECTIONS = [
  ['Overview', Gauge],
  ['Drivers', CircleUserRound],
  ['Vehicles', CarFront],
  ['Bookings', BookOpen],
  ['Inquiries', MessageSquareText],
  ['Feedback', Star],
  ['Routes', MapPinned],
  ['Users', UsersRound]
];

export const VEHICLE_CATEGORIES = ['Hatchback', 'Sedan', 'Premium Sedan', 'SUV', 'MUV / MPV', 'Premium MPV', 'Luxury MPV', 'Tempo Traveller'];

export const VEHICLE_FEATURES = ['Air conditioning', 'Rear AC', 'Music system', 'Extra legroom', 'USB charging', 'Captain seats', 'Luggage carrier', 'GPS tracking', 'First aid kit'];

export const SEAT_OPTIONS = [['5', '5 seater'], ['7', '7 seater']];

export const DRIVER_STATUSES = ['onboarding', 'active', 'inactive', 'suspended'];
export const BOOKING_STATUSES = ['confirmed', 'active', 'completed', 'cancelled'];
export const INQUIRY_STATUSES = ['new', 'contacted', 'closed'];
export const FEEDBACK_STATUSES = ['pending', 'approved', 'rejected'];

export const MAX_VEHICLE_IMAGES = 6;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Turns a form element into a plain payload, coercing the fields the API types. */
export function readForm(form, { numbers = [], booleans = [], multi = [] } = {}) {
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData);
  numbers.forEach(field => { payload[field] = Number(payload[field] || 0); });
  multi.forEach(field => { payload[field] = formData.getAll(field); });
  booleans.forEach(field => { payload[field] = formData.has(field); });
  return payload;
}
