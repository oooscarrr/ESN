import express from 'express';
const router = express.Router();
import bcrypt from 'bcrypt';
import { User, bannedUsernamesSet } from '../models/User.js';

/*
This function validates user login info
- Input:
    username (str)
    password (str)
- Output:
    1. If username exists and password matches the user data in DB, return success code 1
    2. If username exists but password does not match the user data in DB, return error code 2
    3. If username does not exist and username does not meet the username rule, return error code 3
    4. If username does not exist and password does not meet the password rule, return error code 4
    5. If username does not exist and both username and password meet the rule, return success code 5
*/
router.get('/validateUserInfo', async function (req, res) {
    try {
        // Username is not case sensitive
        const username = req.query.username.toLowerCase();
        // TODO: encrypt password
        const password = req.query.password;
        const data = await User.findOne({ username: username });
        if (data) {
            // User exists and password is correct
            if (await bcrypt.compare(password, data.password)) {
                return res.send({ 'status': 'success', 'code': 1 });
                // User exists but password is incorrect
            } else {
                return res.send({ 'status': 'error', 'code': 2 });
            }
        }
        // User does not exist, create a new user
        // Username does not meet username rule
        if (username.length < 3 || bannedUsernamesSet.has(username)) {
            return res.send({ 'status': 'error', 'code': 3 });
        }
        // Password does not meet password rule
        if (password.length < 4) {
            return res.send({ 'status': 'error', 'code': 4 });
        }
        // Both username and password meet rules, return success code
        return res.send({ 'status': 'success', 'code': 5 });
    } catch (error) {
        console.log(error);
    }
});

/*
This function creates a new user and stores user info into the DB
- Input: 
    username (str)
    password (str)
- Output: 
    A HTTP status code
*/
router.post('/createNewUser', async (req, res) => {
    try {
        const username = req.body.username.toLowerCase();
        const password = req.body.password;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username: username, password: hashedPassword });
        const newUser = await user.save();
        res.sendStatus(200);
    }
    catch (error) {
        res.sendStatus(500);
        return console.log('createNewUser Error: ', error);
    }
    finally {
        console.log('User Saved')
    }
});

export default router;