import express from 'express';
const router = express.Router();
import { validate_login_info, create_user, log_user_in, list_users } from '../controllers/userController.js';

router.get('/:username/validation', validate_login_info);
router.post('', create_user);
router.patch('/:username/online', log_user_in);
router.get('/', list_users);


export default router;