import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import vehicleRoutes from './routes/vehicles.js';
import bookingRoutes from './routes/bookings.js';
import inquiryRoutes from './routes/inquiries.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import routeRoutes from './routes/routes.js';
import feedbackRoutes from './routes/feedback.js';
import locationRoutes from './routes/locations.js';
import quoteRoutes from './routes/quotes.js';
import { isTrustedOrigin } from './utils/origins.js';
import { sanitizeRequest } from './middleware/sanitize.js';

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
// Single source of truth for the allowlist (also used by requireTrustedOrigin in
// utils/origins.js) — two independently maintained copies had already drifted,
// with this one missing the bare apex domain the other included.
const corsOrigin = (origin, callback) => {
  if (!origin || isTrustedOrigin(origin)) return callback(null, true);
  return callback(Object.assign(new Error('Origin not allowed'), { status: 403 }));
};
app.use(cors({ origin: corsOrigin, credentials: true, optionsSuccessStatus: 204 }));
app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());
app.use(morgan('dev'));
// Defense-in-depth: every route already coerces its own input, but this strips any
// Mongo operator key ($gt, $ne, $where) or dotted path from body/params/query up
// front, so a future route that forgets to coerce a value can't turn into a filter-
// injection bug on its own.
app.use(sanitizeRequest);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'WonderTravel API' }));
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

const clientDist = path.resolve(__dirname, '../../client-v2/dist');
const clientIndex = path.join(clientDist, 'index.html');

if (existsSync(clientIndex)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(clientIndex));
} else {
  app.get('/', (_req, res) => res.json({
    status: 'ok',
    service: 'WonderTravel API',
    health: '/api/health'
  }));
}

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ message: error.code === 'LIMIT_FILE_SIZE' ? 'Image must be smaller than 8 MB' : error.message });
  }
  if (error.status) return res.status(error.status).json({ message: error.message });
  if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid identifier' });
  if (error.code === 11000) return res.status(409).json({ message: 'That value already exists' });
  if (error.name === 'ValidationError') return res.status(400).json({ message: Object.values(error.errors).map(item => item.message).join(', ') });
  if (error.name === 'EmailDeliveryError') return res.status(503).json({ message: error.message });
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

export default app;
