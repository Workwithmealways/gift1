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
Available at: [Website like Etsy, Flipkart, Notonthehighstreet, ThriveMarket]
Price: [Number between 500-5500]

Include all 5 suggestions with this exact format.`;

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
          'HTTP-Referer': 'http://localhost:5173/',
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
        const siteMatch = entry.match(/Available at:\s*(.*)/)?.[1]?.trim();
        const priceMatch = entry.match(/Price:\s*(.*)/)?.[1]?.trim();

        // Default values for missing data
        const site = siteMatch || 'Etsy';
        const price = priceMatch ? parseInt(priceMatch) : Math.floor(Math.random() * 5000) + 500;
        const searchQuery = `${imagePrompt || name} ${site} gift`.replace(/ /g,',');

        return {
          name,
          site: siteMatch || 'Etsy',
          price: priceMatch ? parseInt(priceMatch) : Math.floor(Math.random() * 5000) + 500
        };
      })
      .filter(g => g.name) // Remove empty entries
      .slice(0, 5); // Ensure exactly 5

    // Fill remaining slots if AI returned fewer than 5
    while (suggestions.length < 5) {
      suggestions.push({
        name: "Personalized Gift Box",
        site: 'Etsy',
        price: Math.floor(Math.random() * 5000) + 500
      });
    }

    // Ensure no Amazon links remain
    const cleanedSuggestions = suggestions.map(suggestion => ({
      name: suggestion.name,
      site: suggestion.site.replace(/amazon/gi, 'Etsy'),
      price: suggestion.price
    }));

    return res.json(cleanedSuggestions);
  } catch (error) {
    console.error('❌ OpenRouter Error:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Failed to fetch suggestions',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

module.exports = router;