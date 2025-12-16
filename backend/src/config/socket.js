const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const registerGameSocket = require('../sockets/game.socket');

function initSocket(httpServer) {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [])
  ];

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket auth: expects token in handshake.auth.token
  io.use((socket, next) => {
    try {
      const token = socket.handshake?.auth?.token;
      if (!token) return next(new Error('Missing auth token'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
      };

      return next();
    } catch (err) {
      return next(new Error('Invalid auth token'));
    }
  });

  io.on('connection', (socket) => {
    registerGameSocket(io, socket);
  });

  return io;
}

module.exports = initSocket;
