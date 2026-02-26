import { Router } from 'express';
import v1Routes from './v1/index';

const router = Router();

// Health check endpoint for monitoring
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

router.use('/v1', v1Routes);

export default router;
