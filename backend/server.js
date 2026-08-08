const dotenv = require('dotenv');

// Load environment variables before anything else is required — several
// modules (e.g. config/razorpay.js) read process.env at require-time.
dotenv.config();

const connectDB = require('./config/db');
const app = require('./app'); // Import the Express app from app.js

// Connect to MongoDB
connectDB();

// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});