import { Router } from 'express';
import actorRoutes from '../../modules/actor/actor.routes';
import orderRoutes from '../../modules/order/order.routes';
import serviceRoutes from '../../modules/service/service.routes';
import paymentRoutes from '../../modules/payment/payment.routes';
import locationRoutes from '../../modules/location/location.routes';
import reviewRoutes from '../../modules/review/review.routes';
import communicationRoutes from '../../modules/communication/communication.routes';
import voucherRoutes from '../../modules/voucher/voucher.routes';
import authRoutes from '../../modules/auth/auth.routes';

const router = Router();

router.use('/actors', actorRoutes);
router.use('/orders', orderRoutes);
router.use('/services', serviceRoutes);
router.use('/payments', paymentRoutes);
router.use('/locations', locationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/communications', communicationRoutes);
router.use('/vouchers', voucherRoutes);
router.use('/auth', authRoutes);

export default router;
