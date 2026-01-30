const AIService = require('../services/ai.service');
const { validateAIMessage } = require('../utils/validators');
const StreamHandler = require('../utils/stream');
const logger = require('../utils/logger');

/**
 * AI Controller - handles AI cost assistant requests
 */
class AIController {
  /**
   * Handle AI chat request with streaming response
   */
  static async chat(req, res, next) {
    try {
      const { message } = req.body;

      // Validate message
      const validation = validateAIMessage(message);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      // Get streaming response from AI service
      const aiResponse = await AIService.getChatCompletion(message);

      // Set streaming response headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Process the stream
      const reader = aiResponse.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;

                if (content) {
                  // Write content directly to response
                  res.write(content);
                }
              } catch (e) {
                // Skip invalid JSON
                continue;
              }
            }
          }
        }
      } catch (error) {
        logger.error('Streaming error:', error);
        res.write('\n[ERROR: Stream interrupted]');
      } finally {
        res.end();
      }
    } catch (error) {
      logger.error('AI chat error:', error);
      
      // If headers haven't been sent yet, send JSON error
      if (!res.headersSent) {
        return res.status(500).json({ error: error.message || 'Failed to process AI request' });
      }
      
      // Otherwise, write error to stream and end
      res.write('\n[ERROR: ' + error.message + ']');
      res.end();
    }
  }
}

module.exports = AIController;
