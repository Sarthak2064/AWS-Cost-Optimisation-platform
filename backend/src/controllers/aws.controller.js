const AWSService = require('../services/aws.service');
const SupabaseService = require('../services/supabase.service');
const { validateAccountId } = require('../utils/validators');
const logger = require('../utils/logger');

/**
 * AWS Controller - handles AWS cost synchronization
 */
class AWSController {
  /**
   * Sync AWS costs for an account
   */
  static async syncCosts(req, res, next) {
    try {
      const { accountId } = req.body;
      const userId = req.user.id;

      // Validate account ID
      const validation = validateAccountId(accountId);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      // Fetch AWS account details
      const awsAccount = await SupabaseService.getAwsAccount(accountId, userId);

      if (!awsAccount) {
        return res.status(404).json({ error: 'AWS account not found' });
      }

      logger.info('Fetching costs for account:', awsAccount.account_name);

      let credentials;
      const region = awsAccount.region || 'us-east-1';

      // Handle IAM Role authentication
      if (awsAccount.connection_type === 'iam_role' && awsAccount.iam_role_arn) {
        credentials = await AWSService.assumeRole(awsAccount.iam_role_arn, region);
      }
      // Handle Access Key authentication
      else if (awsAccount.connection_type === 'access_key') {
        if (!awsAccount.access_key_id_encrypted || !awsAccount.secret_key_encrypted) {
          return res.status(400).json({ 
            error: 'Access key credentials not found for this account' 
          });
        }

        logger.info('Using access key authentication for:', awsAccount.account_name);

        credentials = {
          accessKeyId: awsAccount.access_key_id_encrypted,
          secretAccessKey: awsAccount.secret_key_encrypted
        };
      } else {
        return res.status(400).json({ error: 'Invalid connection type' });
      }

      // Fetch cost data from AWS
      const costResponse = await AWSService.getCostAndUsage(credentials, region);

      // Process cost data
      const costRecords = AWSService.processCostData(costResponse, accountId);

      logger.info(`Processing ${costRecords.length} cost records...`);

      // Delete existing records to avoid duplicates
      await SupabaseService.deleteCostData(accountId);

      // Insert new cost data
      if (costRecords.length > 0) {
        await SupabaseService.insertCostData(costRecords);
      }

      // Update last sync time
      await SupabaseService.updateLastSyncTime(accountId);

      return res.status(200).json({
        success: true,
        recordsCount: costRecords.length,
        message: `Successfully synced ${costRecords.length} cost records`
      });
    } catch (error) {
      logger.error('Error syncing AWS costs:', error);
      return res.status(500).json({ 
        error: error.message || 'Failed to sync AWS costs' 
      });
    }
  }
}

module.exports = AWSController;
