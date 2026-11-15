// Shared settings. Values come from environment variables; the defaults are for local development and tests only.
module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'serpent-dev-secret',
  JWT_EXPIRES_IN: '24h',
};
