import { User } from '../models/User.js';
import { io } from '../app.js';

export const displayUserSelectionPage = async (req, res) => {
    const allUsers = await User.find().sort({isActive: -1, isOnline: -1, username: 1});
    const activeUsers = allUsers.filter(user => user.isActive);
    const onlineUsers = activeUsers.filter(user => user.isOnline);
    const offlineUsers = activeUsers.filter(user => !user.isOnline);
    const inactiveUsers = allUsers.filter(user => !user.isActive);
    return res.render('userProfile/list', { onlineUsers, offlineUsers, inactiveUsers });
}

export const displayUserProfileEditPage = async (req, res) => {
    const { userId } = req.params;
    const userUnderEdit = await User.findById(userId);
    return res.render('userProfile/edit', { userUnderEdit });
}

export const validateUserProfileEdit = async (req, res) => {
    // TODO: maybe send html here instead of json?
    return res.status(200).json({ message: 'Success!' });
}

export const updateUserProfile = async (req, res) => {
    const { userId } = req;
    await User.updateUserProfile({userId, ...req.body});
}