import express from 'express';
import * as EventController from '../controllers/eventController';

const router = express.Router();

router.post('/', EventController.createVolunteerEvent);
router.patch('/:evnetId', EventController.updateVolunteerEvent);
router.delete('/:eventId', EventController.cancelVolunteerEvent);
router.get('/:eventId/participants', EventController.listEventParticipants);
router.post('/:eventId/pending-invitations', EventController.inviteUsersToEvent);
router.get('/:eventId/pending-invitations', EventController.listPendingInvitations);
router.get('/', EventController.listVolunteerEvents);
router.post('/:eventId/participants', EventController.joinVolunteerEvent);
router.delete('/:eventId/participants/:participantId', EventController.leaveVolunteerEvent);
router.post('/:eventId/accept-invitation', EventController.acceptInvitation);
router.post('/:eventId/decline-invitation', EventController.declineInvitation);

export default router;
