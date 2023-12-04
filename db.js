import mongoose from 'mongoose';
import { User, PrivilegeLevel } from './models/User.js';
import bcrypt from 'bcrypt';

export const ensureDefaultAdminExists = async () => {
    const defaultAdminUsername = 'esnadmin'
    const defaultAdminPassword = 'admin'
    let defaultAdmin;
    try {
        defaultAdmin = await User.findByUsername(defaultAdminUsername);
    } catch (error) {
        console.error('Error fetching default admin:', error.message);
    }
    if (!defaultAdmin) {
        console.log('Creating default admin');
        try {
            defaultAdmin = await User.registerNewUser(defaultAdminUsername, await bcrypt.hash(defaultAdminPassword, 10));
        } catch (error) {
            console.error('Error creating default admin:', error.message);
        }
    }
    defaultAdmin.privilege = PrivilegeLevel.ADMINISTRATOR;
    defaultAdmin.lastStatus = 'ok';
    await defaultAdmin.save();
}
const connectDB = async () => {
    // Determine the connection string based on environment
    const isTestEnv = process.env.NODE_ENV === 'test';
    const connectionString = isTestEnv ? process.env.TEST_DB_URI : process.env.DB_URI;

    try {
        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        await ensureDefaultAdminExists();
        console.log('DB Connected successfully to:', isTestEnv ? 'TEST DATABASE' : 'MAIN DATABASE');
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}

export default connectDB;
