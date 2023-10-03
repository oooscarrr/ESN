import express from 'express';
const router = express.Router();
import { validate_login_info, create_user, change_user_online_status, list_users } from '../controllers/userController.js';

router.get('/:username/validation', validate_login_info);
router.post('', create_user);
router.patch('/:username/online', change_user_online_status);
router.patch('/:username/offline', change_user_online_status);
router.get('/', list_users);


export default router;