import { PublicMessage } from '../models/publicMessage.js';
import { User } from '../models/User.js';
import { io } from '../app.js';

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

        // Validation for content presence
        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Content cannot be empty.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
}
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
        const msg = await PublicMessage.find().sort({ createdAt: 1 });
        return res.status(200).send(msg);
    }
    catch (error) {
        res.sendStatus(500);
        return console.log('get_all_public_messages Error: ', error);
    }
}

export const list_public_messages = async (req, res) => {
    const all_messages = await PublicMessage.find({}).sort({ createdAt: -1 }).limit(100).exec();
    all_messages.sort(function (a, b) {
        return a.createdAt - b.createdAt;
    });
    res.render('publicMessages/list', { messages: all_messages });
}