import { Router } from 'express';
import { ActorController } from './actor.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();
const actorController = new ActorController();

// Admin routes - view all actors, manage accounts, view statistics
router.get('/', authenticate, authorize(['ADMIN']), actorController.getAll.bind(actorController));
router.get('/statistics/overview', authenticate, authorize(['ADMIN']), actorController.getStatistics.bind(actorController));
router.patch('/:id/lock', authenticate, authorize(['ADMIN']), actorController.lockAccount.bind(actorController));
router.patch('/:id/unlock', authenticate, authorize(['ADMIN']), actorController.unlockAccount.bind(actorController));

// Public route - account creation (registration)
router.post('/account', actorController.createAccount.bind(actorController));

// Authenticated routes - view own profile, update own profile
router.get('/:id', authenticate, actorController.getById.bind(actorController));
router.put('/:id/profile', authenticate, actorController.updateProfile.bind(actorController));

export default router;
