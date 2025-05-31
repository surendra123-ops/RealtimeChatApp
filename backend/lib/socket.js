const { Server } = require('socket.io'); // Fixed incorrect import
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"], // Specify allowed origins
    },
});

// Used to store online users { userId: socketId }
const userSocketMap = {};

// Function to get a receiver's socket ID
function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

// Listen for connection events
io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    const userId = socket.handshake.query.userId; //refer frontend authstore
    if (userId) {
        userSocketMap[userId] = socket.id; // Map userId to socketId
    }

    // Emit online users list to all connected clients
    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    // Listen for disconnect events
    socket.on('disconnect', () => {
        console.log('A user disconnected', socket.id);

        // Remove user from the userSocketMap
        if (userId) {
            delete userSocketMap[userId];
        }

        // Emit updated online users list
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
});

// Export the `io`, `app`, and `server` objects
module.exports = { io, app, server, getReceiverSocketId };
 