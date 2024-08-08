import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from 'node-color-log';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/postproai';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI).then(() => {
        logger.success('MongoDB connected');
    }).catch((error) => {
        logger.error('MongoDB connection failed', error);
    });
  } catch (error) {
    logger.error('MongoDB connection failed');
  }
};

export default connectDB;