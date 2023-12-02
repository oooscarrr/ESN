import mongoose from 'mongoose';

// DB Schema
const EventSchema = new mongoose.Schema(
    {
        title: String,
        description: String,
        startDateTime: Date,
        endDateTime: Date,
        organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        pendingInvitations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        canceled: { type: Boolean, default: false },
    },
);

// Model
const Event = mongoose.model('Event', EventSchema);
export default Event;

// DB Functions
export const addPendingInvitations = async (eventId, inviteeIds) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            eventId, 
            {$addToSet: {pendingInvitations: {$each: inviteeIds}}},
            {new: true}
        );
        return updatedEvent;
    }
    catch (error) {
        console.log('addPendingInvitation Error: ', error);
        throw error;
    }
}

export const addParticipant = async (eventId, participantId) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            eventId, 
            {
                $addToSet: {participants: participantId},
                $pull: {pendingInvitations: participantId}
            },
            {new: true}
        );
        return updatedEvent;
    } catch (error) {
        console.log('addParticipant Error: ', error);
        throw error;
    }
}

export const removePendingInvitation = async (eventId, inviteeId) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            {$pull: {pendingInvitations: inviteeId}},
            {new: true}
        );
        return updatedEvent;
    }
    catch (error) {
        console.log('removePendingInvitation Error: ', error);
        throw error;
    }
}

export const removeParticipant = async (eventId, participantId) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            {$pull: {participants: participantId}},
            {new: true}
        );
        return updatedEvent;
    } catch (error) {
        console.log('removeParticipant Error: ', error);
        throw error;
    }
}


export const acceptInvitation = async (eventId, userId) => {
    await removePendingInvitation(eventId, userId);
    await addParticipant(eventId, userId);
}

export const declineInvitation = async (eventId, userId) => {
    await removePendingInvitation(eventId, userId);
}
