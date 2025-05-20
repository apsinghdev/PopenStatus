// index.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

// Create express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow any origin for dev
  }
});

// Listen for socket connections
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('message', (msg) => {
    console.log('Message received:', msg);
    socket.emit('message', `Echo: ${msg}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start the server
server.listen(4000, () => {
  console.log('Socket.io server running on http://localhost:4000');
});
