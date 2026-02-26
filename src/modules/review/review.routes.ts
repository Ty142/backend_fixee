import { Router } from 'express';
import { ReviewController } from './review.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();
const reviewController = new ReviewController();

// User routes - create review, view reviews by service
router.post('/', authenticate, reviewController.create.bind(reviewController));
router.get('/service/:serviceId', reviewController.getByService.bind(reviewController)); // Public - anyone can view reviews
router.get('/:id', reviewController.getById.bind(reviewController)); // Public

// Admin routes - view all reviews, moderate reviews
router.get('/', authenticate, authorize(['ADMIN']), reviewController.getAll.bind(reviewController));
router.patch('/:id/moderate', authenticate, authorize(['ADMIN']), reviewController.moderate.bind(reviewController));

export default router;
