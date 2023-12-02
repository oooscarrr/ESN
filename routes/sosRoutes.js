import express from 'express';
import { sendSosRequest, acceptSosRequest, rejectSosRequest, list_users, updateSosMessage, sendSosAlert } from '../controllers/sosController.js';
import authorization from '../middlewares/authorization.js';

const router = express.Router();

router.use(authorization);

// router.get('/', (req, res) => {
//     console.log('SOS route accessed'); // Console log for debugging
//     res.send('SOS Page is working');   // Simplified response for testing
// });
router.post('/updateMessage', updateSosMessage);
router.post('/alert', sendSosAlert);
router.get('/', list_users);
// Send SOS request
router.post('/send', sendSosRequest);

// Accept SOS request
router.post('/accept', acceptSosRequest);

// Reject SOS request
router.post('/reject', rejectSosRequest);

export default router;
