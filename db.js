import mongoose from 'mongoose';

const connectDB = async () => {
    // Determine the connection string based on environment
    const isTestEnv = process.env.NODE_ENV === 'test';
    const connectionString = isTestEnv ? process.env.TEST_DB_URI : process.env.DB_URI;

    try {
        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
      
        console.log('DB Connected successfully to:', isTestEnv ? 'TEST DATABASE' : 'MAIN DATABASE');
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}

export default connectDB;
