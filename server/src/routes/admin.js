import { Router } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import Booking from '../models/Booking.js';
import Inquiry from '../models/Inquiry.js';
import Route from '../models/Route.js';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Feedback from '../models/Feedback.js';
import {
  ADMIN_PERMISSIONS,
  ADMIN_MANAGEABLE_SECTIONS,
  adminSectionsFor,
  authenticate,
  requireAdminPermission,
  requireAdminSection,
  requireRole
} from '../middleware/auth.js';
import { deleteImage, isCloudinaryConfigured, uploadImage } from '../utils/cloudinary.js';

const router = Router();
const VEHICLE_CATEGORIES = ['Hatchback', 'Sedan', 'Premium Sedan', 'SUV', 'MUV / MPV', 'Premium MPV', 'Luxury MPV', 'Tempo Traveller'];
const VEHICLE_FEATURES = ['Air conditioning', 'Rear AC', 'Music system', 'Extra legroom', 'USB charging', 'Captain seats', 'Luggage carrier', 'GPS tracking', 'First aid kit'];
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => file.mimetype.startsWith('image/')
    ? callback(null, true)
    : callback(Object.assign(new Error('Select a valid image file'), { status: 400 }))
});
router.use(
  authenticate,
  requireRole('admin')
);

router.use((req, res, next) => {
  const section = req.path.split('/').filter(Boolean)[0];
  return section ? requireAdminSection(section)(req, res, next) : next();
});

const permissionByMethod = {
  GET: ADMIN_PERMISSIONS.READ,
  POST: ADMIN_PERMISSIONS.CREATE,
  PATCH: ADMIN_PERMISSIONS.UPDATE,
  DELETE: ADMIN_PERMISSIONS.DELETE
};
router.use((req, res, next) => {
  const permission = permissionByMethod[req.method];
  return permission ? requireAdminPermission(permission)(req, res, next) : next();
});

const requireManageAdmins = requireAdminPermission(ADMIN_PERMISSIONS.MANAGE_ADMINS);

router.get('/dashboard', async (req, res, next) => {
  try {
    const sections = new Set(adminSectionsFor(req.user));
    const queries = {};
    if (sections.has('drivers')) {
      queries.drivers = Driver.countDocuments();
      queries.activeDrivers = Driver.countDocuments({ status: 'active' });
    }
    if (sections.has('vehicles')) queries.activeVehicles = Vehicle.countDocuments({ active: true });
    if (sections.has('bookings')) {
      queries.bookings = Booking.countDocuments();
      queries.activeBookings = Booking.countDocuments({ status: { $in: ['confirmed', 'active'] } });
      queries.revenue = Booking.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$fare.total' } } }
      ]).then(result => result[0]?.total || 0);
    }
    if (sections.has('inquiries')) queries.newInquiries = Inquiry.countDocuments({ status: 'new' });
    if (sections.has('feedback')) queries.pendingFeedback = Feedback.countDocuments({ status: 'pending' });
    if (sections.has('routes')) queries.activeRoutes = Route.countDocuments({ active: true });
    if (sections.has('users')) queries.users = User.countDocuments({ active: true });

    const dashboard = Object.fromEntries(await Promise.all(
      Object.entries(queries).map(async ([key, query]) => [key, await query])
    ));
    res.json(dashboard);
  } catch (error) { next(error); }
});

router.get('/bookings', async (_req, res, next) => {
  try { res.json(await Booking.find().populate('vehicle').sort({ createdAt: -1 }).limit(200).lean()); }
  catch (error) { next(error); }
});
router.patch('/bookings/:id', async (req, res, next) => {
  try {
    if (!['confirmed', 'active', 'completed', 'cancelled'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid booking status' });
    const item = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }).populate('vehicle');
    if (!item) return res.status(404).json({ message: 'Booking not found' });
    res.json(item);
  } catch (error) { next(error); }
});

