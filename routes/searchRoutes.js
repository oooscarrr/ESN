import express from 'express';
import executeSearch from '../controllers/searchController.js';
import authorization from '../middlewares/authorization.js';

const router = express.Router();

router.use(authorization);
router.get('', executeSearch);

export default router;