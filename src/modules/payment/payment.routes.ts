import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();
const paymentController = new PaymentController();

// User routes - create payment, view own payment history
router.post('/', authenticate, paymentController.create.bind(paymentController));
router.get('/actor/:actorId', authenticate, paymentController.getByActor.bind(paymentController));
router.get('/:id', authenticate, paymentController.getById.bind(paymentController));

// Admin routes - view all payments
router.get('/', authenticate, authorize(['ADMIN']), paymentController.getAll.bind(paymentController));

export default router;
