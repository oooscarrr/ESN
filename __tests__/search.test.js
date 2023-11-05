import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import { Announcement } from '../models/Announcement';
import { PrivateMessage } from '../models/privateMessage';
import { PublicMessage } from '../models/publicMessage';
import { setupTestDatabase, closeTestDatabase } from '../test-setup';
import { filterStopWords } from '../controllers/searchFactories/AbstractSearchFactory.js';
import AnnouncementSearchFactory from "../controllers/searchFactories/AnnouncementSearchFactory.js";
import CitizenSearchFactory from "../controllers/searchFactories/CitizenSearchFactory.js";
import PrivateMessageSearchFactory from "../controllers/searchFactories/PrivateMessageSearchFactory.js";
import PublicMessageSearchFactory from "../controllers/searchFactories/PublicMessageSearchFactory.js";
import jwt from 'jsonwebtoken';


describe('search functionality test cases', () => {
    let userOne, userTwo, userDaniel, userOneToken;

    beforeAll(async () => {
        await setupTestDatabase();

        // Create test users
        userOne = await User.registerNewUser('userOne', 'testPassword1');
        userTwo = await User.registerNewUser('userTwo', 'testPassword2');
        userDaniel = await User.registerNewUser('userDaniel', 'userDaniel123');

        // Create a token for userOne used for login
        userOneToken = jwt.sign({ id: userOne._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '5m'
        });
    });

    afterAll(async () => {
        await User.deleteMany({});
        await closeTestDatabase();
    });

    afterEach(async () => {
        await Announcement.deleteMany({});
        await PrivateMessage.deleteMany({});
        await PublicMessage.deleteMany({});
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

    ////////////////// Test cases for search rules //////////////////
    it('Citizen search test case #1 - username search', async () => {
        const results = await CitizenSearchFactory.searchCitizenByUsername("userDaniel");
        // TODO: solve the bug here
        console.log("RESULTSSS: ", results);
        expect(results).not.toStrictEqual([]);
    });

});
