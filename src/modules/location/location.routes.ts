import { Router } from 'express';
import { LocationController } from './location.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();
const locationController = new LocationController();

// User routes - manage own addresses
router.post('/', authenticate, locationController.create.bind(locationController));
router.get('/actor/:actorId', authenticate, locationController.getByActorId.bind(locationController));
router.get('/:id', authenticate, locationController.getById.bind(locationController));

// Admin routes - view all locations
router.get('/', authenticate, authorize(['ADMIN']), locationController.getAll.bind(locationController));

export default router;
