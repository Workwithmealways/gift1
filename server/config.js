const { OPENROUTER_API_KEY } = process.env;

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5173/',
    'X-Title': 'gift-recommendation-platform',
  },
});