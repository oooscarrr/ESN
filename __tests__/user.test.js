import request from 'supertest';
import { app } from '../app';
import { setupTestDatabase, closeTestDatabase } from '../test-setup';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';

describe('search functionality test cases', () => {
    let userOne, userOneToken;

    beforeAll(async () => {
        await setupTestDatabase();
        // Create test users
        userOne = await User.registerNewUser('userOne', 'testPassword1');
        // Generate a JWT for userOne
        userOneToken = jwt.sign({ id: userOne._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '5m'
        });
    });

    afterAll(async () => {
        await User.deleteMany({});
        await closeTestDatabase();
    });

    it('user test cases', async () => {
        const user1 = await request(app)
            .post('/users')
            .send({
                username: 'littleALICE',
                password: 'alice123'
            });
        expect(user1.status).toBe(200);

        ////////////////// Test cases for validate_login_info //////////////////
        const response1 = await request(app)
            .get('/users/littlealice/validation')
            .query({ password: 'alice123' });
        // console.log("TESTSSS: ", response1.body);
        expect(response1.body.status).toBe('success');
        expect(response1.body.code).toBe(1);

        const response2 = await request(app)
            .get('/users/littlealice/validation')
            .query({ password: 'wrong' });
        // console.log("TESTSSS2: ", response2.body);
        expect(response2.body.status).toBe('error');
        expect(response2.body.code).toBe(2);

        const response3 = await request(app)
            .get('/users/ye/validation')
            .query({ password: '12345' });
        // console.log("TESTSSS3: ", response3.body);
        expect(response3.body.status).toBe('error');
        expect(response3.body.code).toBe(3);

        const response4 = await request(app)
            .get('/users/videos/validation')
            .query({ password: '12345' });
        // console.log("TESTSSS4: ", response4.body);
        expect(response4.body.status).toBe('error');
        expect(response4.body.code).toBe(3);

        const response5 = await request(app)
            .get('/users/daniel/validation')
            .query({ password: '123' });
        // console.log("TESTSSS5: ", response5.body);
        expect(response5.body.status).toBe('error');
        expect(response5.body.code).toBe(4);

        const response6 = await request(app)
            .get('/users/daniel/validation')
            .query({ password: 'danielpassword' });
        console.log("TESTSSS6: ", response6.body);
        expect(response6.body.status).toBe('success');
        expect(response6.body.code).toBe(5);

        ////////////////// Test cases for log_out //////////////////
        await request(app)
            .post('/users/logout')
            .set('Cookie', [`token=${userOneToken}`]) // Send JWT as a cookie
        expect(response2.status).toBe(200);

        const status1 = await request(app)
            .post('/users/status')
            .set('Cookie', [`token=${userOneToken}`]) // Send JWT as a cookie
            .send({
                status: 1
            })
        expect(status1.status).toBe(200);
    });
});