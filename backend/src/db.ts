import mongoose from 'mongoose';
import { config } from './config';
import { closeTicketsConnection } from './tickets/tickets-connection';

mongoose.set('strictQuery', true);

/** Opens the shared Mongoose connection to MongoDB. */
export async function connectDb(): Promise<void> {
  await mongoose.connect(config.databaseUrl);
  console.log('[JUNO] MongoDB connected');
}

export async function disconnectDb(): Promise<void> {
  // La connexion des tickets est distincte quand TICKETS_DATABASE_URL est
  // renseignée : `disconnect()` ne la fermerait pas.
  await closeTicketsConnection();
  await mongoose.disconnect();
}
