import express from 'express';
const router = express.Router();
import { post_new_public_message, get_all_public_messages } from '../controllers/publicMessageController.js';

router.post('', post_new_public_message);
router.get('', get_all_public_messages);


export default router;