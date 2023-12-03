import { User, bannedUsernamesSet } from '../models/User.js';
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
    const validationErrors = [];
    // TODO: This seems wrong (plain_password is always undefined and isActive is 'on' when choosing 'Inactive')
    console.log("VALIDATION DATA: ", username, "  ", privilege, "  ", isActive, "  ", plain_password);
    // Perform validation for username
    if (username) {
        const lower_case_username = username.toLowerCase();
        if (lower_case_username.length < 3) {
            validationErrors.push("Length of username should be at least 3");
        }
        if (bannedUsernamesSet.has(lower_case_username)) {
            validationErrors.push("Username is banned, try another one");
        }
        const user = await User.findByUsername(lower_case_username);
        if (user) {
            validationErrors.push("Username is already taken, try another one");
        }
    }
    // Perform validation for password
    if (plain_password) {
        if (plain_password.length < 4) {
            validationErrors.push("Length of password should be at least 4");
        }
    }
    // No validation needed for privilege and isActive
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