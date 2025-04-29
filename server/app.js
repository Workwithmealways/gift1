require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const suggestionsRoute = require('./routes/suggestions');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS dynamically based on environment
const allowedOrigins = [
  'http://localhost:5173',
  'https://aesthetic-licorice-6f6696.netlify.app'
];

// Configure CORS
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use('/api', suggestionsRoute);
app.get('/api/health', (req, res) => res.status(200).send('OK'));

// Production configuration
if (process.env.NODE_ENV === 'production') {
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

// Development fallback
if (process.env.NODE_ENV === 'production') {
  // Keep existing production config
} else {
  // Only show message in development
  app.get('/', (req, res) => {
    res.send('Development mode - Run React separately on port 5173');
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});