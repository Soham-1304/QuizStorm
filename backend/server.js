require('dotenv').config();

const http = require('http');

const app = require('./src/app');
const connectDB = require('./src/config/db');
const initSocket = require('./src/config/socket');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`QuizStorm backend listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