router.get('/inquiries', async (_req, res, next) => {
  try { res.json(await Inquiry.find().sort({ createdAt: -1 }).limit(200).lean()); }
  catch (error) { next(error); }
});
router.patch('/inquiries/:id', async (req, res, next) => {
  try {
    if (!['new', 'contacted', 'closed'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid inquiry status' });
    const item = await Inquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Inquiry not found' });
    res.json(item);
  } catch (error) { next(error); }
});

router.get('/feedback', async (_req, res, next) => {
  try { res.json(await Feedback.find().sort({ createdAt: -1 }).limit(300).lean()); }
  catch (error) { next(error); }
});
router.patch('/feedback/:id', async (req, res, next) => {
  try {
    const existing = await Feedback.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Feedback not found' });
    const update = {};
    if (req.body.status !== undefined) {
      if (!['pending', 'approved', 'rejected'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid feedback status' });
      update.status = req.body.status;
      update.moderatedBy = req.user._id;
      update.moderatedAt = new Date();
      update.approvedAt = req.body.status === 'approved' ? new Date() : null;
      if (req.body.status !== 'approved') update.featured = false;
      if (req.body.status === 'rejected' && existing.photo?.publicId) {
        if (req.user.adminRole !== 'super_admin') {
          return res.status(403).json({ message: 'Only the super administrator can reject feedback that removes a guest photo' });
        }
        if (!isCloudinaryConfigured()) return res.status(503).json({ message: 'Cloudinary must be configured before rejecting feedback with a photo.' });
        await deleteImage(existing.photo.publicId);
        update.photo = null;
      }
    }
    if (typeof req.body.featured === 'boolean') {
      if (req.body.featured && existing.status !== 'approved') return res.status(400).json({ message: 'Approve feedback before featuring it' });
      update.featured = req.body.featured;
    }
    const item = await Feedback.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Feedback not found' });
    res.json(item);
  } catch (error) { next(error); }
});

router.get('/vehicles', async (_req, res, next) => {
  try { res.json(await Vehicle.find().sort({ createdAt: -1 }).lean()); }
  catch (error) { next(error); }
});
router.post('/vehicles', async (req, res, next) => {
  try {
    const seats = Number(req.body.seats);
    if (![5, 7].includes(seats)) return res.status(400).json({ message: 'Choose either a 5-seater or 7-seater vehicle' });
    if (!VEHICLE_CATEGORIES.includes(req.body.category)) return res.status(400).json({ message: 'Choose a valid vehicle category' });
    const features = Array.isArray(req.body.features)
      ? req.body.features.filter(feature => VEHICLE_FEATURES.includes(feature))
      : [];
    const payload = {
      name: String(req.body.name || '').trim(),
      category: req.body.category,
      description: String(req.body.description || '').trim(),
      seats,
      luggage: seats === 7 ? 4 : 2,
      baseFare: 0,
      driverAllowance: 0,
      toll: 0,
      pricingConfigured: false,
      features,
      featured: Boolean(req.body.featured),
      active: req.body.active !== false
    };
    res.status(201).json(await Vehicle.create(payload));
  }
  catch (error) { next(error); }
});
router.patch('/vehicles/:id', async (req, res, next) => {
  try {
    const allowed = ['name', 'category', 'description', 'seats', 'features', 'featured', 'active'];
    const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    if (update.category !== undefined && !VEHICLE_CATEGORIES.includes(update.category)) {
      return res.status(400).json({ message: 'Choose a valid vehicle category' });
    }
    if (update.seats !== undefined) {
      update.seats = Number(update.seats);
      if (![5, 7].includes(update.seats)) return res.status(400).json({ message: 'Choose either a 5-seater or 7-seater vehicle' });
      update.luggage = update.seats === 7 ? 4 : 2;
    }
    if (update.features !== undefined) {
      update.features = Array.isArray(update.features) ? update.features.filter(feature => VEHICLE_FEATURES.includes(feature)) : [];
    }
    const item = await Vehicle.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(item);
  } catch (error) { next(error); }
});
router.post('/vehicles/:id/images', imageUpload.single('image'), async (req, res, next) => {
  try {
    if (!isCloudinaryConfigured()) return res.status(503).json({ message: 'Cloudinary is not configured. Add the Cloudinary credentials to server/.env.' });
    if (!req.file) return res.status(400).json({ message: 'Select an image to upload' });
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (vehicle.images.length >= 6) return res.status(400).json({ message: 'A vehicle can have up to 6 images' });
    const result = await uploadImage(req.file.buffer, {
      folder: `wondertravel/vehicles/${vehicle._id}`,
      transformation: [{ width: 1600, height: 1000, crop: 'limit', quality: 'auto', fetch_format: 'auto' }]
    });
    vehicle.images.push({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      alt: `${vehicle.name} vehicle`
    });
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) { next(error); }
});
router.delete('/vehicles/:vehicleId/images/:imageId', async (req, res, next) => {
  try {
    if (!isCloudinaryConfigured()) return res.status(503).json({ message: 'Cloudinary is not configured. Add the Cloudinary credentials to server/.env.' });
    const vehicle = await Vehicle.findById(req.params.vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    const image = vehicle.images.id(req.params.imageId);
    if (!image) return res.status(404).json({ message: 'Vehicle image not found' });
    await deleteImage(image.publicId);
    image.deleteOne();
    await vehicle.save();
    res.json(vehicle);
  } catch (error) { next(error); }
});
router.delete('/vehicles/:id', async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    const bookingCount = await Booking.countDocuments({ vehicle: vehicle._id });
    if (bookingCount) {
      return res.status(409).json({ message: 'This vehicle has booking history. Set it unavailable instead of deleting it.' });
    }
    if (vehicle.images.length) {
      if (!isCloudinaryConfigured()) return res.status(503).json({ message: 'Cloudinary must be configured before deleting this vehicle and its images.' });
      await Promise.all(vehicle.images.map(image => deleteImage(image.publicId)));
    }
    await vehicle.deleteOne();
    res.status(204).end();
  } catch (error) { next(error); }
});

router.get('/drivers', async (_req, res, next) => {
  try { res.json(await Driver.find().sort({ createdAt: -1 }).lean()); }
  catch (error) { next(error); }
});
router.post('/drivers', async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'email', 'city', 'licenseNumber', 'experienceYears', 'status', 'verified', 'notes'];
    const payload = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    res.status(201).json(await Driver.create(payload));
  } catch (error) { next(error); }
});
router.patch('/drivers/:id', async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'email', 'city', 'licenseNumber', 'experienceYears', 'status', 'verified', 'notes'];
    const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    const item = await Driver.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Driver not found' });
    res.json(item);
  } catch (error) { next(error); }
});

