import bcrypt from 'bcrypt';
import {User, bannedUsernamesSet} from '../models/User.js';
import {Alert} from '../models/Alert.js';
import { io } from '../app.js';
import jwt from 'jsonwebtoken';

/*
This function validates user login info and returns status code accordingly
- Input:
    username (str)
    password (str)
- Output:
    1. If username exists and password matches the user data in DB, return success code 1 and userId
    2. If username exists but password does not match the user data in DB, return error code 2
    3. If username does not exist and username does not meet the username rule, return error code 3
    4. If username does not exist and password does not meet the password rule, return error code 4
    5. If username does not exist and both username and password meet the rule, return success code 5
    6. If server error, return error code 6
*/
export const validate_login_info = async (req, res) => {
    try {
        // Username is not case sensitive
        const username = req.params.username.toLowerCase();
        const password = req.query.password;
        const user = await User.findByUsername(username);
        // Login
        if (user) {
            // User exists and password is correct
            if (await bcrypt.compare(password, user.password)) {
                // console.log(req.cookie);
                const token = jwt.sign({
                    id: user._id.valueOf()
                }, process.env.JWT_SECRET_KEY); //the secret key to sign the token
                await change_user_online_status(user._id, true);
                return res
                    .cookie('token', token)
                    .send({'status': 'success', 'code': 1, 'userId': user._id.valueOf()});
                // User exists but password is incorrect
            } else {
                return res.send({'status': 'error', 'code': 2});
            }
        }
        //Register
        // User does not exist, create a new user
        // Username does not meet username rule
        if (username.length < 3 || bannedUsernamesSet.has(username)) {
            return res.send({'status': 'error', 'code': 3});
        }
        // Password does not meet password rule
        if (password.length < 4) {
            return res.send({'status': 'error', 'code': 4});
        }
        // Both username and password meet rules, return success code
        return res.send({'status': 'success', 'code': 5});
    } catch (error) {
        console.log(error);
        return res.send({'status': 'error', 'code': 6});
    }
}

/*
This function logs the user out and clears the cookie
- Input:
    N/A
- Output: 
    Redirect to home page on success or a HTTP status code on error
*/
export const logout = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        // await change_user_online_status(user, false);
        res.clearCookie('token');
        res.redirect('/');
    } catch (error) {
        res.sendStatus(500);
        return console.log('Logout Error:', error);
    }
};

/*
This function creates a new user and stores user info into the DB
- Input: 
    username (str)
    password (str)
- Output: 
    A HTTP status code
*/
export const create_user = async (req, res) => {
    try {
        const username = req.body.username.toLowerCase();
        const password = req.body.password;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.registerNewUser(username, hashedPassword);
        const user = await User.findByUsername(username);
        const token = jwt.sign({
                    id: user._id.valueOf()
                }, process.env.JWT_SECRET_KEY); //the secret key to sign the token
        await change_user_online_status(user._id, true);
        return res
            .cookie('token', token)
            .send({'userId': user._id.valueOf()});
    } catch (error) {
        res.sendStatus(500);
        return console.log('create_user Error: ', error);
    } finally {
        console.log('User Saved')
    }
}

/*
This function returns ??
- Input:
    N/A
- Output: 
    ??
*/
export const list_users = async (req, res) => {
    const all_users = await User.find().sort({isOnline: -1, username: 1});
    const all_alert_senders = await Alert.find({receiverId: req.userId, alerted: true}).select({senderId: 1, _id: 0});

    let senderId_array = []
    for (let i = 0; i < all_alert_senders.length; ++i) {
        const sender = all_alert_senders[i]
        senderId_array.push(sender.senderId);
    }

    res.render('users/list', {users: all_users, alertSenders: senderId_array, currentUserId: req.userId});
}

/*
This function changes the user's emergency status
- Input:
    userId (str)
    statusCode (int) - 0: undefined, 1: ok, 2: help, 3: emergency
- Output: 
    N/A
*/
export const change_last_status = async (req, res) => {
    try {
        const userId = req.userId;
        const statusCode = req.body.status;
        await User.changeUserLastStatus(userId, statusCode);
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
        return console.log('change_last_status Error:', error);
    }
}

/*
This function changes the user's online status
- Input:
    userId (str)
    onlineStatus (bool)
- Output: 
    N/A
*/
export const change_user_online_status = async (userId, onlineStatus) => {
    try {
        await User.changeUserOnlineStatus(userId, onlineStatus);
        io.emit('onlineStatusUpdate');
    } catch (error) {
        console.log('change_user_online_status Error:', error);
    }
}