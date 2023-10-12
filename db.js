import mongoose from 'mongoose';

const connectDB = async (username, password, dbAddress) => {
    mongoose.connect(
        `mongodb+srv://${username}:${password}@${dbAddress}/?retryWrites=true&w=majority`,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        },
      );
      
      const db = mongoose.connection;
      db.on('error', console.error.bind(console, 'Error: '));
      db.once('open', function () {
        console.log('DB Connected successfully!');
      });
}

export default connectDB;