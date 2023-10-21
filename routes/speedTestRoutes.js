import express from 'express';
import ensure_logged_in from '../middlewares/ensureLoggedIn.js';
import {render_index_page} from '../controllers/speedTestController.js';
// import {initialize_speed_test, render_index_page} from '../controllers/speedTestController.js';

const router = express.Router();
router.use(ensure_logged_in);
router.get('/', render_index_page);
// router.patch('/start', initialize_speed_test);

export default router;
