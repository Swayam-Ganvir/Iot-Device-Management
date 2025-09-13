import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from environment variables
    // Deprecated options (useNewUrlParser, useUnifiedTopology) are removed as they are default in newer Mongoose versions.
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Increased timeout to allow for a slower Docker container startup
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
    });

    console.log(`MongoDB Connected: ${conn.connection.name} on ${conn.connection.host}`);
    return conn;

  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
