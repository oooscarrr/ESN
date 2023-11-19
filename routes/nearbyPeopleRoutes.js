import express from 'express';
import { list_nearby_people } from '../controllers/nearbyPeopleController.js';
import authorization from '../middlewares/authorization.js';

const router = express.Router();

router.get('', authorization, list_nearby_people);


export default router;