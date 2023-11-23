import request from 'supertest';
import { app } from '../app';
import { setupTestDatabase, closeTestDatabase } from '../test-setup';
import { User } from '../models/User';
import EventModel from '../models/Event';
import jwt from 'jsonwebtoken';

const testEventDetails = [];

const randInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const generateRandomTestEventDetails = () => {
    const startDateTime = new Date();
    const endDateTime = new Date();
    endDateTime.setHours(startDateTime.getHours() + randInt(1, 10 ));
    const title = 'Test Event' + randInt(1, 100);
    const description = 'This is a test event.';
    const testEventDetail = {
        startDateTime,
        endDateTime,
        title,
        description
    };
    testEventDetails.push(testEventDetail);
    return testEventDetail;
}
    

describe('Event Management', () => {
    let organizer, organizerToken, participant, participantToken;

    beforeAll(async () => {
        await setupTestDatabase();
        // Create test users
        organizer = await User.registerNewUser('userOne', 'testPassword1');
        participant = await User.registerNewUser('userTwo', 'testPassword2');
        // Generate a JWT for userOne
        organizerToken = jwt.sign({ id: organizer._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '5m'
        });
        participantToken = jwt.sign({ id: participant._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '5m'
        });
    }, 30000);

    afterAll(async () => {
        await User.deleteMany({
            username: 'userOne'
        });
        await User.deleteMany({
            username: 'userTwo'
        });
        for (const testEventDetail of testEventDetails) {
            await EventModel.deleteMany({
                title: testEventDetail.title,
                description: testEventDetail.description,
                startDateTime: testEventDetail.startDateTime,
                endDateTime: testEventDetail.endDateTime
            });
        }
        await closeTestDatabase();
    });

    describe('Create Event', () => {
        it('should not let unauthenticated user create event', async () => {
            const eventDetails = generateRandomTestEventDetails();
            const response = await request(app)
                .post('/events')
                .send(eventDetails);
            expect(response.status).not.toBe(201);
        });

        it('should let authenticated user create event', async () => {
            const eventDetails = generateRandomTestEventDetails();
            const response = await request(app)
                .post('/events')
                .set('Cookie', [`token=${organizerToken}`])
                .send(eventDetails);
            expect(response.status).toBe(201);
        });

        it('should require all fields to be filled out', async () => {
            const response = await request(app)
                .post('/events')
                .set('Cookie', [`token=${organizerToken}`])
                .send({
                    startDateTime: '2024-04-30T18:00',
                    endDateTime: '2024-04-30T20:00',
                    title: 'Test Event'
                });
            expect(response.status).toBe(400);
        });

        it('should save provided event details to database', async () => {
            const eventDetails = generateRandomTestEventDetails();
            await request(app)
                .post('/events')
                .set('Cookie', [`token=${organizerToken}`])
                .send(eventDetails);
            const event = await EventModel.findOne(eventDetails);
            expect(event).not.toBeNull();
        });

        it('should add the organizer to the participants list', async () => {
            const eventDetails = generateRandomTestEventDetails();
            await request(app)
                .post('/events')
                .set('Cookie', [`token=${organizerToken}`])
                .send(eventDetails);
            const event = await EventModel.findOne(eventDetails);
            expect(event.participants).toContainEqual(organizer._id);
        });

        it('should not have any pending invitations initially', async () => {
            const eventDetails = generateRandomTestEventDetails();
            await request(app)
                .post('/events')
                .set('Cookie', [`token=${organizerToken}`])
                .send(eventDetails);
            const event = await EventModel.findOne(eventDetails);
            expect(event.pendingInvitations).toHaveLength(0);
        });

        it('should not have any participant other than the organizer initially', async () => {
            const eventDetails = generateRandomTestEventDetails();
            await request(app)
                .post('/events')
                .set('Cookie', [`token=${organizerToken}`])
                .send(eventDetails);
            const event = await EventModel.findOne(eventDetails);
            expect(event.participants).toHaveLength(1);
        });



    });

    describe('Participate in Event', () => {
        let eventDetails, event;
        beforeEach(async () => {
            eventDetails = generateRandomTestEventDetails();
            await request(app)
                .post('/events')
                .set('Cookie', [`token=${organizerToken}`])
                .send(eventDetails);
            event = await EventModel.findOne(eventDetails);
        });

        afterEach(async () => {
            await EventModel.deleteOne(eventDetails);
        });

        it('should not let unauthenticated user participate in event', async () => {
            const response = await request(app)
                .post(`/events/${event._id}/participants`)
            expect(response.status).not.toBe(200);
        });

        it('should let authenticated user participate in event', async () => {
            const response = await request(app)
                .post(`/events/${event._id}/participants`)
                .set('Cookie', [`token=${participantToken}`]);
            event = await EventModel.findById(event._id);
            expect(event.participants).toContainEqual(participant._id);
        });

        it('should let participant leave event', async () => {
            await request(app)
                .post(`/events/${event._id}/participants`)
                .set('Cookie', [`token=${participantToken}`]);
            const response = await request(app)
                .delete(`/events/${event._id}/participants/${participant._id}`)
                .set('Cookie', [`token=${participantToken}`]);
            event = await EventModel.findById(event._id);
            expect(event.participants).not.toContainEqual(participant._id);
        });

    })

    describe('Event Details Page', () => {
        let eventDetails, event;
        beforeEach(async () => {
            eventDetails = generateRandomTestEventDetails();
            await request(app)
                .post('/events')
                .set('Cookie', [`token=${organizerToken}`])
                .send(eventDetails);
            event = await EventModel.findOne(eventDetails);
        });

        afterEach(async () => {
            await EventModel.findOneAndDelete(eventDetails);
        });

        it('should show event details', async () => {
            const event = await EventModel.findOne(eventDetails);
            const response = await request(app)
                .get(`/events/${event._id}`)
                .set('Cookie', [`token=${organizerToken}`]);
            expect(response.text).toContain(event.title);
            expect(response.text).toContain(event.description);
        });

        it('should show join button if user is not a participant', async () => {
            const response = await request(app)
                .get(`/events/${event._id}`)
                .set('Cookie', [`token=${participantToken}`]);
            expect(response.text).toContain('Join');
        });

        it('should show leave button if user is a participant', async () => {
            await request(app)
                .post(`/events/${event._id}/participants`)
                .set('Cookie', [`token=${participantToken}`]);
            const response = await request(app)
                .get(`/events/${event._id}`)
                .set('Cookie', [`token=${participantToken}`]);
            expect(response.text).toContain('Leave');
        });

        it('should show edit button if user is the organizer', async () => {
            const response = await request(app)
                .get(`/events/${event._id}`)
                .set('Cookie', [`token=${organizerToken}`]);
            expect(response.text).toContain('Edit');
        });

        it('should not show edit button if user is not the organizer', async () => {
            const response = await request(app)
                .get(`/events/${event._id}`)
                .set('Cookie', [`token=${participantToken}`]);
            expect(response.text).not.toContain('Edit');
        });
    });

    describe('Event Participants Page', () => {
        let eventDetails, event;
        beforeEach(async () => {
            eventDetails = generateRandomTestEventDetails();
            await request(app)
                .post('/events')
                .set('Cookie', [`token=${organizerToken}`])
                .send(eventDetails);
            event = await EventModel.findOne(eventDetails);
        });

        afterEach(async () => {
            await EventModel.findOneAndDelete(eventDetails);
        });

        it('should show the organizer as event participant', async () => {
            const response = await request(app)
                .get(`/events/${event._id}/participants`)
                .set('Cookie', [`token=${organizerToken}`]);
            expect(response.text).toContain(organizer.username);
        });
    });
    
});