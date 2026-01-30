const { Readable } = require('stream');

/**
 * Helper to handle streaming responses from external APIs
 */
class StreamHandler {
  /**
   * Process SSE stream and extract content
   */
  static async* processSSEStream(response) {
    const reader = response.body.getReader();
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
                yield content;
              }
            } catch (e) {
              // Skip invalid JSON
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Create a readable stream from async generator
   */
  static createReadableStream(asyncGenerator) {
    return new Readable({
      async read() {
        try {
          for await (const chunk of asyncGenerator) {
            if (!this.push(chunk)) {
              break;
            }
          }
          this.push(null);
        } catch (error) {
          this.destroy(error);
        }
      }
    });
  }
}

module.exports = StreamHandler;
