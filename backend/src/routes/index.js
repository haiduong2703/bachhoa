import express from 'express';
import authRoutes from './auth.js';
import productRoutes from './products.js';
import categoryRoutes from './categoryRoutes.js';
import orderRoutes from './orders.js';
import userRoutes from './users.js';
import uploadRoutes from './uploads.js';
import couponRoutes from './coupons.js';
import statsRoutes from './stats.js';

const router = express.Router();

// API version prefix
const API_VERSION = '/api/v1';

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Bach Hoa API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount routes
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/products`, productRoutes);
// Simple categories endpoint
router.get(`${API_VERSION}/categories`, async (req, res) => {
  try {
    const { Category } = await import('../models/index.js');
    const categories = await Category.findAll({
      where: { status: 'active' },
      order: [['sortOrder', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      status: 'success',
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch categories'
    });
  }
});
router.use(`${API_VERSION}/orders`, orderRoutes);
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/uploads`, uploadRoutes);
router.use(`${API_VERSION}/coupons`, couponRoutes);
router.use(`${API_VERSION}/stats`, statsRoutes);

// 404 handler for API routes
router.use(`${API_VERSION}/*`, (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

export default router;
