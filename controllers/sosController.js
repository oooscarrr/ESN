import { User } from '../models/User.js';
import { io } from '../app.js';


export const sendSosAlert = async (req, res) => {
    try {
        const userId = req.userId;
        const fullMessage = req.body.message;
        // Fetch the user's connected SOS contacts 
        const user = await User.findById(userId).populate('sosContacts');
        const sosContacts = user.sosContacts;
        // console.log(`Sending SOS alert from user ID: ${userId}`);
        // console.log(`SOS message: ${fullMessage}`)
        // Broadcast SOS message to each connected contact
        sosContacts.forEach(async (contact) => {
            const contactUser = await User.findById(contact);
            console.log("Sending SOS alert to user:", contactUser.username);
            console.log(contactUser._id);
            console.log(contactUser._id.socketId);
            if (contactUser.socketId) {
                io.to(contactUser.socketId).emit('receiveSosAlert', { from: userId, message: fullMessage });
                console.log("SOS alert sent to user:", contactUser.username);
            }
        });
        res.status(200).send({ message: "SOS alert sent successfully." });
    } catch (error) {
        console.error('Error in sendSosAlert:', error);
        res.status(500).send({ message: "Error sending SOS alert." });
    }
};

export const updateSosMessage = async (req, res) => {
    try {
        const userId = req.userId;
        const sosMessage = req.body.sosMessage;
        await User.findByIdAndUpdate(userId, { sosMessage: sosMessage });
        res.status(200).send({ message: "SOS message updated successfully.", sosMessage: sosMessage });
    } catch (error) {
        res.status(500).send({ message: "Error updating SOS message." });
    }
};

export const sendSosRequest = async (req, res) => {
    try {
        const senderId = req.userId;
        const recipientId = req.body.userId;

        // Update sender and recipient's SOS lists
        await User.findByIdAndUpdate(senderId, { $addToSet: { sosRequestsSent: recipientId } });
        await User.findByIdAndUpdate(recipientId, { $addToSet: { sosRequestsReceived: senderId } });

        const recipient = await User.findById(recipientId);
        const sender = await User.findById(senderId);
        const recipientSocketId = recipient.socketId;
        console.log(sender.socketId, recipientSocketId);
        if (recipientSocketId) {
            // Emit a WebSocket event to the recipient
            console.log(`Emitting 'sosRequestReceived' event to ${recipientSocketId}`);
            io.to(recipientSocketId).emit('sosRequestReceived', {
                from: senderId,
                fromUsername: sender.username,
                action: 'received'
            });
        }
        res.status(200).send({ message: "SOS request sent successfully." });
    } catch (error) {
        res.status(500).send({ message: "Error sending SOS request." });
    }
};

export const acceptSosRequest = async (req, res) => {
    try {
        const senderId = req.userId;
        const recipientId = req.body.userId;

        const recipient = await User.findById(recipientId);
        const sender = await User.findById(senderId);

        // Update SOS contacts for both users
        await User.findByIdAndUpdate(senderId, {
            $addToSet: { sosContacts: recipientId, sosContactsNames: recipient.username },
            $pull: { sosRequestsReceived: recipientId }
        });
        await User.findByIdAndUpdate(recipientId, {
            $addToSet: { sosContacts: senderId, sosContactsNames: sender.username },
            $pull: { sosRequestsSent: senderId }
        });


        if (sender.socketId) {
            io.to(sender.socketId).emit('sosRequestFinished', {
                by: recipientId,
            });
        }
        if (recipient.socketId) {
            io.to(recipient.socketId).emit('sosRequestAcceptedRecipient', {
                byUsername: (await User.findById(senderId)).username
            });
        }
        if (sender.socketId) {
            io.to(sender.socketId).emit('sosRequestAcceptedSender', {
                byUsername: (await User.findById(recipientId)).username
            });
        }

        res.status(200).send({ message: "SOS request accepted." });
    } catch (error) {
        res.status(500).send({ message: "Error accepting SOS request." });
    }
};

export const rejectSosRequest = async (req, res) => {
    // try {
    const senderId = req.userId;
    const recipientId = req.body.userId;

    // Update sender and recipient's SOS lists
    // await User.findByIdAndUpdate(senderId, { $addToSet: { sosRequestsSent: recipientId } });
    // await User.findByIdAndUpdate(recipientId, { $addToSet: { sosRequestsReceived: senderId } });

    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);
    if (sender.socketId) {
        io.to(sender.socketId).emit('sosRequestFinished', {
            by: recipientId,
        });
    }
    if (recipient.socketId) {
        io.to(recipient.socketId).emit('sosRequestRejectedRecipient', {
            by: senderId,
            byUsername: (await User.findById(senderId)).username
        });
    }

    res.status(200).send({ message: "SOS request rejected." });
    // } catch (error) {
    //     res.status(500).send({ message: "Error rejecting SOS request." });
    // }
};


export const list_users = async (req, res) => {
    const all_users = await User.find().sort({ username: 1 });
    const currentUser = await User.findById(req.userId);

    const sosContactsInfo = [];
    for (const contactId of currentUser.sosContacts) {
        const contactInfo = await User.findById(contactId);
        sosContactsInfo.push(contactInfo.username);
    }

    let pendingUsers = []; // Users with pending requests
    let connectedUsers = []; // Connected SOS contacts
    let otherUsers = []; // Other users

    all_users.forEach(user => {
        if (currentUser.sosRequestsReceived.includes(user._id) || currentUser.sosRequestsSent.includes(user._id)) {
            pendingUsers.push(user);
        } else if (currentUser.sosContacts.includes(user._id)) {
            connectedUsers.push(user);
        } else {
            otherUsers.push(user);
        }
    });

    // Concatenate arrays in the desired order
    const sortedUsers = pendingUsers.concat(connectedUsers, otherUsers);

    res.render('sos/list', {
        users: sortedUsers,
        currentUserId: req.userId,
        sosRequestsReceived: currentUser.sosRequestsReceived,
        sosRequestsSent: currentUser.sosRequestsSent,
        sosContacts: currentUser.sosContacts,
        sosContactsNames: sosContactsInfo
    });
};




