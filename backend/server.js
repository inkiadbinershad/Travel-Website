const express = require('express');
const cors = require('cors');
const sessionRoutes = require('./routes/sessionRoutes');
const adaptationRoutes = require('./routes/adaptationRoutes');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

app.use('/api/sessions', sessionRoutes);
app.use('/api/adaptations', adaptationRoutes);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
