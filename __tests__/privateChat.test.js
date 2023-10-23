import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import { PrivateMessage } from '../models/privateMessage';
import { setupTestDatabase, closeTestDatabase } from '../test-setup';
import jwt from 'jsonwebtoken';
import { Alert } from '../models/Alert';

describe('Private Chat Room functionality', () => {
    let sender, receiver, testMessage1, testMessage2;

    beforeAll(async () => {
        // Set up the test database
        await setupTestDatabase();

        // Create test users
        sender = await User.registerNewUser('testSender', 'testPassword123');
        receiver = await User.registerNewUser('testReceiver', 'testPassword123');

        // Create test messages
        testMessage1 = await PrivateMessage.create({
            senderId: sender._id.toString(),
            senderName: sender.username,
            receiverId: receiver._id.toString(),
            receiverName: receiver.username,
            content: 'Hello, this is a test message from sender to receiver!'
        });

        testMessage2 = await PrivateMessage.create({
            senderId: receiver._id.toString(),
            senderName: receiver.username,
            receiverId: sender._id.toString(),
            receiverName: sender.username,
            content: 'Hello, this is a test message from receiver to sender!'
        });
    });

    afterAll(async () => {
        await closeTestDatabase();
    });

    it('Should fetch private messages between two users', async () => {
        const userOne = await User.registerNewUser('userOne', 'testPassword1');
        const userTwo = await User.registerNewUser('userTwo', 'testPassword2');

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

        // Generate a JWT for userOne
        const userOneToken = jwt.sign({ id: userOne._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '1h'
        });

        const response = await request(app)
            .get(`/messages/private/${userOne._id}/${userTwo._id}`)
            .set('Cookie', [`token=${userOneToken}`]); // Send JWT as a cookie

        expect(response.status).toBe(200);
        expect(response.text).toContain('Hello from userOne to userTwo!');
        expect(response.text).toContain('Hello from userTwo to userOne!');
    });

    it('Should fetch no private messages between two users when none exist', async () => {
        const userOne = await User.registerNewUser('userOne', 'testPassword1');
        const userTwo = await User.registerNewUser('userTwo', 'testPassword2');

        // No messages created between userOne and userTwo

        // Generate a JWT for userOne
        const userOneToken = jwt.sign({ id: userOne._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '1h'
        });

        const response = await request(app)
            .get(`/messages/private/${userOne._id}/${userTwo._id}`)
            .set('Cookie', [`token=${userOneToken}`]);

        expect(response.status).toBe(200);
    });

    // state-updating
    it('Should cancel an alert', async () => {
        const sender = await User.registerNewUser('sender', 'testPassword1');
        const receiver = await User.registerNewUser('receiver', 'testPassword2');

        const alert = new Alert({ senderId: sender._id, receiverId: receiver._id, alerted: true });
        await alert.save();

        // Generate a JWT for sender
        const senderToken = jwt.sign({ id: sender._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '1h'
        });

        const response = await request(app)
            .post('/messages/private/cancelAlert')
            .set('Cookie', [`token=${senderToken}`])
            .send({
                senderId: sender._id,
                receiverId: receiver._id
            });

        expect(response.status).toBe(200);

        const updatedAlert = await Alert.findOne({ senderId: sender._id, receiverId: receiver._id });
        expect(updatedAlert.alerted).toBe(false);
    });
});
