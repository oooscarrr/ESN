import EventModel, * as Event from '../models/Event.js';
import {User} from '../models/User.js';

export const showCreationPage = (req, res) => {
    res.render('events/edit');
}

export const createVolunteerEvent = async (req, res) => {
    const {
        startDateTime,
        endDateTime,
        title,
        description
    } = req.body;
    if(
        !startDateTime ||
        !endDateTime ||
        !title ||
        !description
    ) {
        return res.status(400).json({ message: 'Please fill out all fields.' });
    }
    const organizer = req.userId;
    const participants = [req.userId];
    const pendingInvitations = [];
    const newEvent = new EventModel({
        startDateTime,
        endDateTime,
        title,
        description,
        organizer,
        participants,
        pendingInvitations
    });
    try {
        await newEvent.save();
        res.status(201).json({ redirect: `/events/${newEvent._id}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const showEventDetails = async (req, res) => {
    const { eventId } = req.params;
    try {
        const event = await EventModel.findById(eventId);
        res.render('events/details', { event: event });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const showEditPage = async (req, res) => {
    const { eventId } = req.params;
    try {
        const event = await EventModel.findById(eventId);
        res.render('events/edit', { event: event });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateVolunteerEvent = async (req, res) => {
    const { eventId } = req.params;
    const {
        startDateTime,
        endDateTime,
        title,
        description
    } = req.body;
    const updatedEvent = { _id: eventId, startDateTime, endDateTime, title, description };
    try {
        await EventModel.findByIdAndUpdate(eventId, updatedEvent, { new: true });
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const cancelVolunteerEvent = async (req, res) => {
    const { eventId } = req.params;
    try {
        await EventModel.findByIdAndUpdate(eventId, { canceled: true }, { new: true });
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const listEventParticipants = async (req, res) => {
    const { eventId } = req.params;
    try {
        const event = 
            await EventModel.findById(eventId)
            .populate({ path: 'participants', options: { sort: { 'username': 1 } } })
            .populate({ path: 'pendingInvitations', options: { sort: { 'username': 1 } } });
        const participants = event.participants;
        const pendingInvitations = event.pendingInvitations;
        const availableUsers = await User.find({ _id: { $nin: [...participants, ...pendingInvitations] } }).sort({ 'username': 1 });
        res.render('events/participants', { 
            event: event,
            participants: participants,
            availableUsers: availableUsers,
            pendingInvitations: pendingInvitations
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const inviteUsersToEvent = async (req, res) => {
    const { eventId } = req.params;
    let inviteeIds = req.body['inviteeIds[]'];
    if (!Array.isArray(inviteeIds)) {
        inviteeIds = [inviteeIds];
    }
    try {
        console.log('inviteeIds: ', inviteeIds);
        await Event.addPendingInvitations(eventId, inviteeIds);
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const listPendingInvitations = async (req, res) => {
    const { eventId } = req.params;
    try {
        const event = await EventModel.findById(eventId);
        const pendingInvitations = event.pendingInvitations;
        res.render('event/pendingInvitations', { pendingInvitations: pendingInvitations });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


async function findAvailableEvents(events, req){
    return events.filter((event) => {
        const notCanceled = !event.canceled;
        const notOrganizer = event.organizer !== req.userId;
        const notParticipant = !event.participants.includes(req.userId);
        const notInvited = !event.pendingInvitations.includes(req.userId);
        const startInFuture = event.startDateTime > Date.now();
        return notCanceled && notOrganizer && notParticipant && notInvited && startInFuture;
    });
}

async function findMyEvents(events, req){
    return events.filter((event) => {
        const isOrganizer = event.organizer === req.userId;
        const isParticipant = event.participants.includes(req.userId);
        return isOrganizer || isParticipant;
    });
}

async function findMyCanceledEvents(myEvents){
    return myEvents.filter((event) => {
        const isCanceled = event.canceled;
        return isCanceled;
    });
}

async function findMyActiveEvents(myEvents){
    return myEvents.filter((event) => {
        const isActive = !event.canceled;
        return isActive;
    });
}

async function filterPastEvents(myActiveEvents) {
    return myActiveEvents.filter((event) => {
        const isPast = event.endDateTime < Date.now();
        return isPast;
    });
}

async function filterUpcomingEvents(myActiveEvents) {
    return myActiveEvents.filter((event) => {
        const isUpcoming = event.endDateTime > Date.now();
        return isUpcoming;
    });
}

async function findMyPendingInvitations(events, userId) {
    return events.filter((event) => {
        const isInvited = event.pendingInvitations.includes(userId);
        const notCanceled = !event.canceled;
        return isInvited && notCanceled;
    });
}

export const listVolunteerEvents = async (req, res) => {
    try {
        const events = await EventModel.find();
        const availableEvents = await findAvailableEvents(events, req);
        const myEvents = await findMyEvents(events, req);
        const myCanceledEvents = await findMyCanceledEvents(myEvents);
        const myActiveEvents = await findMyActiveEvents(myEvents);
        const myPastEvents = await filterPastEvents(myActiveEvents);
        const myUpcomingEvents = await filterUpcomingEvents(myActiveEvents);
        const myPendingInvitations = await findMyPendingInvitations(events, req.userId);
        res.render('events/list', {
            myPendingInvitations,
            myPastEvents,
            myUpcomingEvents,
            myCanceledEvents,
            availableEvents,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const joinVolunteerEvent = async (req, res) => {
    const { eventId } = req.params;
    const userId = req.userId;
    try {
        await Event.addParticipant(eventId, userId);
        res.status(200).redirect(`/events/${eventId}`);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const leaveVolunteerEvent = async (req, res) => {
    const { eventId, participantId } = req.params;
    const userId = req.userId;
    if (userId !== participantId) {
        return res.status(403).json({ message: 'You can only leave events that you are a participant of.' });
    }
    try {
        await Event.removeParticipant(eventId, userId);
        return res.sendStatus(200)
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const acceptInvitation = async (req, res) => {
    const { eventId } = req.params;
    const userId = req.userId;
    try {
        await Event.acceptInvitation(eventId, userId);
        res.status(200).redirect(`/events/${eventId}`);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const declineInvitation = async (req, res) => {
    const { eventId } = req.params;
    const userId = req.userId;
    try {
        await Event.declineInvitation(eventId, userId);
        res.status(200).redirect(`/events/${eventId}`);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
