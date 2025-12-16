const mongoose = require('mongoose');

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required in environment');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);

  console.log('Connected to MongoDB');
}

module.exports = connectDB;
