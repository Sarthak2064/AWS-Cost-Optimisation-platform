const express = require('express');
const aiRoutes = require('./ai.routes');
const awsRoutes = require('./aws.routes');

const router = express.Router();

// Mount route modules
router.use('/ai', aiRoutes);
router.use('/aws', awsRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'AWS Cost Optimizer API',
    version: '1.0.0',
    endpoints: {
      ai: {
        chat: 'POST /api/ai/chat'
      },
      aws: {
        syncCosts: 'POST /api/aws/sync-costs'
      }
    }
  });
});

module.exports = router;
