require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to the database first
connectDB().then(() => {
  // Only start the Express server if the database connects successfully
  app.listen(PORT, () => {
    console.log(`🚀 Server running dynamically on port ${PORT}`);
  });
});