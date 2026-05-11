import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    data: {
      lastActiveAt: new Date(),
    },
  });
  console.log('All users marked active');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
