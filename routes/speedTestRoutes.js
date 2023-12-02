import express from 'express';
import authorization from '../middlewares/authorization.js';
import {initialize_speed_test, interrupt_speed_test, render_index_page} from '../controllers/speedTestController.js';
import { PrivilegeLevel } from '../models/User.js';
import { requirePrivilege } from '../middlewares/requirePrivilege.js';

const router = express.Router();
router.use(authorization);
router.use(requirePrivilege(PrivilegeLevel.ADMINISTRATOR));
router.get('/', render_index_page);
router.patch('/start', initialize_speed_test);
router.patch('/stop', interrupt_speed_test);

export default router;
