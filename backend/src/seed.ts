import bcrypt from 'bcryptjs';
import { prisma } from './db';

/** Creates (or keeps) the back-office admin user from env credentials. */
async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL ?? 'admin@juno.studio';
  const password = process.env.ADMIN_PASSWORD ?? 'change-me';
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: 'JUNO Admin' },
  });
  console.log(`[seed] admin ready: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
