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
Personality traits: ${personality}.
The gift is for: ${occasion}.

Format each suggestion STRICTLY as:
Gift: [Name of the gift]
Image: [Detailed image description for search]
Available at: Etsy
Price: [Number between 500-5500]

Include all 5 suggestions with this exact format. Use only Etsy. Do not suggest Amazon, Flipkart, or any other site.`;

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
        const imagePrompt = entry.match(/Image:\s*(.*)/)?.[1]?.trim();
        const priceMatch = entry.match(/Price:\s*(.*)/)?.[1]?.trim();

        const price = priceMatch ? parseInt(priceMatch) : Math.floor(Math.random() * 5000) + 500;

        return {
          name,
          site: 'Etsy', // force to Etsy
          price
        };
      })
      .filter(g => g.name)
      .slice(0, 5);

    while (suggestions.length < 5) {
      suggestions.push({
        name: "Handmade Personalized Gift",
        site: 'Etsy',
        price: Math.floor(Math.random() * 5000) + 500
      });
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
