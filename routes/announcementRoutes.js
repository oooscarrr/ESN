import express from 'express';
import {post_new_announcement, list_announcements} from '../controllers/announcementController.js';
import authorization from '../middlewares/authorization.js';

const router = express.Router();

router.use(authorization);
router.post('', post_new_announcement);
router.get('', list_announcements);

export default router;