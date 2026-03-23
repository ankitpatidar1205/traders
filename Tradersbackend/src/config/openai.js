const OpenAI = require('openai');

let openai = null;

if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
} else {
    console.log('⚠️  OPENAI_API_KEY not set — AI features disabled');
}

module.exports = openai;
