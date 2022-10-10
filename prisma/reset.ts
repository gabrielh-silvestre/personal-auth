import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();
}

export const resetUsersDb = () =>
  main()
    .catch((e) => {
      console.log(e);
      process.exit(1);
    })
    .finally(async () => {
      console.log('--- User DB reset ---');
      await prisma.$disconnect();
    });
