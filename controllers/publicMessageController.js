import { PublicMessage } from '../models/publicMessage.js';
import { User } from '../models/User.js';
import { io, tokenKey } from '../app.js';
import jwt from 'jsonwebtoken'

/*
This function posts a message on public wall from an user and emits a socket message
- Input:
    userId (str)
    content (str)
- Output:
    status code
*/
export const post_new_public_message = async (req, res) => {
    try {
        const userId = req.userId;
        const content = req.body.content;
        const user = await User.findById(userId);
        const publicMsg = new PublicMessage({ senderName: user.username, content: content, userStatus: user.lastStatus });
        io.emit('newPublicMessage', publicMsg);
        await publicMsg.save();
        res.status(201).send({ 'newPublicMessage': publicMsg });
    }
    catch (error) {
        res.sendStatus(500);
        return console.log('post_new_message Error: ', error);
    }
}

/*
This function retrieves all public messages in ascending order ranked by time posted
- Input:
    N/A
- Output:
    An array of public messages
*/
export const get_all_public_messages = async (req, res) => {
    try {
        const msg = await PublicMessage.find().sort({createdAt: 1});
        return res.status(200).send(msg);
    }
    catch (error) {
        res.sendStatus(500);
        return console.log('get_all_public_messages Error: ', error);
    }
}