/**
 * Validate message for AI assistant
 */
const validateAIMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message is required and must be a string' };
  }

  if (message.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (message.length > 10000) {
    return { valid: false, error: 'Message is too long (max 10000 characters)' };
  }

  return { valid: true };
};

/**
 * Validate account ID
 */
const validateAccountId = (accountId) => {
  if (!accountId || typeof accountId !== 'string') {
    return { valid: false, error: 'Account ID is required and must be a string' };
  }

  // Basic UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(accountId)) {
    return { valid: false, error: 'Invalid account ID format' };
  }

  return { valid: true };
};

/**
 * Validate AWS region
 */
const validateAwsRegion = (region) => {
  const validRegions = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1',
    'ap-south-1', 'ap-northeast-1', 'ap-northeast-2', 'ap-southeast-1', 'ap-southeast-2',
    'ca-central-1', 'sa-east-1'
  ];

  if (region && !validRegions.includes(region)) {
    return { valid: false, error: 'Invalid AWS region' };
  }

  return { valid: true };
};

module.exports = {
  validateAIMessage,
  validateAccountId,
  validateAwsRegion
};
