import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import { setupTestDatabase, closeTestDatabase } from '../test-setup';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

describe('User Status functionality', () => {
    let user, token;

    beforeAll(async () => {
        // Set up the test database
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

    it('Should change user status to OK', async () => {
        const response = await request(app)
            .post('/users/status')
            .set('Cookie', [`token=${token}`])
            .send({ status: 1 }); // 1 corresponds to 'ok'

        expect(response.status).toBe(200);
    });

    it('Should change user status to Emergency', async () => {
        const response = await request(app)
            .post('/users/status')
            .set('Cookie', [`token=${token}`])
            .send({ status: 3 }); // 3 corresponds to 'emergency'

        expect(response.status).toBe(200);
    });

    // state updating
    it('Should persist user status in the database', async () => {
        await request(app)
            .post('/users/status')
            .set('Cookie', [`token=${token}`])
            .send({ status: 2 }); // 2 corresponds to 'help'

        const updatedUser = await User.findById(user._id);
        expect(updatedUser.lastStatus).toBe('help');
    });

    it('Should return an error when changing status of non-existent user', async () => {
        const nonExistentUserId = new mongoose.Types.ObjectId('000000000000000000000000');
        const fakeToken = jwt.sign({id: nonExistentUserId}, process.env.JWT_SECRET_KEY, {
            expiresIn: '1m'
        });
        const response = await request(app)
            .post(`/users/status`)
            .set('Cookie', [`token=${fakeToken}`])
            .send({ status: 1 }); 

        expect(response.status).toBe(500); // Not found
    });
});

