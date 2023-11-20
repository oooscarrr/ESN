import { User } from '../models/User.js';
import { io } from '../app.js';



export const sendSosAlert = async (req, res) => {
    try {
        const userId = req.userId; // The ID of the user sending the SOS
        const sosMessage = req.body.sosMessage; // The SOS message

        // Fetch the user's connected SOS contacts from the database
        const user = await User.findById(userId).populate('sosContacts');
        const sosContacts = user.sosContacts;

                // Debugging: Log user information
                console.log(`Sending SOS alert from user ID: ${userId}`);
                console.log(`SOS message: ${sosMessage}`);

        // Broadcast the SOS message to each connected contact
        sosContacts.forEach(async (contact) => {
            const contactUser = await User.findById(contact);
            console.log("Sending SOS alert to user:", contactUser.username);
            console.log(contactUser._id);
            console.log(contactUser._id.socketId);
            console.log('momoda', contactUser)
            if (contactUser.socketId) {
                io.to(contactUser.socketId).emit('receiveSosAlert', { from: userId, message: sosMessage });
                console.log("Momoda SOS alert sent to user:", contactUser.username);
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
        const userId = req.userId; // Assuming the user ID is stored in req.userId
        console.log(req.body);
        const sosMessage = req.body.sosMessage;

        await User.findByIdAndUpdate(userId, { sosMessage: sosMessage });
        console.log('momoda', sosMessage);
        res.status(200).send({ message: "SOS message updated successfully.", sosMessage: sosMessage});
    } catch (error) {
        console.error('Error in updateSosMessage:', error);
        res.status(500).send({ message: "Error updating SOS message." });
    }
};


// Send SOS request

export const sendSosRequest = async (req, res) => {
    try {
        const senderId = req.userId;
        const recipientId = req.body.userId;

        // Update sender and recipient's SOS lists
        await User.findByIdAndUpdate(senderId, { $addToSet: { sosRequestsSent: recipientId } });
        await User.findByIdAndUpdate(recipientId, { $addToSet: { sosRequestsReceived: senderId } });

        res.status(200).send({ message: "SOS request sent successfully." });
    } catch (error) {
        res.status(500).send({ message: "Error sending SOS request." });
    }
};

// Accept SOS request
export const acceptSosRequest = async (req, res) => {
    try {
        const userId = req.userId;
        const requesterId = req.body.userId;

        // Update SOS contacts for both users
        await User.findByIdAndUpdate(userId, { 
            $addToSet: { sosContacts: requesterId },
            $pull: { sosRequestsReceived: requesterId }
        });
        await User.findByIdAndUpdate(requesterId, { 
            $addToSet: { sosContacts: userId },
            $pull: { sosRequestsSent: userId }
        });

        res.status(200).send({ message: "SOS request accepted." });
    } catch (error) {
        res.status(500).send({ message: "Error accepting SOS request." });
    }
};

// Reject SOS request
export const rejectSosRequest = async (req, res) => {
    try {
        const userId = req.userId;
        const requesterId = req.body.userId;

        // Update SOS request lists for both users
        await User.findByIdAndUpdate(userId, { $pull: { sosRequestsReceived: requesterId } });
        await User.findByIdAndUpdate(requesterId, { $pull: { sosRequestsSent: userId } });

        res.status(200).send({ message: "SOS request rejected." });
    } catch (error) {
        res.status(500).send({ message: "Error rejecting SOS request." });
    }
};

// List users for SOS page
export const list_users = async (req, res) => {
    const all_users = await User.find().sort({ isOnline: -1, username: 1 });


    const currentUser = await User.findById(req.userId);

    console.log("Current User:", currentUser);

    // Log the detailed contents of the arrays
    console.log("SOS Requests Received (detailed):", JSON.stringify(currentUser.sosRequestsReceived, null, 2));
    console.log("SOS Requests Sent (detailed):", JSON.stringify(currentUser.sosRequestsSent, null, 2));

    res.render('sos/list', {
        users: all_users, 
        currentUserId: req.userId,
        sosRequestsReceived: currentUser.sosRequestsReceived,
        sosRequestsSent: currentUser.sosRequestsSent,
        sosContacts: currentUser.sosContacts
    });

    console.log("Data sent to frontend:", {
        users: all_users,
        currentUserId: req.userId,
        sosRequestsReceived: currentUser.sosRequestsReceived,
        sosRequestsSent: currentUser.sosRequestsSent,
        sosContacts: currentUser.sosContacts
    }); 
};




