import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import { PrivateMessage } from '../models/privateMessage';
import { setupTestDatabase, closeTestDatabase } from '../test-setup';
import jwt from 'jsonwebtoken';
import { Alert } from '../models/Alert';

describe('Private Chat Room functionality', () => {
    let userOne, userTwo, userOneToken;

    beforeAll(async () => {
        // Set up the test database
        await setupTestDatabase();

        // Create test users
        userOne = await User.registerNewUser('userOne', 'testPassword1');
        userTwo = await User.registerNewUser('userTwo', 'testPassword2');

        // Generate a JWT for userOne
        userOneToken = jwt.sign({ id: userOne._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '5m'
        });
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Alert.deleteMany({});
        await closeTestDatabase();
    });

    afterEach(async () => {
        await PrivateMessage.deleteMany({});
    });

    it('Should send and persist a private message', async () => {
        const response = await request(app)
            .post('/messages/private')
            .set('Cookie', [`token=${userOneToken}`]) // Send JWT as a cookie
            .send({
                receiverId: userTwo._id,
                content: 'Hello from userOne to userTwo!'
            });

        expect(response.status).toBe(201);
        const privateMessage = response.body.newPrivateMessage;
        expect(privateMessage.senderId).toBe(userOne._id.toString());
        expect(privateMessage.receiverId).toBe(userTwo._id.toString());
        expect(privateMessage.content).toBe('Hello from userOne to userTwo!');
    });

    it('Should fetch private messages between two users', async () => {
        // Create test messages
        await PrivateMessage.create({
            senderId: userOne._id,
            receiverId: userTwo._id,
            content: 'Hello from userOne to userTwo!'
        });
        await PrivateMessage.create({
            senderId: userTwo._id,
            receiverId: userOne._id,
            content: 'Hello from userTwo to userOne!'
        });

        const response = await request(app)
            .get(`/messages/private/${userOne._id}/${userTwo._id}`)
            .set('Cookie', [`token=${userOneToken}`]); // Send JWT as a cookie

        expect(response.status).toBe(200);
        expect(response.text).toContain('Hello from userOne to userTwo!');
        expect(response.text).toContain('Hello from userTwo to userOne!');
    });

    it('Should fetch no private messages between two users when none exist', async () => {
        // No messages created between userOne and userTwo
        const response = await request(app)
            .get(`/messages/private/${userOne._id}/${userTwo._id}`)
            .set('Cookie', [`token=${userOneToken}`]);

        expect(response.status).toBe(200);
    });

    // state-updating
    it('Should cancel an alert', async () => {
        const alert = new Alert({ senderId: userOne._id, receiverId: userTwo._id, alerted: true });
        await alert.save();

        const response = await request(app)
            .post('/messages/private/cancelAlert')
            .set('Cookie', [`token=${userOneToken}`])
            .send({
                senderId: userOne._id,
                receiverId: userTwo._id
            });

        expect(response.status).toBe(200);

        const updatedAlert = await Alert.findOne({ senderId: userOne._id, receiverId: userTwo._id });
        expect(updatedAlert.alerted).toBe(false);
    });
});
