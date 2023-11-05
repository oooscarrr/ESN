import mongoose from 'mongoose';

async function setupTestDatabase() {
  // Use the TEST_DB_URI from the .env file
  const testDbUri = process.env.TEST_DB_URI;
  console.log('testDbUri:', testDbUri);
  
  // Connect to the test db
  await mongoose.connect(testDbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

async function closeTestDatabase() {
  mongoose.connection.close();
}

export { setupTestDatabase, closeTestDatabase };




