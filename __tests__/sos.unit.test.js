import request from 'supertest';
import { app } from '../app';
import { setupTestDatabase, closeTestDatabase } from '../test-setup';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';

describe('SOS Controller Tests', () => {
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
        jest.restoreAllMocks();
    });

    it('Should send an SOS alert successfully', async () => {
        const response = await request(app)
            .post('/users/sos/alert')
            .set('Cookie', [`token=${token}`])
            .send({ userId: user._id, message: 'Emergency!' });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('SOS alert sent successfully.');
    });


    it('Should update SOS message successfully', async () => {
        const newMessage = 'Updated SOS message';
        const response = await request(app)
            .post('/users/sos/updateMessage')
            .set('Cookie', [`token=${token}`])
            .send({ sosMessage: newMessage });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('SOS message updated successfully.');
        expect(response.body.sosMessage).toBe(newMessage);
    });

    
    it('Should send SOS request successfully', async () => {
        const recipient = await User.registerNewUser('recipientUser', 'testPassword123');
        const response = await request(app)
            .post('/users/sos/send')
            .set('Cookie', [`token=${token}`])
            .send({ userId: recipient._id });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('SOS request sent successfully.');
    });

    it('Should accept SOS request successfully', async () => {
        const sender = await User.registerNewUser('senderUser', 'testPassword123');
        await request(app)
            .post('/users/sos/send')
            .set('Cookie', [`token=${token}`])
            .send({ userId: sender._id });

        const response = await request(app)
            .post('/users/sos/accept')
            .set('Cookie', [`token=${token}`])
            .send({ userId: sender._id });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('SOS request accepted.');
    });

    it('Should reject SOS request successfully', async () => {
        const sender = await User.registerNewUser('senderUser', 'testPassword123');
        await request(app)
            .post('/users/sos/send')
            .set('Cookie', [`token=${token}`])
            .send({ userId: sender._id });

        const response = await request(app)
            .post('/users/sos/reject')
            .set('Cookie', [`token=${token}`])
            .send({ userId: sender._id });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('SOS request rejected.');
    });

    it('Should list users with pending requests', async () => {
        const sender = await User.registerNewUser('senderUser', 'testPassword123');
        await request(app)
            .post('/users/sos/send')
            .set('Cookie', [`token=${token}`])
            .send({ userId: sender._id });

        const response = await request(app)
            .get('/users/sos')
            .set('Cookie', [`token=${token}`]);

        expect(response.statusCode).toBe(200);
    });

    it('Should list connected SOS contacts', async () => {
        const recipient = await User.registerNewUser('recipientUser', 'testPassword123');
        await request(app)
            .post('/users/sos/send')
            .set('Cookie', [`token=${token}`])
            .send({ userId: recipient._id });

        const response = await request(app)
            .get('/users/sos')
            .set('Cookie', [`token=${token}`]);

        expect(response.statusCode).toBe(200);
    });

    it('Should list other users', async () => {
        const response = await request(app)
            .get('/users/sos')
            .set('Cookie', [`token=${token}`]);

        expect(response.statusCode).toBe(200);
    });

    it('Should update SOS message with an empty message', async () => {
        const emptyMessage = '';
        const response = await request(app)
            .post('/users/sos/updateMessage')
            .set('Cookie', [`token=${token}`])
            .send({ sosMessage: emptyMessage });
    
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('SOS message updated successfully.');
        expect(response.body.sosMessage).toBe(emptyMessage);
    });
    
    it('Should send an SOS alert with an empty message', async () => {
        const emptyMessage = '';
        const response = await request(app)
            .post('/users/sos/alert')
            .set('Cookie', [`token=${token}`])
            .send({ userId: user._id, message: emptyMessage });
    
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('SOS alert sent successfully.');
    });
    


});






