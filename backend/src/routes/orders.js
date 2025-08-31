import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/', orderController.createOrder); // Allow guest orders
router.get('/track/:orderNumber', orderController.trackOrder);

// Protected routes - require authentication
router.use(authenticate);

// Customer routes
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.patch('/:id/cancel', orderController.cancelOrder);

// Staff/Admin routes
router.patch('/:id/status',
  authorize('staff', 'admin'),
  orderController.updateOrderStatus
);

export default router;
