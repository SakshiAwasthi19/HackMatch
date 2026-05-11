import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      lastActiveAt: true
    }
  });
  console.log('Total users:', users.length);
  console.log('Users:', JSON.stringify(users, null, 2));

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  console.log('Seven days ago:', sevenDaysAgo);

  const activeUsers = users.filter(u => u.lastActiveAt && new Date(u.lastActiveAt) >= sevenDaysAgo);
  console.log('Active users (last 7 days):', activeUsers.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
