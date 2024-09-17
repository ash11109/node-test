require('dotenv').config()

const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const PORT = process.env.PORT || 8080 ;

const app = express();
const server = http.createServer(app);

let devices = [];
let socketDeviceMap = {};

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST']
}));

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/home.html');
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


server.listen(PORT, () => {
    console.log('Server is listening on *:3000');
});