const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);  // Use the server instance for both HTTP and WebSockets
const { Server } = require("socket.io");
const cors = require('cors');

let devices = []; 
let socketDeviceMap = {}; 

// Enable CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST']
}));

// Initialize Socket.IO on the same server instance
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/home.html');
});

// Handle Socket.IO connections
io.on('connection', (socket) => {
    console.log('A user connected with socket id:', socket.id);

    // Handle device events
    socket.on('device', (data) => {
        const { deviceId, deviceStatus } = data;
        
        socketDeviceMap[socket.id] = deviceId;

        const existingDeviceIndex = devices.findIndex(device => device.deviceId === deviceId);
        
        if (existingDeviceIndex !== -1) {
            if (devices[existingDeviceIndex].deviceStatus !== deviceStatus) {
                devices[existingDeviceIndex].deviceStatus = deviceStatus;
                console.log(`Updated device ID: ${deviceId} with status: ${deviceStatus}`);
            }
        } else {
            devices.push({ deviceId, deviceStatus });
            console.log(`Added new device ID: ${deviceId} with status: ${deviceStatus}`);
        }

        io.emit('update device list', devices);
    });

    // Handle disconnect events
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        const deviceId = socketDeviceMap[socket.id];
        if (deviceId) {
            devices = devices.filter(device => device.deviceId !== deviceId);
            delete socketDeviceMap[socket.id];
            console.log(`Removed device ID: ${deviceId} from devices list`);
            io.emit('update device list', devices);
        }
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});

module.exports = app;