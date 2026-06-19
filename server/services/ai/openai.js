const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Send a prompt to GPT-4o and return the text response
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @returns {Promise<string>}
 */
const chat = async (systemPrompt, userMessage) => {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  });
  return response.choices[0].message.content;
};

module.exports = { chat };
