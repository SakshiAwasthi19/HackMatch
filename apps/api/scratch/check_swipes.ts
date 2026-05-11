import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const swipes = await prisma.swipe.findMany();
  console.log('Total swipes:', swipes.length);
  console.log('Swipes:', JSON.stringify(swipes, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
