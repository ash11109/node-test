const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

let devices = []; 
let socketDeviceMap = {}; 

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('A user connected with socket id:', socket.id);

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


// const express = require("express");
// const app = express();

// app.get("/", (req, res) => res.send("server running"));

// app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = server;