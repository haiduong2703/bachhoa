import express from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getMyReviews,
  canReviewProduct,
  getAllReviews,
  approveReview,
  rejectReview,
  adminDeleteReview
} from '../controllers/reviewController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Get all reviews for a product (public)
router.get('/products/:productId/reviews', getProductReviews);

// Mark review as helpful (public)
router.post('/:id/helpful', markReviewHelpful);

// ==================== CUSTOMER ROUTES ====================

// Get my reviews
router.get('/my-reviews', authenticate, getMyReviews);

// Check if can review a product
router.get('/can-review/:productId', authenticate, canReviewProduct);

// Create a review (customer only)
router.post('/', authenticate, createReview);

// Update own review
router.put('/:id', authenticate, updateReview);

// Delete own review
router.delete('/:id', authenticate, deleteReview);

// ==================== ADMIN ROUTES ====================

// Get all reviews (admin)
router.get('/admin/all', authenticate, authorize('admin'), getAllReviews);

// Approve review (admin)
router.patch('/admin/:id/approve', authenticate, authorize('admin'), approveReview);

// Reject review (admin)
router.patch('/admin/:id/reject', authenticate, authorize('admin'), rejectReview);

// Delete review (admin)
router.delete('/admin/:id', authenticate, authorize('admin'), adminDeleteReview);

export default router;
