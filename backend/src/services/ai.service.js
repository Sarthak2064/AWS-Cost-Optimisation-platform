const fetch = require('node-fetch');
const { getConfig } = require('../config/env');
const logger = require('../utils/logger');

const config = getConfig();

/**
 * AI Service - handles interactions with OnSpace AI API
 */
class AIService {
  /**
   * Get streaming chat completion from OnSpace AI
   */
  static async getChatCompletion(message) {
    const { apiKey, baseUrl } = config.onspaceAi;

    if (!apiKey || !baseUrl) {
      throw new Error('OnSpace AI not configured');
    }

    logger.info('Calling OnSpace AI for cost optimization advice...');

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an AWS cost optimization expert. Provide clear, conversational advice for reducing AWS costs, detecting anomalies, and improving cloud spending efficiency. Write in natural, flowing text using simple markdown formatting:\n\n- Use **bold** for emphasis on important points\n- Use numbered lists for step-by-step instructions\n- Use bullet points for options or features\n- Keep paragraphs short and readable\n- Avoid excessive special characters or symbols\n- Focus on being helpful, professional, and easy to understand'
          },
          {
            role: 'user',
            content: message
          }
        ],
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('OnSpace AI error:', errorText);
      throw new Error(`OnSpace AI: ${errorText}`);
    }

    return response;
  }
}

module.exports = AIService;
