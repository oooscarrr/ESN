import express from 'express';
import { list_private_messages, post_private_messages, cancel_alert } from '../controllers/privateMessageController.js';
import { authorization } from '../app.js';

const router = express.Router();

router.get('/:userIdOne/:userIdTwo', authorization, list_private_messages);
router.post('', authorization, post_private_messages);
router.post('/cancelAlert', authorization, cancel_alert);

export default router;