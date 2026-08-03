require('dotenv').config();

const config = {
    port: Number(process.env.PORT) || 3000,
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    env: process.env.NODE_ENV || 'development'
};

if (!config.geminiApiKey) {
    console.warn('WARNING: GEMINI_API_KEY not set in .env file. Chat endpoint will return errors.');
}

if (config.port < 1 || config.port > 65535) {
    console.error(`Invalid PORT "${process.env.PORT}". Using default 3000.`);
    config.port = 3000;
}

module.exports = config;
