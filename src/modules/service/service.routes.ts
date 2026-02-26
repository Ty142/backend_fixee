import { Router } from 'express';
import { ServiceController } from './service.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();
const serviceController = new ServiceController();

// Public routes - browse services (anyone can view)
router.get('/', serviceController.getAll.bind(serviceController));
router.get('/:id', serviceController.getById.bind(serviceController));

// Admin routes - approve/reject services
router.patch('/:id/approve', authenticate, authorize(['ADMIN']), serviceController.approve.bind(serviceController));
router.patch('/:id/reject', authenticate, authorize(['ADMIN']), serviceController.reject.bind(serviceController));

export default router;
