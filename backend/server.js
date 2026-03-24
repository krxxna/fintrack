require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ── Route imports
const authRoutes        = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const analyticsRoutes   = require('./routes/analytics');

const app = express();

// ── Connect to MongoDB
connectDB();

// ── Security headers
app.use(helmet());

// ── CORS
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:3000',
        'https://fintrack-nu-kohl.vercel.app',
        process.env.CLIENT_URL
      ].filter(Boolean);
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max:      100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use('/api/', limiter);
app.use('/api/auth/login',  authLimiter);
app.use('/api/auth/signup', authLimiter);

// ── Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request logging (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── API Routes
app.use('/api/auth',         authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics',    analyticsRoutes);

// ── Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FinTrack API is running 🚀',
    docs:    '/api/health',
  });
});

// ── Health check
app.get('/api/health', (req, res) => {
  res.json({
    success:   true,
    status:    'OK',
    env:       process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global error handler (must be last)
app.use(errorHandler);

// ── Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀  Server running on port ${PORT}  [${process.env.NODE_ENV || 'development'}]`);
});

// ── Graceful shutdown
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
  server.close(() => process.exit(1));
});
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated gracefully.');
    process.exit(0);
  });
});

module.exports = app;