import express from 'express';
import {post_new_public_message, list_public_messages} from '../controllers/publicMessageRoutingController.js';
import authorization from '../middlewares/authorization.js';

const router = express.Router();

router.use(authorization);
router.post('', post_new_public_message);
router.get('', list_public_messages);

export default router;