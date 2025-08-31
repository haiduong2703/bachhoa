import express from 'express';

const router = express.Router();

// Placeholder routes for uploads
router.post('/image', (req, res) => {
  res.json({
    status: 'success',
    message: 'Upload image endpoint - under development',
    data: { url: '/uploads/placeholder.jpg' }
  });
});

router.post('/images', (req, res) => {
  res.json({
    status: 'success',
    message: 'Upload multiple images endpoint - under development',
    data: { urls: ['/uploads/placeholder1.jpg', '/uploads/placeholder2.jpg'] }
  });
});

export default router;
