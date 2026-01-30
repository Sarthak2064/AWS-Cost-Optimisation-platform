const logger = require('../utils/logger');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  // Default error status
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  }

  if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
  }

  if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Not Found';
  }

  // Don't leak error details in production
  const response = {
    error: message
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = err.details;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
