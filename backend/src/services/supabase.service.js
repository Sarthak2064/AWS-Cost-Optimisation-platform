const { supabaseAdmin } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Supabase Service - handles database operations
 */
class SupabaseService {
  /**
   * Get AWS account by ID and user ID
   */
  static async getAwsAccount(accountId, userId) {
    const { data, error } = await supabaseAdmin
      .from('aws_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', userId)
      .single();

    if (error) {
      logger.error('Error fetching AWS account:', error);
      throw new Error('AWS account not found');
    }

    return data;
  }

  /**
   * Delete existing cost data for an account
   */
  static async deleteCostData(accountId) {
    const { error } = await supabaseAdmin
      .from('cost_data')
      .delete()
      .eq('aws_account_id', accountId);

    if (error) {
      logger.error('Error deleting cost data:', error);
      throw error;
    }
  }

  /**
   * Insert cost records in batches
   */
  static async insertCostData(costRecords) {
    if (costRecords.length === 0) {
      return;
    }

    // Supabase has a limit on batch inserts, so we'll do it in chunks
    const chunkSize = 1000;
    const chunks = [];

    for (let i = 0; i < costRecords.length; i += chunkSize) {
      chunks.push(costRecords.slice(i, i + chunkSize));
    }

    for (let i = 0; i < chunks.length; i++) {
      logger.info(`Inserting chunk ${i + 1}/${chunks.length} (${chunks[i].length} records)...`);
      
      const { error } = await supabaseAdmin
        .from('cost_data')
        .insert(chunks[i]);

      if (error) {
        logger.error('Error inserting cost data chunk:', error);
        throw error;
      }
    }
  }

  /**
   * Update last sync time for an AWS account
   */
  static async updateLastSyncTime(accountId) {
    const { error } = await supabaseAdmin
      .from('aws_accounts')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', accountId);

    if (error) {
      logger.error('Error updating last sync time:', error);
      throw error;
    }
  }
}

module.exports = SupabaseService;
