import express from 'express';

const router = express.Router();

// Placeholder routes for users
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Users endpoint - under development',
    data: []
  });
});

router.get('/:id', (req, res) => {
  res.json({
    status: 'success',
    message: 'User detail endpoint - under development',
    data: { id: req.params.id }
  });
});

export default router;
