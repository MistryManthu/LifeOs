const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Send a prompt to Claude and return the text response
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @returns {Promise<string>}
 */
const chat = async (systemPrompt, userMessage) => {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });
  return response.content[0].text;
};

module.exports = { chat };
