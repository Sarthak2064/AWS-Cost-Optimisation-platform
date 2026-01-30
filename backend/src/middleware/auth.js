const { createUserClient } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Authentication middleware - validates JWT token from Supabase
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header is required' });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token is required' });
    }

    // Create a Supabase client with the user's token
    const supabaseClient = createUserClient(token);

    // Verify the token and get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      logger.warn('Authentication failed:', userError?.message || 'User not found');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Attach user and token to request object
    req.user = user;
    req.token = token;
    req.supabaseClient = supabaseClient;

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = authenticate;
