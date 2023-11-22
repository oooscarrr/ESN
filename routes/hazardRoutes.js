import express from 'express';
import {display_hazards, add_hazard, delete_hazard, get_hazard_byID} from '../controllers/editHazardController.js';
import authorization from '../middlewares/authorization.js';

const router = express.Router();

router.use(authorization);

//TODO:
router.get('', display_hazards);
router.post('/report', add_hazard);
router.delete('/delete/:id', delete_hazard);
router.get('/:id', get_hazard_byID);

export default router;