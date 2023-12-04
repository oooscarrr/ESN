import { Server } from 'socket.io';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { User } from './models/User.js';
import { change_user_online_status } from './controllers/userController.js';

export default function setUpSocketIO(server) {
    const io = new Server(server);
    const onlineUsers = {};

    async function updateUserSocketId(userId, socketId) {
        try {
            await User.findByIdAndUpdate(userId, { socketId: socketId });
        } catch (error) {
            console.error('Error updating user socketId:', error);
        }
    }

    io.on('connection', socket => {
        console.log('IO Connected by', socket.id);
        const cookies = cookie.parse(socket.handshake.headers.cookie);
        const token = cookies.token;
        let userId;

        if (token) {
            try {
                const data = jwt.verify(token, process.env.JWT_SECRET_KEY);
                userId = data.id;
                if (!onlineUsers[userId]) {
                    onlineUsers[userId] = 1;
                    change_user_online_status(userId, true);
                } else {
                    onlineUsers[userId]++;
                }
            } catch {
                console.log('Invalid token');
                socket.disconnect();
            }
        }
        if (userId) {
            updateUserSocketId(userId, socket.id);
        }

        socket.on('disconnect', () => {
            console.log('IO Disconnected by', socket.id);
            if (userId) {
                onlineUsers[userId]--;
                if (onlineUsers[userId] === 0) {
                    setTimeout(() => {
                        if (userId && onlineUsers[userId] === 0) {
                            change_user_online_status(userId, false);
                            delete onlineUsers[userId];
                        }
                    }, 1000);
                }
            }
        });
    });

    return io;
}