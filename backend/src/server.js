require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const sanitize = require('mongo-sanitize');
const { clerkMiddleware } = require('@clerk/express');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const brandRoutes = require('./routes/brands');
const orderRoutes = require('./routes/orders');
const bannerRoutes = require('./routes/banners');
const couponRoutes = require('./routes/coupons');
const reviewRoutes = require('./routes/reviews');
const uploadRoutes = require('./routes/upload');
const analyticsRoutes = require('./routes/analytics');
const userRoutes = require('./routes/users');
const searchRoutes = require('./routes/search');
const webhookRoutes = require('./routes/webhooks');
const webhookQueue = require('./services/webhookQueue');

const app = express();

// Trust proxy - required for Render deployment behind reverse proxy
app.set('trust proxy', 1);

connectDB();

const sanitizeMiddleware = (req, res, next) => {
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  next();
};

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-clerk-id', 'x-guest-id', 'x-session-id', 'x-visitor-id', 'svix-id', 'svix-timestamp', 'svix-signature'],
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cookieParser());

// Raw body parser for Clerk webhooks (must come before express.json)
// This preserves the raw body for signature verification
app.use('/api/auth/clerk-webhook', express.raw({ type: 'application/json' }));

// JSON parser for all other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware);

// Clerk middleware - initializes Clerk auth context for all requests
// This allows req.auth to be available in protected routes
app.use(clerkMiddleware());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests' });
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/webhooks', webhookRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start webhook retry processor
  webhookQueue.startRetryProcessor(30000); // Check every 30 seconds
  console.log('[WEBHOOK QUEUE] Retry processor started');
});

module.exports = app;
