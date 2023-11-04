import express from 'express';
import { list_private_messages, post_private_messages, cancel_alert } from '../controllers/privateMessageController.js';
import  authorization from '../middlewares/authorization.js';

const router = express.Router();

router.use(authorization);
router.get('/:userIdOne/:userIdTwo', list_private_messages);
router.post('', post_private_messages);
router.post('/cancelAlert', cancel_alert);

export default router;