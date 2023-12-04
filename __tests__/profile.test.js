import request from 'supertest';
import { app } from '../app';
import { setupTestDatabase, closeTestDatabase } from '../test-setup';
import { User, PrivilegeLevel } from '../models/User';
import {Announcement} from '../models/Announcement';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

let adminIndex = 0;
let citizenIndex = 0;

const createdUsers = [];

const getDefaultAdmin = async () => {
    const admin = await User.findByUsername('esnadmin');
    const adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: '5m'
    });
    return { admin, adminToken };
}

const createRandomAdmin = async () => {
    const admin = await User.registerNewUser('admin' + (adminIndex++), await bcrypt.hash('admin', 10));
    await User.updateUserProfile(
        {
            userId: admin._id,
            privilege: PrivilegeLevel.ADMINISTRATOR,
            isActive: true,
        }
    );
    const adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: '5m'
    });
    createdUsers.push(admin);
    return { admin, adminToken };
}

const createRandomCitizen = async () => {
    const citizen = await User.registerNewUser('citizen' + (citizenIndex++), await bcrypt.hash('citizen', 10));
    const citizenToken = jwt.sign({ id: citizen._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: '5m'
    });
    createdUsers.push(citizen);
    return { citizen, citizenToken };
}

const deleteUserById = async (userId) => {
    await User.deleteOne({
        _id: userId
    });
}

