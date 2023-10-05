import bcrypt from 'bcrypt';
import {User, bannedUsernamesSet} from '../models/User.js';
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
                }, "SecB3Rocks"); //the secret key to sign the token
                return res
                    .cookie("token", token, {maxAge: 1000 * 60 * 60 * 24, httpOnly: true})
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
        res.status(201).send({'userId': user._id.valueOf()});
    } catch (error) {
        res.sendStatus(500);
        return console.log('create_user Error: ', error);
    } finally {
        console.log('User Saved')
    }
}

/*
This function changes the user's online status to be true when
API url is "online" or false when API url is "offline"
- Input:
    N/A
- Output: 
    A HTTP status code
*/
export const change_user_online_status = async (req, res) => {
    const onlineStatus = req.url.split('/')[2];
    const isOnline = onlineStatus === 'online';
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (user) {
            await User.changeUserOnlineStatus(user, isOnline);
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        res.sendStatus(500);
        return console.log('change_user_online_status Error: ', error);
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
    res.render('users/list', {users: all_users});
}