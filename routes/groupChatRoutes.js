import express from 'express';
import { create_new_group, 
        list_group_chat_room,
        list_group_chat_list,
        post_group_message,
        join_group,
        change_group_name,
        change_group_description,
        leave_group
    } from '../controllers/groupChatController.js';
import authorization from '../middlewares/authorization.js';

const router = express.Router();

router.use(authorization);

router.post('', create_new_group);
router.get('', list_group_chat_list);
router.get('/:groupId', list_group_chat_room);
router.post('/messages', post_group_message);
router.post('/join', join_group);
router.post('/name', change_group_name);
router.post('/description', change_group_description);
router.post('/leave', leave_group);

export default router;