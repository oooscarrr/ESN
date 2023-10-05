import express from 'express';
import {
    validate_login_info,
    create_user,
    change_user_online_status,
    list_users,
    logout
} from '../controllers/userController.js';
import {authorization} from '../app.js';

const router = express.Router();

router.get('/:username/validation', validate_login_info);
router.post('', create_user);
// router.patch('/:userId/online', authorization, change_user_online_status);
// router.patch('/:userId/offline', authorization, change_user_online_status);
router.post('/logout', authorization, logout);
router.get('', authorization, list_users);


export default router;