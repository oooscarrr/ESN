import express from 'express';
import {post_new_public_message, list_public_messages} from '../controllers/publicMessageRoutingController.js';
import {authorization} from '../app.js';

const router = express.Router();

router.post('', authorization, post_new_public_message);
router.get('', authorization, list_public_messages);


export default router;