const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);  // Create HTTP server
const { Server } = require("socket.io");  // Import the Socket.IO Server
const cors = require('cors');

// CORS settings
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST']
}));

// Create Socket.IO server, with CORS allowed
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve home.html on the root path
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/home.html');
});

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('A user connected with socket id:', socket.id);

    // Handle 'device' event
    socket.on('device', (data) => {
        const { deviceId, deviceStatus } = data;
        
        console.log(`Received data: Device ID: ${deviceId}, Status: ${deviceStatus}`);
        // Handle device logic here
    });

    // Handle 'disconnect' event
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Use server.listen instead of app.listen
server.listen(3000, () => {
    console.log('Server is listening on *:3000');
});

module.exports = app;