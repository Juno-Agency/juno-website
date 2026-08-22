import { createApp } from './app';
import { config, isProd } from './config';
import { connectDb, disconnectDb } from './db';
import { warmTemplates } from './mail/render';

async function main(): Promise<void> {
  await connectDb();

  // Compile the MJML email templates once at boot (they're cached thereafter).
  warmTemplates().catch((err) => console.error('[JUNO] mail template warmup failed', err));

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`[JUNO] API ready on http://localhost:${config.port}`);
    if (!isProd) {
      console.log(`[JUNO] Swagger UI:   http://localhost:${config.port}/api/docs`);
    }
  });

  async function shutdown(signal: string): Promise<void> {
    console.log(`[JUNO] ${signal} received, shutting down…`);
    server.close(() => void 0);
    await disconnectDb();
    process.exit(0);
  }

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('[JUNO] failed to start', err);
  process.exit(1);
});
