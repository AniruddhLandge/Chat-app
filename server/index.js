const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Store connected users
const users = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user joining
  socket.on('join', (username) => {
    users.set(socket.id, username);
    io.emit('userList', Array.from(users.values()));
    io.emit('message', {
      user: 'System',
      text: `${username} has joined the chat`,
      time: new Date().toLocaleTimeString()
    });
  });

  // Handle incoming messages
  socket.on('chatMessage', (msg) => {
    const username = users.get(socket.id);
    io.emit('message', {
      user: username,
      text: msg,
      time: new Date().toLocaleTimeString()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    if (username) {
      users.delete(socket.id);
      io.emit('userList', Array.from(users.values()));
      io.emit('message', {
        user: 'System',
        text: `${username} has left the chat`,
        time: new Date().toLocaleTimeString()
      });
    }
  });
});

server.listen(3001, () => {
  console.log('Server running on port 3001');
});