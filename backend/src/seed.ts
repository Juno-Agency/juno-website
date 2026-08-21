import bcrypt from 'bcryptjs';
import { connectDb, disconnectDb } from './db';
import { AdminUser } from './models';

/** Creates (or keeps) the back-office admin user from env credentials. */
async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL ?? 'admin@juno.studio';
  const password = process.env.ADMIN_PASSWORD ?? 'change-me';
  const passwordHash = await bcrypt.hash(password, 10);

  await connectDb();
  const admin = await AdminUser.findOneAndUpdate(
    { email },
    { $setOnInsert: { email, passwordHash, name: 'JUNO Admin' } },
    { upsert: true, new: true },
  );
  console.log(`[seed] admin ready: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => disconnectDb());