describe('Administer User Profile', () => {
    let defaultAdmin, defaultAdminToken
    beforeAll(async () => {
        await setupTestDatabase();
        ({ admin: defaultAdmin, adminToken: defaultAdminToken } = await getDefaultAdmin());
    }, 30000);

    afterAll(async () => {
        for (const user of createdUsers) {
            await deleteUserById(user._id);
        }
        Announcement.deleteMany({});
        await closeTestDatabase();
    });

    describe('At-least-one-adminisator rule', () => {
        it('should not let the last administrator to change their own privilege', async () => {
            const res = await request(app)
                .patch('/admin/users/' + defaultAdmin._id)
                .set('Cookie', [`token=${defaultAdminToken}`])
                .send({
                    privilege: PrivilegeLevel.CITIZEN
                });
            const adminAfterUpdate = await User.findByUsername('esnadmin');
            expect(adminAfterUpdate.privilege).toBe(PrivilegeLevel.ADMINISTRATOR);
        });
        it('should let an administrator change their own privilege if there is another administrator', async () => {
            const { admin: additionalAdmin, adminToken: additionalAdminToken } = await createRandomAdmin();
            const res = await request(app)
                .patch('/admin/users/' + additionalAdmin._id)
                .set('Cookie', [`token=${additionalAdminToken}`])
                .send({
                    privilege: PrivilegeLevel.CITIZEN
                });
            const adminAfterUpdate = await User.findByUsername(additionalAdmin.username);
            expect(adminAfterUpdate.privilege).toBe(PrivilegeLevel.CITIZEN);
        });
    });

    describe('Initial Administrator Rule', () => {
        it('should have the default initial administrator in the database', async () => {
            const admin = await User.findByUsername('esnadmin');
            expect(admin).toBeTruthy();
        });
    });

    describe('Administrator Action of User Profile Rule', () => {
        it('should let administrator change the active/inactive status of a user', async () => {
            const { admin: additionalAdmin, adminToken: additionalAdminToken } = await createRandomAdmin();
            const {citizen, citizenToken} = await createRandomCitizen();
            let res = await request(app)
                .patch('/admin/users/' + citizen._id)
                .set('Cookie', [`token=${additionalAdminToken}`])
                .send({
                    isActive: false
                });
            let citizenAfterUpdate = await User.findByUsername(citizen.username);
            expect(citizenAfterUpdate.isActive).toBe(false);
            res = await request(app)
                .patch('/admin/users/' + citizen._id)
                .set('Cookie', [`token=${additionalAdminToken}`])
                .send({
                    isActive: true
                });
            citizenAfterUpdate = await User.findByUsername(citizen.username);
            expect(citizenAfterUpdate.isActive).toBe(true);
        });
        it('should let administrator change the privilege of a user', async () => {
            const {admin: additionalAdmin, adminToken: additionalAdminToken} = await createRandomAdmin();
            const {citizen, citizenToken} = await createRandomCitizen();
            let res = await request(app)
                .patch('/admin/users/' + citizen._id)
                .set('Cookie', [`token=${additionalAdminToken}`])
                .send({
                    privilege: PrivilegeLevel.COORDINATOR
                });
            let citizenAfterUpdate = await User.findByUsername(citizen.username);
            expect(citizenAfterUpdate.privilege).toBe(PrivilegeLevel.COORDINATOR);
            res = await request(app)
                .patch('/admin/users/' + citizen._id)
                .set('Cookie', [`token=${additionalAdminToken}`])
                .send({
                    privilege: PrivilegeLevel.CITIZEN
                });
            citizenAfterUpdate = await User.findByUsername(citizen.username);
            expect(citizenAfterUpdate.privilege).toBe(PrivilegeLevel.CITIZEN);
        });
        it('should let administrator change the username of a user', async () => {
            const { admin: additionalAdmin, adminToken: additionalAdminToken } = await createRandomAdmin();
            const {citizen, citizenToken} = await createRandomCitizen();
            let res = await request(app)
                .patch('/admin/users/' + citizen._id)
                .set('Cookie', [`token=${additionalAdminToken}`])
                .send({
                    username: 'newUsername'
                });
            let citizenAfterUpdate = await User.findById(citizen._id);
            expect(citizenAfterUpdate.username).toBe('newusername');
        });
        it('should let administrator change the password of a user', async () => {
            const { admin: additionalAdmin, adminToken: additionalAdminToken } = await createRandomAdmin();
            const {citizen, citizenToken} = await createRandomCitizen();
            let res = await request(app)
                .patch('/admin/users/' + citizen._id)
                .set('Cookie', [`token=${additionalAdminToken}`])
                .send({
                    password: 'newPassword'
                });
            let citizenAfterUpdate = await User.findById(citizen._id);
            const isPasswordCorrect = await bcrypt.compare('newPassword', citizenAfterUpdate.password);
            expect(isPasswordCorrect).toBe(true);
        });

        it('should not let administrator change the emergency status of a user', async () => {
            const { admin: additionalAdmin, adminToken: additionalAdminToken } = await createRandomAdmin();
            const {citizen, citizenToken} = await createRandomCitizen();
            let res = await request(app)
                .patch('/admin/users/' + citizen._id)
                .set('Cookie', [`token=${additionalAdminToken}`])
                .send({
                    lastStatus: 'emergency'
                });
            let citizenAfterUpdate = await User.findById(citizen._id);
            expect(citizenAfterUpdate.lastStatus).toBe('undefined');
        });
    });

    describe('Privilege Rule', () => {
        it('should not let citizen access user profile', async () => {
            const {citizen, citizenToken} = await createRandomCitizen();
            const res = await request(app)
                .get('/admin/users/' + citizen._id)
                .set('Cookie', [`token=${citizenToken}`]);
            expect(res.statusCode).toBeGreaterThanOrEqual(300);

        });
        it('should not let coordinator access user profile', async () => {
            const { admin: additionalAdmin, adminToken: additionalAdminToken } = await createRandomAdmin();
            const {citizen, citizenToken} = await createRandomCitizen();
            citizen.privilege = PrivilegeLevel.COORDINATOR;
            await citizen.save();
            const res = await request(app)
                .get('/admin/users/' + citizen._id)
                .set('Cookie', [`token=${citizenToken}`]);
            expect(res.statusCode).toBeGreaterThanOrEqual(300);
        });
        it('should let administrator access user profile', async () => {
            const {admin: additionalAdmin, adminToken: additionalAdminToken} = await createRandomAdmin();
            const {citizen, citizenToken} = await createRandomCitizen();
            const res = await request(app)
                .get('/admin/users/' + citizen._id)
                .set('Cookie', [`token=${additionalAdminToken}`]);
            expect(res.statusCode).toBeLessThan(300);
        });
        it('should not let citizen post announcement', async () => {
            const {citizen, citizenToken} = await createRandomCitizen();
            const res = await request(app)
                .post('/announcements')
                .set('Cookie', [`token=${citizenToken}`])
                .send({
                    content: 'content'
                });
            expect(res.statusCode).toBeGreaterThanOrEqual(300);
        });
        it('should let coordinator post announcement', async () => {
            const {citizen, citizenToken} = await createRandomCitizen();
            citizen.privilege = PrivilegeLevel.COORDINATOR;
            await citizen.save();
            const res = await request(app)
                .post('/announcements')
                .set('Cookie', [`token=${citizenToken}`])
                .send({
                    content: 'content'
                });
            expect(res.statusCode).toBeLessThan(300);
        });
        it('should let administrator post announcement', async () => {
            const {admin: additionalAdmin, adminToken: additionalAdminToken} = await createRandomAdmin();
            const res = await request(app)
                .post('/announcements')
                .set('Cookie', [`token=${additionalAdminToken}`])
                .send({
                    content: 'content'
                });
            expect(res.statusCode).toBeLessThan(300);
        });
    });

    describe('Active/Inactive Rule', () => {
        it('should make new user active by default', async () => {
            const res = await request(app)
                .post('/users')
                .send({
                    username: 'newUser',
                    password: 'newPassword'
                });
            const newUser = await User.findByUsername('newuser');
            createdUsers.push(newUser);
            expect(newUser.isActive).toBe(true);
        });
        it('should not let inactive user login', async () => {
            const {citizen, citizenToken} = await createRandomCitizen();
            citizen.isActive = false;
            await citizen.save();
            const res = await request(app)
                .get('/users/' + citizen.username + '/validation')
                .send({
                    username: citizen.username,
                    password: 'citizen'
                });
            expect(res.headers['set-cookie']).toBeUndefined();
        });
        it('should let active user login', async () => {
            const {citizen, citizenToken} = await createRandomCitizen();
            const res = await request(app)
                .get('/users/' + citizen.username + '/validation')
                .query({
                    username: citizen.username,
                    password: 'citizen'
                });
            expect(res.headers['set-cookie']).toBeDefined();
        });
        it('should show announcements posted by active user', async () => {
            const {citizen, citizenToken} = await createRandomCitizen();
            citizen.privilege = PrivilegeLevel.COORDINATOR;
            await citizen.save();
            await Announcement.deleteMany({});
            const res = await request(app)
                .post('/announcements')
                .set('Cookie', [`token=${citizenToken}`])
                .send({
                    content: 'content'
                });
            const announcements = await Announcement.getDisplayableAnnouncements();
            expect(announcements.length).toBe(1);
        });
        it('should not show announcements posted by inactive user', async () => {
            const {citizen, citizenToken} = await createRandomCitizen();
            citizen.privilege = PrivilegeLevel.COORDINATOR;
            citizen.isActive = false;
            await citizen.save();
            await Announcement.deleteMany({});
            const res = await request(app)
                .post('/announcements')
                .set('Cookie', [`token=${citizenToken}`])
                .send({
                    content: 'content'
                });
            const announcements = await Announcement.getDisplayableAnnouncements();
            expect(announcements.length).toBe(0);
        });
    });

    describe('Display Tests', () => {
        it('should display the current username of the user on the profile edit page', async () => {
            const {admin: additionalAdmin, adminToken: additionalAdminToken} = await createRandomAdmin();
            const {citizen, citizenToken} = await createRandomCitizen();
            const res = await request(app)
                .get('/admin/users/' + citizen._id)
                .set('Cookie', [`token=${additionalAdminToken}`]);
            expect(res.text).toContain(citizen.username);
        });
        it('should not display the password of the user on the profile edit page', async () => {
            const {admin: additionalAdmin, adminToken: additionalAdminToken} = await createRandomAdmin();
            const {citizen, citizenToken} = await createRandomCitizen();
            const res = await request(app)
                .get('/admin/users/' + citizen._id)
                .set('Cookie', [`token=${additionalAdminToken}`]);
            expect(res.text).not.toContain(citizen.password);
        });
        it('should show the updated username once edited', async () => {
            const {admin: additionalAdmin, adminToken: additionalAdminToken} = await createRandomAdmin();
            const {citizen, citizenToken} = await createRandomCitizen();
            await request(app)
                .patch('/admin/users/' + citizen._id)
                .set('Cookie', [`token=${additionalAdminToken}`])
                .send({
                    username: 'newTESTusername'
                });
            const res = await request(app)
                .get('/admin/users/' + citizen._id)
                .set('Cookie', [`token=${additionalAdminToken}`]);
            const user = await User.findById(citizen._id);
            expect(user.username).toBe('newtestusername');
            expect(res.text).toContain('newtestusername');
        });
        it('should not update the username if the new username is invalid', async () => {
            const {admin: additionalAdmin, adminToken: additionalAdminToken} = await createRandomAdmin();
            const {citizen, citizenToken} = await createRandomCitizen();
            await request(app)
                .patch('/admin/users/' + citizen._id)
                .set('Cookie', [`token=${additionalAdminToken}`])
                .send({
                    username: 'admin'
                });
            const res = await request(app)
                .get('/admin/users/' + citizen._id)
                .set('Cookie', [`token=${additionalAdminToken}`]);
            expect(res.text).toContain(citizen.username);
        });
    });

});