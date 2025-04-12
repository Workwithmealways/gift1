require('dotenv').config();
const express = require('express');
const cors = require('cors');
const suggestionsRoute = require('./routes/suggestions');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json()); 
app.use('/api', suggestionsRoute); 
app.get('/api/health', (req, res) => res.status(200).send('OK'));

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const __dirname = path.resolve();
  
  // Serve static files
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Handle React routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
