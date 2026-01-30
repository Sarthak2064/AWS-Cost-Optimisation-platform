const express = require('express');
const AIController = require('../controllers/ai.controller');
const authenticate = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/ai/chat
 * AI cost assistant chat endpoint
 * Requires authentication
 */
router.post('/chat', authenticate, AIController.chat);

module.exports = router;
