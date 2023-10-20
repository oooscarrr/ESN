import { PrivateMessage } from '../models/privateMessage.js';
import { User } from '../models/User.js';
import { Alert } from '../models/Alert.js';
import { io } from '../app.js';
import jwt from 'jsonwebtoken';

export const list_private_messages = async (req, res) => {
    const userOne = req.params.userIdOne;
    const userTwo = req.params.userIdTwo;
    const privateMessages = await PrivateMessage.find({$or: [{senderId: userOne, receiverId: userTwo}, {senderId: userTwo, receiverId: userOne}]}).sort({createdAt: 1 });
    res.render('privateMessages/list', {privateMessages: privateMessages, currentUserId: req.userId});
}

export const post_private_messages = async (req, res) => {
    try {
        const senderId = req.userId;
        const receiverId = req.body.receiverId;
        const content = req.body.content;
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);
        // Alert
        const alert = await Alert.findOne({ senderId: senderId, receiverId: receiverId });
        if (alert) {
            alert.alerted = true;
            await alert.save();
        } else {
            const alert = new Alert({ senderId: senderId, receiverId: receiverId, alerted: true });
            await alert.save();
        }
        // PrivateMessage
        const privateMsg = new PrivateMessage({ senderId: senderId, senderName: sender.username, receiverId: receiverId, receiverName: receiver.username, content: content, senderStatus: sender.lastStatus });
        await privateMsg.save();
        io.emit('newPrivateMessage', privateMsg);
        res.status(201).send({ 'newPrivateMessage': privateMsg });
    }
    catch (error) {
        res.sendStatus(500);
        return console.log('post_private_message Error: ', error);
    }
}

export const cancel_alert = async (req, res) => {
    try {
        const senderId = req.body.senderId;
        const receiverId = req.body.receiverId;
        const alert = await Alert.findOne({senderId: senderId, receiverId: receiverId});
        if (alert) {
            alert.alerted = false;
            await alert.save();
        }
        res.sendStatus(200);
    }
    catch (error) {
        res.sendStatus(500);
        return console.log('cancel_alert Error: ', error);
    }
}