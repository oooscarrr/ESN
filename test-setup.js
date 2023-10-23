import mongoose from 'mongoose';
import { User } from './models/User'; 
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env 

async function setupTestDatabase() {
  // Use the TEST_DB_URI from the .env file
  const testDbUri = process.env.TEST_DB_URI;
  console.log('testDbUri:', testDbUri);
  await mongoose.connect(testDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  });
  
  // Connect to the test db
  await mongoose.connect(testDbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Insert test data 
  const userData = [
    { username: 'user1', email: 'user1@example.com' },
    { username: 'user2', email: 'user2@example.com' },
  ];

  // Insert documents into the User collection
  await User.insertMany(userData);
}

export { setupTestDatabase };