router.get('/routes', async (_req, res, next) => {
  try { res.json(await Route.find().sort({ region: 1, sortOrder: 1, destination: 1 }).lean()); }
  catch (error) { next(error); }
});
router.post('/routes', async (req, res, next) => {
  try { res.status(201).json(await Route.create(req.body)); }
  catch (error) { next(error); }
});
router.patch('/routes/:id', async (req, res, next) => {
  try {
    const allowed = ['destination', 'region', 'distanceKm', 'popular', 'active', 'sortOrder'];
    const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    const item = await Route.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Route not found' });
    res.json(item);
  } catch (error) { next(error); }
});
router.delete('/routes/:id', async (req, res, next) => {
  try {
    const item = await Route.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Route not found' });
    res.status(204).end();
  } catch (error) { next(error); }
});

router.get('/users', requireManageAdmins, async (_req, res, next) => {
  try { res.json(await User.find().select('-passwordHash').sort({ adminRole: -1, createdAt: -1 }).lean()); }
  catch (error) { next(error); }
});
router.post('/users', requireManageAdmins, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Enter an admin name and valid email address' });
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ message: 'Use at least 8 characters with both a letter and a number' });
    }
    if (await User.exists({ email })) return res.status(409).json({ message: 'An account already exists for this email' });
    const item = await User.create({
      name,
      email,
      phone: String(req.body.phone || '').trim(),
      passwordHash: await bcrypt.hash(password, 12),
      emailVerified: true,
      accountStatus: 'active',
      createdFrom: 'admin',
      role: 'admin',
      adminRole: 'admin',
      adminSections: ADMIN_MANAGEABLE_SECTIONS,
      active: true
    });
    res.status(201).json(await User.findById(item._id).select('-passwordHash').lean());
  } catch (error) { next(error); }
});
router.patch('/users/:id', requireManageAdmins, async (req, res, next) => {
  try {
    const existing = await User.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'User not found' });
    const update = {};
    if (typeof req.body.active === 'boolean') {
      if (existing.adminRole === 'super_admin' && !req.body.active) {
        return res.status(400).json({ message: 'The super administrator account cannot be deactivated' });
      }
      update.active = req.body.active;
    }
    if (req.body.adminSections !== undefined) {
      if (existing.role !== 'admin' || existing.adminRole === 'super_admin') {
        return res.status(400).json({ message: 'Section access can only be changed for normal administrators' });
      }
      if (!Array.isArray(req.body.adminSections)) {
        return res.status(400).json({ message: 'Administrator section access must be a list' });
      }
      update.adminSections = [...new Set(
        req.body.adminSections.filter(section => ADMIN_MANAGEABLE_SECTIONS.includes(section))
      )];
    }
    if (req.body.password !== undefined) {
      const password = String(req.body.password);
      if (existing.role !== 'admin') return res.status(400).json({ message: 'Passwords can only be issued for administrator accounts here' });
      if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        return res.status(400).json({ message: 'Use at least 8 characters with both a letter and a number' });
      }
      update.passwordHash = await bcrypt.hash(password, 12);
    }
    const item = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).select('-passwordHash');
    res.json(item);
  } catch (error) { next(error); }
});

export default router;
