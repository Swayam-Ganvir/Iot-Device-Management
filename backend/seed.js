import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './model/userSchema.js'

dotenv.config();

const connectDB = async () => {
  console.log('--- Seeder Script Started ---');
  console.log('Attempting to connect to MongoDB...');
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected for Seeding...');
  } catch (err) {
    console.error('❌ FATAL: DB Connection Error for Seeder:', err.message);
    process.exit(1);
  }
};

const importData = async () => {
  // --- Stage 1: Deleting Users ---
  try {
    console.log('Attempting to delete existing users...');
    await User.deleteMany({}); // Using {} for clarity, means delete all
    console.log('Existing users deleted successfully.');
  } catch (error) {
    console.error('FATAL: Error during User.deleteMany():', error);
    process.exit(1);
  }

  // --- Stage 2: Creating User ---
  try {
    console.log('Attempting to create default user...');
    const userToCreate = {
      email: 'admin@example.com',
      password: 'password123',
    };
    console.log('User data to be created:', userToCreate);
    const createdUser = await User.create(userToCreate);

    
    console.log('Default user created successfully!');
    
    
    process.exit(0); // Exit with success code
  } catch (error) {
    console.error('FATAL: Error during User.create():', error);
    process.exit(1);
  }
};

const run = async () => {
    await connectDB();
    await importData();
}

run();

