import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true }});
  console.log('USERS:', users);
  
  const chats = await prisma.chat.findMany({ include: { members: true, team: true }});
  console.log('CHATS:', JSON.stringify(chats, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
