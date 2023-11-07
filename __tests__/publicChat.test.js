import request from 'supertest';
import { app, io } from '../app';
import { PublicMessage } from '../models/publicMessage';
import { User } from '../models/User';
import { setupTestDatabase, closeTestDatabase } from '../test-setup';
import jwt from 'jsonwebtoken';

describe('Public messages functionality', () => {
    let user, token;

    beforeAll(async () => {
        await setupTestDatabase();
        user = await User.registerNewUser('testUser', 'testPassword123');
        token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '5m'
        });
    });

    afterAll(async () => {
        await User.deleteMany({});
        await closeTestDatabase();
    });

    afterEach(async () => {
        await PublicMessage.deleteMany({});
        jest.restoreAllMocks();
    });

    // Test 1: Successfully posting a new public message
    it('Should post a new public message', async () => {
        const response = await request(app)
            .post('/messages/public')
            .set('Cookie', [`token=${token}`])
            .send({ content: 'A new public message' });

        expect(response.statusCode).toBe(201);
        expect(response.body.newPublicMessage).toBeDefined();
        expect(response.body.newPublicMessage.content).toBe('A new public message');
    });

    // Test 2: Posting a message with an invalid token
    it('Should redirect to /joinCommunity when token is invalid', async () => {
        const response = await request(app)
            .post('/messages/public')
            .set('Authorization', 'Bearer invalidToken')
            .send({ content: 'A new public message' });

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/joinCommunity');
    });

    // Test 3: Posting a message without content
    it('Should not post a public message without content', async () => {
        const response = await request(app)
            .post('/messages/public')
            .set('Cookie', [`token=${token}`])
            .send({ content: '' });

        expect(response.statusCode).toBe(400);
    });


    it('Should emit a new public message event on message creation', async () => {
        //  mock for the socket.io emit 
        const emitSpy = jest.spyOn(io, 'emit');

        const response = await request(app)
            .post('/messages/public')
            .set('Cookie', [`token=${token}`])
            .send({ content: 'A new public message to emit' });

        expect(response.statusCode).toBe(201);
        expect(emitSpy).toHaveBeenCalledWith('newPublicMessage', expect.any(Object));
        expect(emitSpy).toHaveBeenCalledTimes(1);

        // Clean up the spy
        emitSpy.mockRestore();
    });

    // Test 5: Posting a new public message should include user status
    it('Should include user status when posting a new public message', async () => {
        const response = await request(app)
            .post('/messages/public')
            .set('Cookie', [`token=${token}`])
            .send({ content: 'Message with user status' });

        expect(response.statusCode).toBe(201);
        expect(response.body.newPublicMessage).toBeDefined();
        expect(response.body.newPublicMessage.userStatus).toBeDefined();
        expect(['undefined', 'ok', 'help', 'emergency']).toContain(response.body.newPublicMessage.userStatus);
    });

    // Test 6: Should handle errors when saving a new public message fails
    it('Should handle errors gracefully when message saving fails', async () => {
        // Mock the save method to simulate a failure
        const mockSave = jest.spyOn(PublicMessage.prototype, 'save');
        mockSave.mockImplementationOnce(() => Promise.reject(new Error('Database save failed')));

        const response = await request(app)
            .post('/messages/public')
            .set('Cookie', [`token=${token}`])
            .send({ content: 'This will not be saved' });

        // Expect a 500 Internal Server Error status code
        expect(response.statusCode).toBe(500);
        mockSave.mockRestore();
    });

    // Test 7: Should get all public messages
    it('Should render all public messages', async () => {
        await request(app)
            .post('/messages/public')
            .set('Cookie', [`token=${token}`])
            .send({ content: 'A new public message' });
        await request(app)
            .post('/messages/public')
            .set('Cookie', [`token=${token}`])
            .send({ content: 'Another public message' });
        const response = await request(app)
            .get('/messages/public')
            .set('Cookie', [`token=${token}`]);

        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('A new public message');
        expect(response.text).toContain('Another public message');
    });
});
