import request from 'supertest';
import {app} from '../app';
import {User} from '../models/User';
import {Hazard} from '../models/Hazard.js';
import {setupTestDatabase, closeTestDatabase} from '../test-setup';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

describe('Hazard functionality', () => {
    let user, token;

    beforeAll(async () => {
        await setupTestDatabase();
        user = await User.registerNewUser('testUser', 'testPassword123');
        token = jwt.sign({id: user._id}, process.env.JWT_SECRET_KEY, {
            expiresIn: '5m'
        });
    });

    afterEach(async () => {
        await Hazard.deleteAllHazards();
    });

    //Test adding a hazard
    it('should create a new hazard', async () => {
        const response = await request(app)
            .post('/hazards/report')
            .set('Cookie', [`token=${token}`])
            .send({
                latitude: 40.7128,
                longitude: -74.0060,
                details: 'This is a test hazard',
            });

        expect(response.status).toBe(201);
        expect(response.body.details).toBe('This is a test hazard');
        expect(response.body.latitude).toBe(40.7128);
        expect(response.body.longitude).toBe(-74.0060);
    });

    //Test adding multiple hazard
    it('should create 2 new hazards', async () => {
        var response = await request(app)
            .post('/hazards/report')
            .set('Cookie', [`token=${token}`])
            .send({
                name: 'Test Hazard',
                latitude: 40.7128,
                longitude: -74.0060,
                details: 'This is a test hazard',
            });

        response = await request(app)
            .post('/hazards/report')
            .set('Cookie', [`token=${token}`])
            .send({
                name: 'Test Hazard2',
                latitude: 39.7128,
                longitude: -70.0060,
                details: 'This is the 2nd test hazard',
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.details).toBe('This is the 2nd test hazard');
        expect(response.body.latitude).toBe(39.7128);
        expect(response.body.longitude).toBe(-70.0060);
    });

    // Test getting all hazards
    it('should get all hazards', async () => {
        var hazard1 = await Hazard.addHazard(40.7128, -74.0060, 'This is a test hazard');
        var hazard2 = await Hazard.addHazard(39.7128, -70.0060, 'This is the 2nd test hazard');

        const response = await request(app).get('/hazards').set('Cookie', [`token=${token}`]);

        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('This is a test hazard');
        expect(response.text).toContain('This is the 2nd test hazard');
    });

    // Test getting a specific hazard
    it('should get a specific hazard', async () => {

        var hazard1 = await Hazard.addHazard(40.7128, -74.0060, 'This is a test hazard');
        var hazard2 = await Hazard.addHazard(39.7128, -70.0060, 'This is the 2nd test hazard');
        const response = await request(app).get(`/hazards/${hazard1._id}`).set('Cookie', [`token=${token}`]);

        expect(response.status).toBe(200);
        expect(response.body.details).toEqual(hazard1.details);
        expect(response.body.latitude).toBe(hazard1.latitude);
        expect(response.body.longitude).toBe(hazard1.longitude);
    });

    // Test deleting a hazard
    it('should delete a hazard', async () => {
        var hazard1 = await Hazard.addHazard(40.7128, -74.0060, 'This is a test hazard');
        var hazard2 = await Hazard.addHazard(39.7128, -70.0060, 'This is the 2nd test hazard');

        const response = await request(app).delete(`/hazards/delete/${hazard1._id}`).set('Cookie', [`token=${token}`]);

        expect(response.status).toBe(200);
        expect(response.body.message).toEqual('Hazard deleted successfully');
    });

    //Negative Test deleting a hazard that has already been deleted
    it('should handle deleting a hazard that has already been deleted', async () => {

        var hazard1 = await Hazard.addHazard(40.7128, -74.0060, 'This is a test hazard');
        var hazard2 = await Hazard.addHazard(39.7128, -70.0060, 'This is the 2nd test hazard');

        var response = await request(app).delete(`/hazards/${hazard1._id}`).set('Cookie', [`token=${token}`]);
        response = await request(app).delete(`/hazards/${hazard1._id}`).set('Cookie', [`token=${token}`]);

        expect(response.status).toBe(404);
    });


    // Negative: Test that the hazard no longer exists
    it('should confirm that the hazard no longer exists', async () => {
        var hazard1 = await Hazard.addHazard(40.7128, -74.0060, 'This is a test hazard');
        var hazard2 = await Hazard.addHazard(39.7128, -70.0060, 'This is the 2nd test hazard');

        var response = await request(app).delete(`/hazards/delete/${hazard1._id}`).set('Cookie', [`token=${token}`]);
        response = await request(app).get(`/hazards/${hazard1._id}`).set('Cookie', [`token=${token}`]);

        expect(response.status).toBe(404);
        expect(response.text).toContain('No such hazard');
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Hazard.deleteAllHazards();
        await closeTestDatabase();
    });

});