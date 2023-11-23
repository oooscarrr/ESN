import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import { Resource } from '../models/Resource';
import { ResourceRequest } from '../models/ResourceRequest';
import { setupTestDatabase, closeTestDatabase } from '../test-setup';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

describe('Resource Creation and Update functionality', () => {
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
        await Resource.deleteMany({});
    });

    it('Should persist a resource with correct content', async () => {
        const response = await request(app)
            .post('/resources')
            .set('Cookie', [`token=${token}`])
            .send({ name: 'Test resource', description: 'This is a test resource.' });

        expect(response.status).toBe(201);
        const resource = response.body.resource;
        expect(resource.ownerName).toBe(user.username);
        expect(resource.name).toBe('Test resource');
        expect(resource.quantity).toBe(1);
        expect(resource.description).toBe('This is a test resource.');
    });

    it('Should return error when non-existent user posts a resource', async () => {
        const nonExistentUserId = new mongoose.Types.ObjectId('000000000000000000000000');
        const fakeToken = jwt.sign({ id: nonExistentUserId }, process.env.JWT_SECRET_KEY, {
            expiresIn: '1m'
        });
        const response = await request(app)
            .post('/resources')
            .set('Cookie', [`token=${fakeToken}`])
            .send({ name: 'Test resource', description: 'This is a test resource.' });

        expect(response.status).toBe(500);
    });

    it('Should update resource with correct content', async () => {
        const resource = await Resource.create({
            name: 'Test resource',
            quantity: 1,
            description: 'This is a test resource.',
            owner: user._id,
            ownerName: user.username
        });
        const response = await request(app)
            .put(`/resources/${resource._id}`)
            .set('Cookie', [`token=${token}`])
            .send({
                name: 'Updated resource',
                quantity: 2,
                description: 'This is an updated test resource.'
            });
        
        expect(response.status).toBe(200);
        const updatedResource = response.body.resource;
        expect(updatedResource.name).toBe('Updated resource');
        expect(updatedResource.quantity).toBe(2);
        expect(updatedResource.description).toBe('This is an updated test resource.');
    });

    it('Should delete resource', async () => {
        const resource = await Resource.create({
            name: 'Test resource',
            quantity: 1,
            description: 'This is a test resource.',
            owner: user._id,
            ownerName: user.username
        });
        const response = await request(app)
            .delete(`/resources/${resource._id}`)
            .set('Cookie', [`token=${token}`]);
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Resource deleted');
        const deletedResource = await Resource.findById(resource._id);
        expect(deletedResource).toBeNull();
    });

    it('Should fetch all resources', async () => {
        await Resource.create({
            name: 'Test resource 1',
            quantity: 1,
            description: 'This is a test resource.',
            owner: user._id,
            ownerName: user.username
        });
        await Resource.create({
            name: 'Test resource 2',
            quantity: 1,
            description: 'This is a test resource.',
            owner: user._id,
            ownerName: user.username
        });
        const response = await request(app)
            .get('/resources')
            .set('Cookie', [`token=${token}`]);
        
        expect(response.status).toBe(200);
        expect(response.text).toContain('Test resource 1');
        expect(response.text).toContain('Test resource 2');
    });

    it('Should filter resources by keyword', async () => {
        await Resource.create({
            name: 'Test resource 1',
            quantity: 1,
            description: 'This is a test resource.',
            owner: user._id,
            ownerName: user.username
        });
        await Resource.create({
            name: 'Test resource 2',
            quantity: 1,
            description: 'This is a test resource.',
            owner: user._id,
            ownerName: user.username
        });
        const response = await request(app)
            .get('/resources?keyword=1')
            .set('Cookie', [`token=${token}`]);
        
        expect(response.status).toBe(200);
        expect(response.text).toContain('Test resource 1');
        expect(response.text).not.toContain('Test resource 2');
    });

    it('Should display list item page', async () => {
        const response = await request(app)
            .get('/resources/newitem')
            .set('Cookie', [`token=${token}`]);
        
        expect(response.status).toBe(200);
        expect(response.text).toContain('List Resource');
    });

    it('Should fetch all my resources', async () => {
        await Resource.create({
            name: 'Test resource 1',
            quantity: 1,
            description: 'This is a test resource.',
            owner: user._id,
            ownerName: user.username
        });
        await Resource.create({
            name: 'Test resource 2',
            quantity: 1,
            description: 'This is a test resource.',
            owner: user._id,
            ownerName: user.username
        });
        const response = await request(app)
            .get('/resources/mylistings')
            .set('Cookie', [`token=${token}`]);
        
        expect(response.status).toBe(200);
        expect(response.text).toContain('Test resource 1');
        expect(response.text).toContain('Test resource 2');
    });

    it('Should display item detail page', async () => {
        const resource = await Resource.create({
            name: 'Test resource',
            quantity: 1,
            description: 'This is a test resource.',
            owner: user._id,
            ownerName: user.username
        });
        const response = await request(app)
            .get(`/resources/item/${resource._id}`)
            .set('Cookie', [`token=${token}`]);
        
        expect(response.status).toBe(200);
        expect(response.text).toContain('Test resource');
        expect(response.text).toContain('This is a test resource.');
        expect(response.text).toContain('Edit');
        expect(response.text).toContain('Delete');
    });
});

