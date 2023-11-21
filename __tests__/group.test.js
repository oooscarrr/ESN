import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import { Group } from '../models/Group';
import { GroupMessage } from '../models/GroupMessage';
import { setupTestDatabase, closeTestDatabase } from '../test-setup';
import { calculate_distance, get_nearby_people, get_nearby_groups } from '../controllers/nearbyPeopleController.js';
import { create_new_group, list_group_chat_list, list_group_chat_room, post_group_message, join_group, change_group_name, change_group_description, leave_group } from '../controllers/groupChatController.js';
import jwt from 'jsonwebtoken';

describe('group chat functionality test cases', () => {
    let daniel, danielToken, lyn, lynToken, alex, alexToken, far, farToken, none, noneToken;
    let group1, groupId1, group2, groupId2, group3, groupId3, group4, groupId4;

    beforeAll(async () => {
        await setupTestDatabase();
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Group.deleteMany({});
        await GroupMessage.deleteMany({});
        await closeTestDatabase();
    });

    beforeEach(async () => {
        daniel = await User.registerNewUserWithLocation('daniel', '12345', 35.2702315, -120.6548187);
        danielToken = jwt.sign({ id: daniel._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '10m'
        });

        lyn = await User.registerNewUserWithLocation('lyn', '12345', 35.2702322, -120.6548073);
        lynToken = jwt.sign({ id: lyn._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '10m'
        });

        alex = await User.registerNewUserWithLocation('alex', '12345', 35.2702310, -120.6548220);
        alexToken = jwt.sign({ id: alex._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '10m'
        });

        far = await User.registerNewUserWithLocation('far', '12345', 36.2702310, -122.6548220);
        farToken = jwt.sign({ id: far._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '10m'
        });

        none = await User.registerNewUserWithLocation('none', '12345', null, null);
        noneToken = jwt.sign({ id: none._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '10m'
        });

        group1 = await Group.create({ groupName: 'group1'});
        groupId1 = group1._id.valueOf();
        group2 = await Group.create({ groupName: 'group2'});
        groupId2 = group2._id.valueOf();
        group3 = await Group.create({ groupName: 'group3'});
        groupId3 = group3._id.valueOf();
        group4 = await Group.create({ groupName: 'group4'});
        groupId4 = group4._id.valueOf();

        lyn.groups = [groupId1, groupId2];
        await lyn.save();
        alex.groups = [groupId2, groupId3];
        await alex.save();
        far.groups = [groupId4];
        await far.save();
        none.groups = [''];
        await none.save();
    })

    afterEach(async () => {
        await User.deleteMany({});
        await Group.deleteMany({});
        await GroupMessage.deleteMany({});
    });


    ////////////////// Test cases for nearbyPeopleController.js //////////////////
    it('Calculate close distance', () => {
        expect(calculate_distance(35.2702315, -120.6548187, 35.2702322, -120.6548073)).toBeLessThanOrEqual(5);
    });


    it('Calculate far distance', () => {
        expect(calculate_distance(35.2702315, -120.6548187, 36.2702310, -122.6548220)).toBeGreaterThan(300);
    });


    it('Get nearby people', async () => {
        const citizensNearDaniel = await get_nearby_people(daniel._id.valueOf());
        let onlyTwoCitizensNearby = citizensNearDaniel.length === 2;
        let lynIsNearby = false;
        let alexIsNearby = false;
        let farIsNearby = false;

        for (let i = 0; i < citizensNearDaniel.length; ++i) {
            const citizen = citizensNearDaniel[i].user;
            if (citizen.username === 'lyn') {
                lynIsNearby = true;
            } else if (citizen.username === 'alex') {
                alexIsNearby = true;
            } else if (citizen.username === 'far') {
                farIsNearby = true;
            }
        }

        expect(onlyTwoCitizensNearby).toBe(true);
        expect(lynIsNearby).toBe(true);
        expect(alexIsNearby).toBe(true);
        expect(farIsNearby).toBe(false);
    });


    it('Get nearby groups', async () => {
        const citizensNearDaniel = await get_nearby_people(daniel._id.valueOf());
        const groupsNearDaniel = await get_nearby_groups(citizensNearDaniel);

        const hasThreeNearbyGroups = groupsNearDaniel.length === 3;
        let nearGroup1 = false;
        let nearGroup2 = false;
        let nearGroup3 = false;
        let nearGroup4 = false;
        for (let i = 0; i < groupsNearDaniel.length; ++i) {
            const group = groupsNearDaniel[i];
            if (group._id.valueOf() === groupId1) {
                nearGroup1 = true;
            } else if (group._id.valueOf() === groupId2) {
                nearGroup2 = true;
            } else if (group._id.valueOf() === groupId3) {
                nearGroup3 = true;
            } else if (group._id.valueOf() === groupId4) {
                nearGroup4 = true;
            }
        }

        expect(hasThreeNearbyGroups).toBe(true);
        expect(nearGroup1).toBe(true);
        expect(nearGroup2).toBe(true);
        expect(nearGroup3).toBe(true);
        expect(nearGroup4).toBe(false);
    });


    it('List nearby people', async () => {
        const response = await request(app)
            .get('/nearbypeople')
            .set('Cookie', [`token=${danielToken}`]) // Send JWT as a cookie

        expect(response.status).toBe(200);
        expect(response.text).toContain('lyn');
        expect(response.text).toContain('alex');
        expect(response.text).toContain('group1');
        expect(response.text).toContain('group2');
        expect(response.text).toContain('group3');
    });


    ////////////////// Test cases for groupChatController.js //////////////////
    it('Create new group', async () => {
        const response = await request(app)
            .get('/nearbypeople')
            .set('Cookie', [`token=${danielToken}`]) // Send JWT as a cookie
        expect(response.status).toBe(200);

        const response2 = await request(app)
            .post('/groups')
            .set('Cookie', [`token=${danielToken}`]) // Send JWT as a cookie
            .send({
                groupName: 'test1',
                description: ''
            });
        expect(response2.status).toBe(201);
        const group = await Group.findById(response2.body.groupId);
        expect(group.users.length).toBe(3);
        console.log("group: ", group);

        const response3 = await request(app)
            .post('/groups')
            .set('Cookie', [`token=${danielToken}`]) // Send JWT as a cookie
            .send({
                groupName: 'group1',
                description: ''
            });
        expect(response3.status).toBe(400);

        const response4 = await request(app)
            .post('/groups')
            .set('Cookie', [`token=${farToken}`]) // Send JWT as a cookie
            .send({
                groupName: 'yoyo',
                description: ''
            });
        expect(response4.status).toBe(400);
    });


    it('List group chat list', async () => {
        const response = await request(app)
            .get('/groups')
            .set('Cookie', [`token=${lynToken}`]) // Send JWT as a cookie

        expect(response.status).toBe(200);
        expect(response.text).toContain('group1');
        expect(response.text).toContain('group2');
    });


    it('List group chat room', async () => {
        await GroupMessage.create({ groupId: groupId1, senderId: daniel._id.valueOf(), senderName: 'daniel', content: 'test1'});
        await GroupMessage.create({ groupId: groupId1, senderId: lyn._id.valueOf(), senderName: 'lyn', content: 'test2'});

        const response = await request(app)
            .get('/groups/' + groupId1)
            .set('Cookie', [`token=${lynToken}`]) // Send JWT as a cookie

        expect(response.status).toBe(200);
        expect(response.text).toContain('group1');
        expect(response.text).toContain('daniel');
        expect(response.text).toContain('lyn');
        expect(response.text).toContain('test1');
        expect(response.text).toContain('test2');
    });


    it('Post group messages', async () => {
        const response1 = await request(app)
            .post('/groups/messages')
            .set('Cookie', [`token=${danielToken}`]) // Send JWT as a cookie
            .send({
                groupId: groupId1,
                input: 'test3'
            });
        expect(response1.status).toBe(201);

        const response2 = await request(app)
            .post('/groups/messages')
            .set('Cookie', [`token=${alexToken}`]) // Send JWT as a cookie
            .send({
                groupId: groupId1,
                input: 'test4'
            });
        expect(response2.status).toBe(201);

        const response3 = await request(app)
            .post('/groups/messages')
            .set('Cookie', [`token=${farToken}`]) // Send JWT as a cookie
            .send({
                groupId: groupId2,
                input: 'test5'
            });
        expect(response3.status).toBe(201);

        const page = await request(app)
            .get('/groups/' + groupId1)
            .set('Cookie', [`token=${lynToken}`]) // Send JWT as a cookie

        expect(page.status).toBe(200);
        expect(page.text).toContain('daniel');
        expect(page.text).toContain('alex');
        expect(page.text).not.toContain('far');
        expect(page.text).toContain('test3');
        expect(page.text).toContain('test4');
        expect(page.text).not.toContain('test5');
    });


    // it('Join group', async () => {
    //     let groupExists = false;
    //     let userExists = false;

    //     groupExists = none.groups.includes(groupId1);
    //     for (let i = 0; i < group1.users.length; ++i) {
    //         const u = group1.users[i];
    //         if (u.username === 'none') {
    //             userExists = true;
    //             break;
    //         }
    //     }

    //     expect(groupExists).toBe(false);
    //     expect(userExists).toBe(false);

    //     console.log('noneGroup1: ', none.groups);
    //     console.log('noneGroups2: ', group1.users);

    //     const response1 = await request(app)
    //         .post('/groups/join')
    //         .set('Cookie', [`token=${noneToken}`]) // Send JWT as a cookie
    //         .send({
    //             groupId: groupId1,
    //         });
    //     expect(response1.status).toBe(200);

    //     console.log('noneGroup3: ', none.groups);
    //     console.log('noneGroups4: ', group1.users);

    //     groupExists = none.groups.includes(groupId1);
    //     for (let i = 0; i < group1.users.length; ++i) {
    //         const u = group1.users[i];
    //         if (u.username === 'none') {
    //             userExists = true;
    //             break;
    //         }
    //     }

    //     expect(groupExists).toBe(true);
    //     expect(userExists).toBe(true);
    // });


    // it('List group chat list', async () => {
    //     const response = await request(app)
    //         .get('/groups')
    //         .set('Cookie', [`token=${lynToken}`]) // Send JWT as a cookie

    //     expect(response.status).toBe(200);
    //     expect(response.text).toContain('group1');
    //     expect(response.text).toContain('group2');
    // });
});
