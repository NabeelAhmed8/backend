import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 */
export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[MONGODB] MONGODB_URI is not configured in environment variables.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log(`[MONGODB CONNECTED] Host: ${conn.connection.host} | DB: ${conn.connection.name}`);
  } catch (error) {
    console.error('[MONGODB CONNECTION ERROR]', error.message);
  }
}

export default connectDB;
