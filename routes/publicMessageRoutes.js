import express from 'express';
import {post_new_public_message, get_all_public_messages, list_public_messages} from '../controllers/publicMessageController.js';
import {authorization} from '../app.js';

const router = express.Router();

router.post('', authorization, post_new_public_message);
router.get('', authorization, list_public_messages);


export default router;