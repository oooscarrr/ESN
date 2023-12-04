import express from 'express';
import {
    displayUserSelectionPage,
    displayUserProfileEditPage,
    validateUserProfileEdit,
    updateUserProfile
} from '../controllers/administerUserProfileController.js';
import authorization from '../middlewares/authorization.js';
import { requirePrivilege } from '../middlewares/requirePrivilege.js';
import { PrivilegeLevel } from '../models/User.js';

const router = express.Router();

router.use(authorization);
router.use(requirePrivilege(PrivilegeLevel.ADMINISTRATOR));
router.get('/users', displayUserSelectionPage);
router.get('/users/:userId', displayUserProfileEditPage);
router.post('/users/:userId/validate', validateUserProfileEdit);
router.patch('/users/:userId', updateUserProfile);

export default router;