import { Router } from 'express';
import { CommunicationController } from './communication.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();
const communicationController = new CommunicationController();

// User/Staff/Mechanic routes - send messages, view messages by order
router.post('/send', authenticate, communicationController.sendMessage.bind(communicationController));
router.post('/', authenticate, communicationController.createMessage.bind(communicationController));
router.get('/order/:orderId', authenticate, communicationController.getByOrderId.bind(communicationController));
router.get('/:id', authenticate, communicationController.getById.bind(communicationController));

// Admin routes - view all messages
router.get('/', authenticate, authorize(['ADMIN']), communicationController.getAll.bind(communicationController));

export default router;
