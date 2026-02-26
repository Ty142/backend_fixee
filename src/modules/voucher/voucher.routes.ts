import { Router } from 'express';
import { VoucherController } from './voucher.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();
const voucherController = new VoucherController();

// Admin/Staff routes - require authentication and Admin or Staff role
router.post('/', authenticate, authorize(['ADMIN', 'STAFF']), voucherController.create.bind(voucherController));
router.get('/', authenticate, authorize(['ADMIN', 'STAFF']), voucherController.getAll.bind(voucherController));
router.get('/:id', authenticate, authorize(['ADMIN', 'STAFF']), voucherController.getById.bind(voucherController));
router.put('/:id', authenticate, authorize(['ADMIN', 'STAFF']), voucherController.update.bind(voucherController));
router.delete('/:id', authenticate, authorize(['ADMIN', 'STAFF']), voucherController.delete.bind(voucherController));
router.patch('/:id/activate', authenticate, authorize(['ADMIN', 'STAFF']), voucherController.activate.bind(voucherController));
router.patch('/:id/deactivate', authenticate, authorize(['ADMIN', 'STAFF']), voucherController.deactivate.bind(voucherController));

// User routes - require authentication (any authenticated user)
router.get('/available/list', authenticate, voucherController.getAvailable.bind(voucherController));
router.post('/validate', authenticate, voucherController.validate.bind(voucherController));

export default router;
