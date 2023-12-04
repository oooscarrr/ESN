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
 * A list of functions checking user input validity
 */
function username_len_invalid(username) {
    if (username.length < 3) {
        return true;
    }
    return false;
}

function username_banned(username) {
    if (bannedUsernamesSet.has(username)) {
        return true;
    }
    return false;
}

async function username_exists(username) {
    const user = await User.findByUsername(username);
    if (user) {
        return true;
    }
    return false;
}

function password_len_invalid(password) {
    if (password.length < 4) {
        return true;
    }
    return false;
}

/**
 * Validates the changes made to the user profile.
 * @param req.params.userId - The id of the user whose profile is being edited.
 * @param req.body - The request body. Will be in the form of { username, privilege, isActive, password }. Some fields may be undefined, representing no change made to that field.
 * @returns {Array} - An array of strings each representing an error message.
 */
export const validateUserProfileEdit = async (req, res) => {
    const { username, privilege, isActive, password } = req.body;
    const validationErrors = [];
    console.log("VALIDATION DATA: ", username, "  ", privilege, "  ", isActive, "  ", password);
    // Perform validation for username
    if (username) {
        const lower_case_username = username.toLowerCase();
        if (username_len_invalid(lower_case_username)) {
            validationErrors.push("Length of username should be at least 3");
        }
        if (username_banned(lower_case_username)) {
            validationErrors.push("Username is banned, try another one");
        }
        if (await username_exists(lower_case_username)) {
            validationErrors.push("Username is already taken, try another one");
        }
    }
    // Perform validation for password
    if (password) {
        if (password_len_invalid(password)) {
            validationErrors.push("Length of password should be at least 4");
        }
    }
    // No validation needed for privilege and isActive
    return res.status(200).json(validationErrors);
}

/**
 * @param req.params.userId - The id of the user whose profile is being edited.
 * @param req.body - The request body. Will be in the form of { username, privilege, isActive, password }. Some fields may be undefined, representing no change made to that field.   
 */
export const updateUserProfile = async (req, res) => {
    const { userId } = req.params;
    const { username, privilege, isActive, password } = req.body;
    // Perform validation again before saving
    if (username) {
        const lower_case_username = username.toLowerCase();
        if (username_len_invalid(lower_case_username) || username_banned(lower_case_username) || await username_exists(lower_case_username)) {
            return res.status(400).send('Invalid username');
        }
    }
    if (password) {
        if (password_len_invalid(password)) {
            return res.status(400).send('Invalid password');
        }
    }
    // Update DB
    await User.updateUserProfile({userId, ...req.body});
    if (isActive === 'false') {
        io.emit("inactive", userId);
    }
    return res.sendStatus(200);
}