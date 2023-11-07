import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import { setupTestDatabase, closeTestDatabase } from '../test-setup';
import jwt from 'jsonwebtoken';

describe('Home functionality', () => {
    beforeAll(async () => {
        await setupTestDatabase();
    });

    afterAll(async () => {
        await User.deleteMany({});
        await closeTestDatabase();
    });

    it('Should render home page', async () => {
        const response = await request(app).get('/');

        expect(response.status).toBe(200);
        expect(response.text).toContain('Emergency Social Network');
    });

    it('Join community should redirect to ESN Directory when user is logged in', async () => {
        const user = await User.registerNewUser('testUser', 'testPassword123');
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '5m'
        });
        const response = await request(app)
            .get('/joinCommunity')
            .set('Cookie', [`token=${token}`]);

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/users');
    });

    it('Join community should render joinCommunity page when user is not logged in', async () => {
        const response = await request(app).get('/joinCommunity');

        expect(response.status).toBe(200);
        expect(response.text).toContain('Join Community');
        expect(response.text).toContain('Username');
        expect(response.text).toContain('Password');
    });
});