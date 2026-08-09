require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { clerkMiddleware } = require('@clerk/express');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { checkBlockedIP, trackSuspiciousActivity } = require('./middleware/ipBlocker');

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
const ipBlockRoutes = require('./routes/ipBlock');
const webhookQueue = require('./services/webhookQueue');

const app = express();

// Trust proxy - required for Render deployment behind reverse proxy
app.set('trust proxy', 1);

connectDB();

// ========== SECURITY MIDDLEWARE ==========

// 1. Security Headers (Helmet) - CSP disabled for frontend (handled by Vercel)
app.use(helmet({
  contentSecurityPolicy: false, // Let frontend handle CSP via Vercel headers
  crossOriginEmbedderPolicy: false, // Needed for external images
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// 2. CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-clerk-id', 'x-guest-id', 'x-session-id', 'x-visitor-id', 'svix-id', 'svix-timestamp', 'svix-signature'],
  maxAge: 86400, // Preflight cache for 24 hours
}));

// 3. HTTP Parameter Pollution protection
app.use(hpp());

// 4. MongoDB injection sanitization
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`[SECURITY] Sanitized key: ${key} from ${req.method} ${req.path}`);
  },
}));

// 5. Compression
app.use(compression());

// 6. Logging
app.use(morgan('combined'));

// 7. Cookie parser with security options
app.use(cookieParser(process.env.COOKIE_SECRET || undefined));

// Raw body parser for Clerk webhooks (must come before express.json)
app.use('/api/auth/clerk-webhook', express.raw({ type: 'application/json' }));

// JSON parser with size limits
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// 8. Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 seconds
  res.setTimeout(30000);
  next();
});

// 9. Security headers middleware
app.use((req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent page from being embedded
  res.setHeader('X-Frame-Options', 'DENY');
  // Enable XSS filtering
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  // Strict Transport Security
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
});

// Clerk middleware - initializes Clerk auth context for all requests
// This allows req.auth to be available in protected routes
app.use(clerkMiddleware());

const limiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, 
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Very strict rate limiting for sensitive operations
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  message: 'Too many attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// IP blocking and suspicious activity tracking
app.use(checkBlockedIP);
app.use('/api/', trackSuspiciousActivity);

app.use('/api/auth', authLimiter, authRoutes);
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
app.use('/api/ip-block', ipBlockRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Security audit endpoint (admin only)
app.get('/api/security/status', (req, res) => {
  const securityChecks = {
    helmet: true,
    cors: true,
    rateLimiting: true,
    inputSanitization: true,
    hpp: true,
    mongoSanitize: true,
    securityHeaders: true,
    httpsEnforced: process.env.NODE_ENV === 'production',
    environment: process.env.NODE_ENV || 'development',
  };
  res.json({ success: true, data: securityChecks });
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
