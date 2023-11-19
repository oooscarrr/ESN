import express from 'express';
import {display_hazards} from '../controllers/editHazardController.js';
import authorization from '../middlewares/authorization.js';

const router = express.Router();

router.use(authorization);

//TODO:
router.get('', display_hazards);
// router.post('', post_new_announcement);

export default router;