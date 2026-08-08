/**
 * Socket.io / WebSocket Server Configuration
 */
const handleTrackingSockets = require('../sockets/tracking');

/**
 * Initialize WebSocket / Socket.io server and register socket modules
 * @param {Object} server HTTP Server Instance
 */
function initSocketServer(server) {
  let io;

  try {
    // Attempt to load Socket.io if installed
    const { Server } = require('socket.io');
    io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      handleTrackingSockets(socket, io);
    });

    console.log('[SocketConfig] Socket.io server initialized successfully');
  } catch (e) {
    // Fallback to native ws package
    const WebSocket = require('ws');
    const wss = new WebSocket.Server({ server, path: '/ws/tracking' });

    wss.on('connection', (ws) => {
      handleTrackingSockets(ws, wss);
    });

    console.log('[SocketConfig] Native WebSocket server initialized at /ws/tracking');
    io = wss;
  }

  return io;
}

module.exports = initSocketServer;
