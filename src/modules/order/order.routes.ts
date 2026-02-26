import { Router } from 'express';
import { OrderController } from './order.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();
const orderController = new OrderController();

// User routes - create order, view own orders
router.post('/', authenticate, orderController.create.bind(orderController));
router.get('/actor/:actorId', authenticate, orderController.getByActor.bind(orderController));
router.get('/:id', authenticate, orderController.getById.bind(orderController));

// Admin routes - view all orders
router.get('/', authenticate, authorize(['ADMIN']), orderController.getAll.bind(orderController));

// Mechanic routes - view assigned orders, update status
router.get('/mechanic/:mechanicId', authenticate, authorize(['MECHANIC', 'ADMIN']), orderController.getByMechanic.bind(orderController));

// Staff routes - view assigned orders, update status
router.get('/staff/:staffId', authenticate, authorize(['STAFF', 'ADMIN']), orderController.getByStaff.bind(orderController));
router.patch('/:id/status', authenticate, authorize(['STAFF', 'MECHANIC', 'ADMIN']), orderController.updateStatus.bind(orderController));

export default router;
