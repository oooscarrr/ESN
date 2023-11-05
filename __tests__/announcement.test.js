import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import { Announcement } from '../models/Announcement';
import { setupTestDatabase, closeTestDatabase } from '../test-setup';
import jwt from 'jsonwebtoken';

describe('Announcement functionality', () => {
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
        await Announcement.deleteMany({});
    });

    it('Should persist an announcement with correct username and content', async () => {
        const response = await request(app)
            .post('/announcements')
            .set('Cookie', [`token=${token}`])
            .send({ content: 'This is a test announcement.' });

        expect(response.status).toBe(201);

        const announcement = response.body.newAnnouncement;
        expect(announcement.posterName).toBe(user.username);
        expect(announcement.content).toBe('This is a test announcement.');
    });

    it('Should return error when non-existent user posts an announcement', async () => {
        const nonExistentUserId = 'someNonExistentId';
        const fakeToken = jwt.sign({ id: nonExistentUserId }, process.env.JWT_SECRET_KEY, {
            expiresIn: '1m'
        });
        const response = await request(app)
            .post('/announcements')
            .set('Cookie', [`token=${fakeToken}`])
            .send({ content: 'This is a test announcement.' });

        expect(response.status).toBe(500);
    });

    it('Should fetch all announcements', async () => {
        await Announcement.create({
            posterName: user.username,
            content: 'Test announcement 1.'
        });
        await Announcement.create({
            posterName: user.username,
            content: 'Test announcement 2.'
        });
        const response = await request(app)
            .get('/announcements')
            .set('Cookie', [`token=${token}`]);

        expect(response.status).toBe(200);
        expect(response.text).toContain('Test announcement 1.');
        expect(response.text).toContain('Test announcement 2.');
    });
});