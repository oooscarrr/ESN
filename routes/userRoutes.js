import express from 'express';

const router = express.Router();
import {
    validate_login_info,
    create_user,
    change_user_online_status,
    list_users
} from '../controllers/userController.js';
import {authorization} from '../app.js';

router.get('/:username/validation', validate_login_info);
router.post('', create_user);
router.patch('/:userId/online', authorization, change_user_online_status);
router.patch('/:userId/offline', authorization, change_user_online_status);
router.get('', authorization, list_users);


export default router;