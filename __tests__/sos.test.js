import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import { setupTestDatabase, closeTestDatabase } from '../test-setup';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

describe('SOS Controller Tests', () => {
    let user, token;

    beforeAll(async () => {
        await setupTestDatabase();
        // Create a test user and generate a token
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
    it('Should fail to send SOS alert with invalid token', async () => {
        const response = await request(app)
            .post('/users/sos/alert')
            .set('Cookie', 'Bearer invalidToken')
            .send({ userId: user._id, message: 'Emergency!' })
        expect(response.statusCode).toBe(302); // Expect a redirection
        expect(response.headers.location).toBe('/joinCommunity');
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

    it('Should fail to update SOS message without token', async () => {
        const response = await request(app)
            .post('/users/sos/updateMessage')
            .send({ sosMessage: 'New message' });
        expect(response.statusCode).toBe(302); 
        expect(response.headers.location).toBe('/joinCommunity');


    });

    it('Should send an SOS request successfully', async () => {
        // Create a recipient user
        const recipient = await User.registerNewUser('recipientUser', 'recipientPassword123');
        const recipientToken = jwt.sign({ id: recipient._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5m' });
    
        // Send SOS request
        const response = await request(app)
            .post('/users/sos/send')
            .set('Cookie', [`token=${token}`])
            .send({ userId: recipient._id });
    
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('SOS request sent successfully.');
    });

    it('Should accept an SOS request successfully', async () => {
        const response = await request(app)
            .post('/users/sos/accept')
            .set('Cookie', [`token=${token}`])
            .send({ userId: user._id }); 
    
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('SOS request accepted.');
    });
    
    
});