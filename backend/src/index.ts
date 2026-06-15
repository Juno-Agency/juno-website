import { createApp } from './app';
import { config } from './config';
import { disconnectDb } from './db';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`[JUNO] API ready on http://localhost:${config.port}`);
  console.log(`[JUNO] Swagger UI:   http://localhost:${config.port}/api/docs`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`[JUNO] ${signal} received, shutting down…`);
  server.close(() => void 0);
  await disconnectDb();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
