require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: 'https://toppackfrontend.vercel.app', // Replace with your actual frontend domain
  optionsSuccessStatus: 200,
};

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
const productRoute = require('./routes/productRoute');
const financeRoute = require('./routes/financeRoute');
const clicheRoute = require('./routes/clicheRoute');
app.use('/api/products', productRoute);
app.use('/api/finance', financeRoute);
app.use('/api/cliches', clicheRoute);
// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
}).then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});
