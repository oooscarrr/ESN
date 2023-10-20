import express from 'express';
import { list_private_messages, post_private_messages } from '../controllers/privateMessageController.js';
import { authorization } from '../app.js';

const router = express.Router();

router.get('/:userIdOne/:userIdTwo', authorization, list_private_messages);
router.post('', authorization, post_private_messages);

export default router;