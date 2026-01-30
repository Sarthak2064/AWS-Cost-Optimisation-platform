const { AssumeRoleCommand } = require('@aws-sdk/client-sts');
const { GetCostAndUsageCommand } = require('@aws-sdk/client-cost-explorer');
const { createSTSClient, createCostExplorerClient } = require('../config/aws');
const logger = require('../utils/logger');

/**
 * AWS Service - handles AWS SDK operations
 */
class AWSService {
  /**
   * Assume IAM role and get temporary credentials
   */
  static async assumeRole(roleArn, region = 'us-east-1') {
    logger.info('Assuming role:', roleArn);

    const stsClient = createSTSClient(region);

    const command = new AssumeRoleCommand({
      RoleArn: roleArn,
      RoleSessionName: 'CostOptimizerSession',
      DurationSeconds: 3600
    });

    const response = await stsClient.send(command);

    if (!response.Credentials) {
      throw new Error('Failed to assume IAM role');
    }

    return {
      accessKeyId: response.Credentials.AccessKeyId,
      secretAccessKey: response.Credentials.SecretAccessKey,
      sessionToken: response.Credentials.SessionToken
    };
  }

  /**
   * Fetch cost data from AWS Cost Explorer
   */
  static async getCostAndUsage(credentials, region = 'us-east-1', monthsBack = 12) {
    const costExplorerClient = createCostExplorerClient(credentials, region);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    const command = new GetCostAndUsageCommand({
      TimePeriod: {
        Start: startDate.toISOString().split('T')[0],
        End: endDate.toISOString().split('T')[0]
      },
      Granularity: 'DAILY',
      Metrics: ['UnblendedCost', 'UsageQuantity'],
      GroupBy: [
        { Type: 'DIMENSION', Key: 'SERVICE' },
        { Type: 'DIMENSION', Key: 'REGION' }
      ]
    });

    logger.info(`Fetching cost data from AWS Cost Explorer (last ${monthsBack} months)...`);

    const response = await costExplorerClient.send(command);

    return response;
  }

  /**
   * Process AWS Cost Explorer response into cost records
   */
  static processCostData(costResponse, accountId) {
    const costRecords = [];

    if (costResponse.ResultsByTime) {
      for (const result of costResponse.ResultsByTime) {
        const recordDate = result.TimePeriod?.Start || '';

        if (result.Groups) {
          for (const group of result.Groups) {
            const serviceName = group.Keys?.[0] || 'Unknown';
            const region = group.Keys?.[1] || 'global';
            const cost = parseFloat(group.Metrics?.UnblendedCost?.Amount || '0');
            const usage = parseFloat(group.Metrics?.UsageQuantity?.Amount || '0');
            const usageUnit = group.Metrics?.UsageQuantity?.Unit || '';

            if (cost > 0) {
              costRecords.push({
                aws_account_id: accountId,
                service_name: serviceName,
                region: region,
                cost_amount: cost,
                usage_quantity: usage,
                usage_unit: usageUnit,
                record_date: recordDate
              });
            }
          }
        }
      }
    }

    return costRecords;
  }
}

module.exports = AWSService;
