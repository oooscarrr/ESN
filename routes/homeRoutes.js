import express from 'express';
import jwt from 'jsonwebtoken';
import { change_user_online_status } from '../controllers/userController.js';

const router = express.Router();
router.get('/', function (req, res) {
    res.render('home');
});
  
router.get('/joinCommunity', async function (req, res) {
    const token = req.cookies.token;
    if (token) {
        try {
            const data = jwt.verify(token, process.env.JWT_SECRET_KEY);
            req.userId = data.id;
            await change_user_online_status(req.userId, true);
            return res.redirect('/users');
        } catch {
            return res.render('joinCommunity');
        }
    } else {
        res.render('joinCommunity');
    }
});

export default router;