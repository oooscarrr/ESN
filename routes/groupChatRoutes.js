import express from 'express';
import { create_new_group } from '../controllers/groupChatController.js';
import authorization from '../middlewares/authorization.js';

const router = express.Router();

router.use(authorization);
router.post('', create_new_group);

export default router;