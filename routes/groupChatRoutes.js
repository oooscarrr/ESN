import express from 'express';
import { create_new_group, 
        list_group_chat,
        post_group_message
    } from '../controllers/groupChatController.js';
import authorization from '../middlewares/authorization.js';

const router = express.Router();

router.use(authorization);
router.post('', create_new_group);
router.get('/:groupId', list_group_chat);
router.post('/messages', post_group_message);

export default router;