import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDatabase } from './src/config/database';
import { ENV } from './src/config/environment';
import routes from './src/routes/index.routes';
import { errorHandler } from './src/middlewares/error.middleware';
import { loggerMiddleware } from './src/middlewares/logger.middleware';
import { notFoundHandler } from './src/middlewares/notFound.middleware';

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      process.env.CORS_ORIGIN,
    ];
    
    // Check if origin is in allowed list or matches Vercel pattern
    const isAllowed = allowedOrigins.some(allowed => allowed && origin === allowed) ||
                     origin.endsWith('.vercel.app');
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(loggerMiddleware);

// Root welcome route
app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Fixee API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/v1/auth',
      documentation: 'https://github.com/your-repo/api-docs'
    },
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api', routes);

// 404 Handler
app.use(notFoundHandler);

// Error Handler
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    
    const PORT = ENV.PORT;
    const HOST = process.env.HOST || '0.0.0.0'; // Bind to all interfaces for Render
    
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Environment: ${ENV.NODE_ENV}`);
      console.log(`🌐 Host: ${HOST}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
