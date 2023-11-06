import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import { setupTestDatabase, closeTestDatabase } from '../test-setup';
import jwt from 'jsonwebtoken';

describe('User Status functionality', () => {
    beforeAll(async () => {
        // Set up the test database
        await setupTestDatabase();
    });

    afterAll(async () => {
        await closeTestDatabase();
    });

    let user, token;

    beforeEach(async () => {
        user = await User.registerNewUser('testUser', 'testPassword123');
        token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '1h'
        });
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

    it('Should return an error when fetching status of non-existent user', async () => {
        const nonExistentUserId = 'someNonExistentId';
        const response = await request(app)
            .get(`/users/${nonExistentUserId}/status`)
            .set('Cookie', [`token=${token}`]);

        expect(response.status).toBe(404); // Not found
    });
});

