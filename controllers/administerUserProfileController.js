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

/**
 * Validates the changes made to the user profile.
 * @param req.params.userId - The id of the user whose profile is being edited.
 * @param req.body - The request body. Will be in the form of { username, privilege, isActive, plain_password }. Some fields may be undefined, representing no change made to that field.
 * @returns {Array} - An array of strings each representing an error message.
 */
export const validateUserProfileEdit = async (req, res) => {
    const { userId } = req.params;
    const { username, privilege, isActive, plain_password } = req.body;
    // TODO: perform actual validation (maybe in the model?)
    const validationErrors = [];
    return res.status(200).json(validationErrors);
}

/**
 * @param req.params.userId - The id of the user whose profile is being edited.
 * @param req.body - The request body. Will be in the form of { username, privilege, isActive, plain_password }. Some fields may be undefined, representing no change made to that field.   
 */
export const updateUserProfile = async (req, res) => {
    const { userId } = req.params;
    // TODO: perform validation again before saving
    await User.updateUserProfile({userId, ...req.body});
    return res.sendStatus(200);
}