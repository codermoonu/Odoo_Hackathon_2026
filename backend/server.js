const dotenv = require('dotenv');

// Load environment variables before anything else is required — several
// modules (e.g. config/razorpay.js) read process.env at require-time.
dotenv.config();

const http = require('http');
const connectDB = require('./config/db');
const app = require('./app'); // Import the Express app from app.js
const initSocketServer = require('./config/socket');

// Connect to MongoDB
connectDB();

// Wrap the Express app in a raw HTTP server so Socket.io can attach to the
// same port instead of needing a separate listener/process.
const server = http.createServer(app);
initSocketServer(server);

// Start the server
const PORT = process.env.PORT || 5050;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});