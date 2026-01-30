const express = require('express');
const AWSController = require('../controllers/aws.controller');
const authenticate = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/aws/sync-costs
 * Sync AWS costs for an account
 * Requires authentication
 */
router.post('/sync-costs', authenticate, AWSController.syncCosts);

module.exports = router;
