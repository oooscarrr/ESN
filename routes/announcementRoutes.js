import express from 'express';
import {post_new_announcement, list_announcements} from '../controllers/announcementController.js';
import authorization from '../middlewares/authorization.js';
import { PrivilegeLevel } from '../models/User.js';
import { requirePrivilege } from '../middlewares/requirePrivilege.js';

const router = express.Router();

router.use(authorization);
router.post('', requirePrivilege(PrivilegeLevel.COORDINATOR), post_new_announcement);
router.get('', list_announcements);

export default router;