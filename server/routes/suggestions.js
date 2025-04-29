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

  const prompt = `Suggest exactly 5 unique gift ideas for someone named ${name}.
Their interests include: ${interests}.
Their personality traits are: ${personality}.
The gift is for: ${occasion}.

Each suggestion must follow **this exact format**:

Gift: [Short, specific gift name like "Handmade Wooden Watch", "Customized Star Map"]
Image: [Short description to visualize the product]
Available at: Etsy
Price: [Number between 500-5500]

Do not suggest Amazon, Flipkart, or any other site.
Ensure all 5 gift names are different and Etsy-appropriate.`;

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
        const priceMatch = entry.match(/Price:\s*(.*)/)?.[1]?.trim();
        const price = priceMatch ? parseInt(priceMatch) : Math.floor(Math.random() * 5000) + 500;

        return {
          name,
          site: 'Etsy',
          price
        };
      })
      .filter(g => g.name)
      .slice(0, 5);

    if (suggestions.length < 5) {
      return res.status(500).json({ error: 'AI returned fewer than 5 valid suggestions. Please try again.' });
    }

    return res.json(suggestions);
  } catch (error) {
    console.error('❌ OpenRouter Error:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to fetch suggestions',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

module.exports = router;
