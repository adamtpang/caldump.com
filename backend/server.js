const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// Debug logging
console.log('=== Server Initialization ===');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');
console.log('Port:', process.env.PORT || 8080);

// CORS configuration - MUST BE FIRST
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://caldump.com',
      'https://www.caldump.com',
      'http://localhost:5173',
      'http://localhost:3000',
      'https://caldump-git-main-adampangelinans-projects.vercel.app'
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Request logging middleware with detailed info
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// Memory usage logging
const logMemoryUsage = () => {
  const used = process.memoryUsage();
  console.log('Memory Usage:');
  for (let key in used) {
    console.log(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
};

// Log memory usage every 5 minutes
setInterval(logMemoryUsage, 5 * 60 * 1000);

// Root route for basic server check
app.get('/', (req, res) => {
  res.json({
    message: 'CalDump API server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Health check route with detailed status
app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState
    },
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV
  };

  res.json(health);
});

// Special handling for Stripe webhook route
app.post('/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  require('./controllers/stripeController').webhook
);

// Regular JSON parsing with reasonable limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// MongoDB connection with enhanced retry logic
const connectDB = async (retries = 5, delay = 5000) => {
  try {
    console.log('Attempting MongoDB connection...');
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority'
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('Successfully connected to MongoDB');

    // Monitor MongoDB connection
    mongoose.connection.on('disconnected', () => {
      console.error('MongoDB disconnected! Attempting to reconnect...');
      setTimeout(() => connectDB(1), 5000);
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', {
        message: err.message,
        code: err.code,
        name: err.name
      });
    });

  } catch (err) {
    console.error('MongoDB connection error:', {
      message: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack
    });

    if (retries > 0) {
      console.log(`Retrying connection in ${delay}ms... (${retries} attempts left)`);
      setTimeout(() => connectDB(retries - 1, delay), delay);
    } else {
      console.error('All MongoDB connection attempts failed');
      process.exit(1);
    }
  }
};

// API Routes
console.log('Registering API routes...');
const authRoutes = require('./routes/auth');
const calendarRoutes = require('./routes/calendar');
const purchasesRoutes = require('./routes/purchases');

app.use('/api/auth', authRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/purchases', purchasesRoutes);

// Print registered routes
console.log('\nRegistered Routes:');
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        console.log(`${Object.keys(handler.route.methods).join(', ').toUpperCase()} /api${handler.route.path}`);
      }
    });
  }
});

// 404 handler
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Not Found',
    path: req.url,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware with detailed logging
app.use((err, req, res, next) => {
  console.error('=== Error Details ===');
  console.error('Timestamp:', new Date().toISOString());
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  console.error('Request URL:', req.url);
  console.error('Request Method:', req.method);
  console.error('Request Headers:', req.headers);

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    path: req.url,
    timestamp: new Date().toISOString()
  });
});

// Start server only after MongoDB connection is established
const startServer = async () => {
  try {
    await connectDB();

    // Railway provides PORT environment variable
    const PORT = process.env.PORT || 8080;

    // Log environment details
    console.log('\n=== Environment Details ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('PORT:', PORT);
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n=== Server Started ===`);
      console.log(`Time: ${new Date().toISOString()}`);
      console.log(`Port: ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Memory Usage:`);
      logMemoryUsage();
    });

    // Graceful shutdown handler
    const gracefulShutdown = async (signal) => {
      console.log(`\n=== Graceful Shutdown Initiated ===`);
      console.log(`Signal: ${signal}`);
      console.log(`Time: ${new Date().toISOString()}`);

      try {
        // Stop accepting new requests
        server.close(() => {
          console.log('HTTP server closed');
        });

        // Close MongoDB connection
        if (mongoose.connection.readyState !== 0) {
          await mongoose.connection.close();
          console.log('MongoDB connection closed');
        }

        console.log('Graceful shutdown completed');
        process.exit(0);
      } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
      }
    };

    // Handle various shutdown signals
    ['SIGTERM', 'SIGINT', 'SIGUSR2'].forEach(signal => {
      process.on(signal, () => gracefulShutdown(signal));
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('=== Uncaught Exception ===');
      console.error('Time:', new Date().toISOString());
      console.error('Error:', err);
      console.error('Stack:', err.stack);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('=== Unhandled Rejection ===');
      console.error('Time:', new Date().toISOString());
      console.error('Reason:', reason);
      console.error('Promise:', promise);
      gracefulShutdown('unhandledRejection');
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Start the server
startServer();