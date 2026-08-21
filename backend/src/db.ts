import mongoose from 'mongoose';
import { config } from './config';

mongoose.set('strictQuery', true);

/** Opens the shared Mongoose connection to MongoDB. */
export async function connectDb(): Promise<void> {
  await mongoose.connect(config.databaseUrl);
  console.log('[JUNO] MongoDB connected');
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
