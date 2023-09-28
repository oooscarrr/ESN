import express from 'express';
const router = express.Router();
import bcrypt from 'bcrypt';
import { User, bannedUsernamesSet } from '../models/User.js';

/*
This function validates user login info and returns status code accordingly
- Url:
    /users/{username}/validation
- Input:
    username (str)
    password (str)
- Output:
    1. If username exists and password matches the user data in DB, return success code 1
    2. If username exists but password does not match the user data in DB, return error code 2
    3. If username does not exist and username does not meet the username rule, return error code 3
    4. If username does not exist and password does not meet the password rule, return error code 4
    5. If username does not exist and both username and password meet the rule, return success code 5
    6. If server error, return error code 6
*/
router.get('/:username/validation', async (req, res) => {
    try {
        // Username is not case sensitive
        const username = req.params.username.toLowerCase();
        const password = req.query.password;
        const user = await User.findByUsername(username);
        if (user) {
            // User exists and password is correct
            if (await bcrypt.compare(password, user.password)) {
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
        return res.send({ 'status': 'error', 'code': 6 });
    }
});

/*
This function creates a new user and stores user info into the DB
- Url:
    /users
- Input: 
    username (str)
    password (str)
- Output: 
    A HTTP status code
*/
router.post('', async (req, res) => {
    try {
        const username = req.body.username.toLowerCase();
        const password = req.body.password;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.registerNewUser(username, hashedPassword);
        res.sendStatus(201);
    }
    catch (error) {
        res.sendStatus(500);
        return console.log('createNewUser Error: ', error);
    }
    finally {
        console.log('User Saved')
    }
});

/*
This function changes the user's status to be online
- Url:
    /users/{username}/online
- Input:
    N/A
- Output: 
    A HTTP status code
*/
router.patch('/:username/online', async (req, res) => {
    try {
        const username = req.params.username.toLowerCase();
        const user = await User.findByUsername(username);
        if (user) {
            // TODO: change user's status to be online
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    }
    catch (error) {
        res.sendStatus(500);
        return console.log('Login Error: ', error);
    }
    finally {
        console.log('User Loged In')
    }
});


export default router;