const { STSClient } = require('@aws-sdk/client-sts');
const { CostExplorerClient } = require('@aws-sdk/client-cost-explorer');
const { getConfig } = require('./env');

const config = getConfig();

/**
 * Create STS client with base credentials
 */
const createSTSClient = (region = 'us-east-1') => {
  if (!config.aws.accessKeyId || !config.aws.secretAccessKey) {
    throw new Error('AWS credentials not configured in environment');
  }

  return new STSClient({
    region,
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey
    }
  });
};

/**
 * Create Cost Explorer client with credentials
 */
const createCostExplorerClient = (credentials, region = 'us-east-1') => {
  return new CostExplorerClient({
    region,
    credentials
  });
};

module.exports = {
  createSTSClient,
  createCostExplorerClient
};