describe('Resource Request functionality', () => {
    let user, token, anotherUser, anotherToken;

    beforeAll(async () => {
        await setupTestDatabase();
        user = await User.registerNewUser('testUser', 'testPassword123');
        token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '5m'
        });
        anotherUser = await User.registerNewUser('anotherUser', 'testPassword123');
        anotherToken = jwt.sign({ id: anotherUser._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '5m'
        });
    });

    afterAll(async () => {
        await User.deleteMany({});
        await closeTestDatabase();
    });

    afterEach(async () => {
        await Resource.deleteMany({});
        await ResourceRequest.deleteMany({});
    });

    it('Should send request to resource owner and delete it', async () => {
        const resource = await Resource.create({
            name: 'Test resource',
            quantity: 1,
            description: 'This is a test resource.',
            owner: user._id,
            ownerName: user.username
        });
        let response = await request(app)
            .post('/resources/newrequest')
            .set('Cookie', [`token=${anotherToken}`])
            .send({ resourceId: resource._id });

        expect(response.status).toBe(201);
        const theRequest = await ResourceRequest.findById(response.body.requestId);
        expect(theRequest.resource.toString()).toBe(resource._id.toString());
        expect(theRequest.requesterName).toBe(anotherUser.username);
        expect(theRequest.status).toBe('pending');

        response = await request(app)
            .delete(`/resources/requestdeletion/${resource._id}`)
            .set('Cookie', [`token=${anotherToken}`]);
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Request deleted');
        const deletedRequest = await ResourceRequest.findById(theRequest._id);
        expect(deletedRequest).toBeNull();
    });

    it('Should fetch all my requests', async () => {
        const resource1 = await Resource.create({
            name: 'Test resource 1',
            quantity: 1,
            description: 'This is a test resource.',
            owner: user._id,
            ownerName: user.username
        });
        const resource2 = await Resource.create({
            name: 'Test resource 2',
            quantity: 1,
            description: 'This is a test resource 2.',
            owner: user._id,
            ownerName: user.username
        });
        await ResourceRequest.create({
            resource: resource1._id,
            requester: anotherUser._id,
            requesterName: anotherUser.username,
            quantity: 1,
            message: 'This is a test request.'
        });
        await ResourceRequest.create({
            resource: resource2._id,
            requester: anotherUser._id,
            requesterName: anotherUser.username,
            quantity: 1,
            message: 'This is another test request.'
        });
        const response = await request(app)
            .get('/resources/myrequests')
            .set('Cookie', [`token=${anotherToken}`]);

        expect(response.status).toBe(200);
        expect(response.text).toContain('Test resource 1');
        expect(response.text).toContain('Test resource 2');
    });

    it('Should accept a request', async () => {
        const resource = await Resource.create({
            name: 'Test resource',
            quantity: 1,
            description: 'This is a test resource.',
            owner: user._id,
            ownerName: user.username
        });
        const theRequest = await ResourceRequest.create({
            resource: resource._id,
            requester: anotherUser._id,
            requesterName: anotherUser.username,
            quantity: 1,
            message: 'This is a test request.'
        });
        const response = await request(app)
            .put(`/resources/acceptance/${theRequest._id}`)
            .set('Cookie', [`token=${token}`]);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Request accepted');
        const updatedRequest = await ResourceRequest.findById(theRequest._id);
        expect(updatedRequest.status).toBe('accepted');
    });

    it('Should reject a request', async () => {
        const resource = await Resource.create({
            name: 'Test resource',
            quantity: 1,
            description: 'This is a test resource.',
            owner: user._id,
            ownerName: user.username
        });
        const theRequest = await ResourceRequest.create({
            resource: resource._id,
            requester: anotherUser._id,
            requesterName: anotherUser.username,
            quantity: 1,
            message: 'This is a test request.'
        });
        const response = await request(app)
            .put(`/resources/rejection/${theRequest._id}`)
            .set('Cookie', [`token=${token}`]);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Request rejected');
        const updatedRequest = await ResourceRequest.findById(theRequest._id);
        expect(updatedRequest.status).toBe('rejected');
    });
});