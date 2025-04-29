require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const suggestionsRoute = require('./routes/suggestions');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'https://aesthetic-licorice-6f6696.netlify.app',
  'https://gift1-2.onrender.com'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use('/api', suggestionsRoute);
app.get('/api/health', (req, res) => res.status(200).send('OK'));

// Production fallback (without serving React frontend)
if (process.env.NODE_ENV === 'production') {
  app.get('/', (req, res) => {
    res.send('Server running in production mode.');
  });
} else {
  app.get('/', (req, res) => {
    res.send('Development mode - Run React separately on port 5173');
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
