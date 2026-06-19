/**
 * AI Provider Abstraction
 * Switch between Claude and OpenAI via AI_PROVIDER env variable
 * Default: claude
 */

const claudeProvider = require('./claude');
const openaiProvider = require('./openai');

const providers = {
  claude: claudeProvider,
  openai: openaiProvider,
};

const getAI = () => {
  const provider = process.env.AI_PROVIDER || 'claude';
  if (!providers[provider]) {
    throw new Error(`Unknown AI provider: ${provider}. Use "claude" or "openai".`);
  }
  return providers[provider];
};

module.exports = { getAI };
