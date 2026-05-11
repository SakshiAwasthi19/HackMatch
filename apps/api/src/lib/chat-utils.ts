import { prisma } from '../db.js';

/**
 * Finds or creates a DM chat between exactly two users.
 * Ensures idempotency and prevents duplicate DM chats.
 */
export async function getOrCreateDMChat(user1Id: string, user2Id: string, tx: any = prisma) {
  // Find existing DM chat
  const existingChat = await tx.chat.findFirst({
    where: {
      type: 'DM',
      AND: [
        { members: { some: { userId: user1Id } } },
        { members: { some: { userId: user2Id } } }
      ]
    },
    include: {
      members: true
    }
  });

  // Filter for chats that have EXACTLY 2 members (to avoid matching group chats or legacy garbage)
  const trueDM = existingChat && existingChat.members.length === 2 ? existingChat : null;

  if (trueDM) {
    return trueDM;
  }

  // Create new DM chat
  return await tx.chat.create({
    data: {
      type: 'DM',
      members: {
        create: [
          { userId: user1Id },
          { userId: user2Id }
        ]
      }
    }
  });
}
