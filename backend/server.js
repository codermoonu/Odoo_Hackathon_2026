const dotenv = require('dotenv');
const connectDB = require('./config/db');
const app = require('./app'); // Import the Express app from app.js

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});