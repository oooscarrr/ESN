import { Server } from 'socket.io';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { User } from './models/User.js';
import { change_user_online_status } from './controllers/userController.js';

async function updateUserSocketId(userId, socketId) {
    try {
        await User.findByIdAndUpdate(userId, { socketId: socketId });
    } catch (error) {
        console.error('Error updating user socketId:', error);
    }
}

function parseToken(socket) {
    const cookies = cookie.parse(socket.handshake.headers.cookie);
    return cookies.token;
}

function authenticateToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch {
        return null;
    }
}

function handleDisconnection(userId, onlineUsers, socket) {
    console.log('IO Disconnected by', socket.id);
    onlineUsers[userId]--;
    if (onlineUsers[userId] === 0) {
        setTimeout(() => {
            if (onlineUsers[userId] === 0) {
                change_user_online_status(userId, false);
                delete onlineUsers[userId];
            }
        }, 1000);
    }
}

export default function setUpSocketIO(server) {
    const io = new Server(server);
    const onlineUsers = {};

    io.on('connection', socket => {
        console.log('IO Connected by', socket.id);
        const token = parseToken(socket);
        const data = authenticateToken(token);
        const userId = data ? data.id : null;

        if (!userId) {
            console.log('Invalid token');
            socket.disconnect();
            return;
        }

        if (!onlineUsers[userId]) {
            onlineUsers[userId] = 1;
            change_user_online_status(userId, true);
        } else {
            onlineUsers[userId]++;
        }

        updateUserSocketId(userId, socket.id);

        socket.on('disconnect', () => handleDisconnection(userId, onlineUsers, socket));
    });

    return io;
}