import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import { Alert } from '../models/Alert';
import { Announcement } from '../models/Announcement';
import { PrivateMessage } from '../models/privateMessage';
import { PublicMessage } from '../models/publicMessage';
import { setupTestDatabase, closeTestDatabase } from '../test-setup';
import executeSearch from '../controllers/searchController.js';
import { filterStopWords } from '../controllers/searchFactories/AbstractSearchFactory.js';
import AnnouncementSearchFactory from "../controllers/searchFactories/AnnouncementSearchFactory.js";
import CitizenSearchFactory from "../controllers/searchFactories/CitizenSearchFactory.js";
import PrivateMessageSearchFactory from "../controllers/searchFactories/PrivateMessageSearchFactory.js";
import PublicMessageSearchFactory from "../controllers/searchFactories/PublicMessageSearchFactory.js";
import jwt from 'jsonwebtoken';


describe('search functionality test cases', () => {
    let Alice, Daniel, littleDaniel, Nope, AliceToken, DanielToken, littleDanielToken, NopeToken;

    beforeAll(async () => {
        await setupTestDatabase();
    });

    afterAll(async () => {
        await User.deleteMany({});
        await closeTestDatabase();
    });

    beforeEach(async () => {
        Alice = await User.registerNewUser('Alice', 'Alice123');
        AliceToken = jwt.sign({ id: Alice._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '5m'
        });

        Daniel = await User.registerNewUser('Daniel', 'Alice123');
        DanielToken = jwt.sign({ id: Daniel._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '5m'
        });

        Nope = await User.registerNewUser('Nope', 'Alice123');
        NopeToken = jwt.sign({ id: Nope._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '5m'
        });

        littleDaniel = await User.registerNewUser('littleDaniel', 'Alice123');
        littleDanielToken = jwt.sign({ id: littleDaniel._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '5m'
        });
    })

    afterEach(async () => {
        await Announcement.deleteMany({});
        await PrivateMessage.deleteMany({});
        await PublicMessage.deleteMany({});
        await Alert.deleteMany({});
        await User.deleteMany({username: { $ne: 'userOne' }});
    });


    ////////////////// Test cases for stop words //////////////////
    it('Should return empty array', () => {
        expect(filterStopWords('I WILL do it')).toStrictEqual([]);
    });

    it('Should return empty array', () => {
        expect(filterStopWords('     ')).toStrictEqual([]);
    });

    it('Should return empty array', () => {
        expect(filterStopWords('')).toStrictEqual([]);
    });

    it('Should return [ hospital ]', () => {
        expect(filterStopWords('Where is the hospital')).toStrictEqual(['hospital']);
    });

    it('Should return [ closest, hospital ]', () => {
        expect(filterStopWords('Where is the    closest     hospital')).toStrictEqual(['closest', 'hospital']);
    });


    ////////////////// Test cases for citizen search //////////////////
    it('Citizen search test case #1 - username search', async () => {
        const results = await CitizenSearchFactory.searchCitizenByUsername("dan");
        
        expect(results.length).toBe(2);
        expect(results[0].username).toBe("Daniel");
        expect(results[1].username).toBe("littleDaniel");
    });

    it('Citizen search test case #2 - username search', async () => {
        const results = await CitizenSearchFactory.searchCitizenByUsername("none");
        const results2 = await CitizenSearchFactory.searchCitizenByUsername("daniel daniel");
        const results3 = await CitizenSearchFactory.searchCitizenByUsername("");
        const results4 = await CitizenSearchFactory.searchCitizenByUsername("   ");

        expect(results).toStrictEqual([]);
        expect(results2).toStrictEqual([]);
        expect(results3).toStrictEqual([]);
        expect(results4).toStrictEqual([]);
    });

    it('Citizen search test case #3 - user status search', async () => {
        const results = await CitizenSearchFactory.searchCitizenByStatus("undefined");

        expect(results.length).toBe(4);
        expect(results[0].username).toBe("Alice");
        expect(results[1].username).toBe("Daniel");
        expect(results[2].username).toBe("Nope");
        expect(results[3].username).toBe("littleDaniel");
    });

    it('Citizen search test case #4 - user status search', async () => {
        const results = await CitizenSearchFactory.searchCitizenByStatus("Ok");

        expect(results).toStrictEqual([]);
    });

    it('Citizen search test case #5 - getSearchFunction', async () => {
        const func = CitizenSearchFactory.getSearchFunction();

        const results = await func({usernameFragment: "dan", status: "Ok"});
        expect(results.length).toBe(2);
        expect(results[0].username).toBe("Daniel");
        expect(results[1].username).toBe("littleDaniel");

        const results2 = await func({usernameFragment: "", status: "undefined"});
        expect(results2.length).toBe(4);
        expect(results2[0].username).toBe("Alice");
        expect(results2[1].username).toBe("Daniel");
        expect(results2[2].username).toBe("Nope");
        expect(results2[3].username).toBe("littleDaniel");

        // TODO: fix this test
        // const results3 = await func({usernameFragment: "", status: ""});
        // expect(results3).toThrow("Invalid search criteria");
    });


    ////////////////// Test cases for private messages //////////////////
    it('Private chat search', async () => {
        const response = await request(app)
            .post('/messages/private')
            .set('Cookie', [`token=${AliceToken}`]) // Send JWT as a cookie
            .send({
                receiverId: Daniel._id,
                content: 'said Hey Daniel! This is Alice'
            });
        expect(response.status).toBe(201);

        const response2 = await request(app)
            .post('/messages/private')
            .set('Cookie', [`token=${DanielToken}`]) // Send JWT as a cookie
            .send({
                receiverId: Alice._id,
                content: 'said Hey Alice this is Daniel!'
            });
        expect(response2.status).toBe(201);

        const response3 = await request(app)
            .post('/messages/private')
            .set('Cookie', [`token=${DanielToken}`]) // Send JWT as a cookie
            .send({
                receiverId: Alice._id,
                content: 'said How are you Alice?'
            });
        expect(response3.status).toBe(201);

        const response4 = await request(app)
            .post('/messages/private')
            .set('Cookie', [`token=${DanielToken}`]) // Send JWT as a cookie
            .send({
                receiverId: littleDaniel._id,
                content: 'Hey littleDaniel I am Daniel'
            });
        expect(response4.status).toBe(201);

        const func = PrivateMessageSearchFactory.getSearchFunction();
        const results = await func({status:'', query: 'Hey Daniel', myUserId: Daniel._id, otherUserId: Alice._id}, 0);
        // const results = await func({userIdOne: Daniel._id, userIdTwo: Alice._id, query: "Hey Daniel", pageIndex: 0});
        expect(results.length).toBe(2);
        expect(results[0].senderName).toBe('Daniel');
        expect(results[0].receiverName).toBe('Alice');
        expect(results[0].content).toBe("said Hey Alice this is Daniel!");
        expect(results[1].senderName).toBe('Alice');
        expect(results[1].receiverName).toBe('Daniel');
        expect(results[1].content).toBe("said Hey Daniel! This is Alice");

        // Stop words
        const results2 = await func({userIdOne: Daniel._id, userIdTwo: Alice._id, query: "said", pageIndex: 0});
        expect(results2.length).toBe(0);
        
        // Words not exist
        const results3 = await func({userIdOne: Daniel._id, userIdTwo: Alice._id, query: "security", pageIndex: 0});
        expect(results3.length).toBe(0);

        // Private chats not exist
        const results4 = await func({userIdOne: littleDaniel._id, userIdTwo: Alice._id, query: "Daniel", pageIndex: 0});
        expect(results4.length).toBe(0);

        // Page index
        const results5 = await func({userIdOne: Daniel._id, userIdTwo: Alice._id, query: "Hey Daniel", pageIndex: 1});
        expect(results5.length).toBe(0);
    });


    ////////////////// Test cases for public messages //////////////////
    it('Public message search', async () => {
        const response = await request(app)
            .post('/messages/public')
            .set('Cookie', [`token=${DanielToken}`]) // Send JWT as a cookie
            .send({
                content: 'said A public message from Daniel!'
            });
        expect(response.status).toBe(201);

        const response2 = await request(app)
            .post('/messages/public')
            .set('Cookie', [`token=${AliceToken}`]) // Send JWT as a cookie
            .send({
                content: 'said Hey Daniel do you know what time it is now?'
            });
        expect(response2.status).toBe(201);

        const response3 = await request(app)
            .post('/messages/public')
            .set('Cookie', [`token=${DanielToken}`]) // Send JWT as a cookie
            .send({
                content: 'said A second message from Daniel!'
            });
        expect(response3.status).toBe(201);

        const func = PublicMessageSearchFactory.getSearchFunction();
        const results = await func("DANIEL", 0);
        expect(results.length).toBe(3);
        expect(results[0].senderName).toBe('Daniel');
        expect(results[0].content).toBe("said A second message from Daniel!");
        expect(results[1].senderName).toBe('Alice');
        expect(results[1].content).toBe("said Hey Daniel do you know what time it is now?");
        expect(results[2].senderName).toBe('Daniel');
        expect(results[2].content).toBe("said A public message from Daniel!");

        // Stop words
        const results2 = await func("said", 0);
        expect(results2.length).toBe(0);

        // Words not exist
        const results3 = await func("security", 0);
        expect(results3.length).toBe(0);

        // Page index
        const results4 = await func("Daniel", 1);
        expect(results4.length).toBe(0);
    });


    ////////////////// Test cases for announcements //////////////////
    it('Announcement search', async () => {
        const response = await request(app)
            .post('/announcements')
            .set('Cookie', [`token=${AliceToken}`]) // Send JWT as a cookie
            .send({
                content: 'said An announcement from Alice!'
            });
        expect(response.status).toBe(201);

        const response2 = await request(app)
            .post('/announcements')
            .set('Cookie', [`token=${DanielToken}`]) // Send JWT as a cookie
            .send({
                content: 'said An announcement from Daniel!'
            });
        expect(response2.status).toBe(201);

        const response3 = await request(app)
            .post('/announcements')
            .set('Cookie', [`token=${littleDanielToken}`]) // Send JWT as a cookie
            .send({
                content: 'said An announcement from littleDaniel!'
            });
        expect(response3.status).toBe(201);

        const func = AnnouncementSearchFactory.getSearchFunction();
        const results = await func("DANIEL", 0);
        expect(results.length).toBe(2);
        expect(results[0].posterName).toBe('littleDaniel');
        expect(results[0].content).toBe("said An announcement from littleDaniel!");
        expect(results[1].posterName).toBe('Daniel');
        expect(results[1].content).toBe("said An announcement from Daniel!");

        // Stop words
        const results2 = await func("said", 0);
        expect(results2.length).toBe(0);

        // Words not exist
        const results3 = await func("security", 0);
        expect(results3.length).toBe(0);

        // Page index
        const results4 = await func("Daniel", 1);
        expect(results4.length).toBe(0);
    });

    ////////////////// Test cases for search controllers //////////////////
    // TODO: implement this after the frontend is done
});
