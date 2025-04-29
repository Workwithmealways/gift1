const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;

router.post('/suggestions', async (req, res) => {
  const { name, interests, personality, occasion } = req.body || {};

  if (!name || !interests || !personality || !occasion) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const prompt = `
Suggest exactly 5 UNIQUE and personalized gift ideas for someone named "${name}".
They are interested in: ${interests}.
Their personality is: ${personality}.
The gift is for: ${occasion}.

Use this format exactly for each suggestion:

Gift: [Short and specific name like "Handmade Wooden Journal", "Custom Star Map"]
Available at: Etsy
Price: [Number between 500 and 5500]

Only include 5 suggestions. Do not repeat gift names. Do not include Amazon or Flipkart.
`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-4-maverick:free',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://gift1-2.onrender.com/',
          'X-Title': 'gift-recommendation-platform',
        },
      }
    );

    const content = response.data.choices[0].message.content;

    const suggestions = content
      .split(/\n(?=Gift:)/)
      .map(entry => {
        const name = entry.match(/Gift:\s*(.*)/)?.[1]?.trim();
        const price = entry.match(/Price:\s*(.*)/)?.[1]?.trim();
        return name && price
          ? {
              name,
              site: 'Etsy',
              price: parseInt(price),
            }
          : null;
      })
      .filter(Boolean)
      .slice(0, 5);

    if (suggestions.length < 5) {
      return res.status(500).json({
        error: 'AI returned fewer than 5 suggestions. Try rephrasing your input.',
      });
    }

    return res.json(suggestions);
  } catch (error) {
    console.error('❌ AI Error:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to fetch suggestions',
      details: error.response?.data?.error?.message || error.message,
    });
  }
});

module.exports = router;
