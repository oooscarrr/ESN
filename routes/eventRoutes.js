import express from 'express';
import * as EventController from '../controllers/eventController.js';
import authorization from '../middlewares/authorization.js';

const router = express.Router();
router.use(authorization);

router.get('/create', EventController.showCreationPage);
router.post('/', EventController.createVolunteerEvent);
router.get('/:eventId', EventController.showEventDetails);
router.get('/:eventId/edit', EventController.showEditPage);
router.put('/:eventId', EventController.updateVolunteerEvent);
router.delete('/:eventId/participants/:participantId', EventController.leaveVolunteerEvent);
router.delete('/:eventId(\\d+)', EventController.cancelVolunteerEvent);
router.get('/:eventId/participants', EventController.listEventParticipants);
router.post('/:eventId/pending-invitations', EventController.inviteUsersToEvent);
router.get('/:eventId/pending-invitations', EventController.listPendingInvitations);
router.get('/', EventController.listVolunteerEvents);
router.post('/:eventId/participants', EventController.joinVolunteerEvent);
router.post('/:eventId/accept-invitation', EventController.acceptInvitation);
router.post('/:eventId/decline-invitation', EventController.declineInvitation);

export default router;
