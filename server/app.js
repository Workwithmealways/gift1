require('dotenv').config();
const express = require('express');
const cors = require('cors');
const suggestionsRoute = require('./routes/suggestions');

const app = express();
const PORT = 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json()); 
app.use('/api', suggestionsRoute); 
app.get('/api/health', (req, res) => res.status(200).send('OK'));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
