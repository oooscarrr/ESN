import { PrivateMessage } from '../models/privateMessage.js';
import { io } from '../app.js';
import jwt from 'jsonwebtoken';

export const list_private_messages = async (req, res) => {
    const userOne = req.params.userIdOne;
    const userTwo = req.params.userIdTwo;
    const privateMessages = await PrivateMessage.find({$or: [{senderId: userOne, receiverId: userTwo}, {senderId: userTwo, receiverId: userOne}]}).sort({createdAt: 1 });
    res.render('privateMessages/list', {privateMessages: privateMessages, currentUserId: req.userId});
}

