import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkData() {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: 'sakshiawasthi00114@gmail.com' },
          { name: { contains: 'ruhi', mode: 'insensitive' } },
          { email: { contains: 'ruhi', mode: 'insensitive' } }
        ]
      }
    });

    console.log('--- Users Found ---');
    console.log(JSON.stringify(users, null, 2));

    if (users.length < 2) {
      console.log('Could not find both users.');
      return;
    }

    const sakshi = users.find(u => u.email === 'sakshiawasthi00114@gmail.com');
    // Find ruhi excluding sakshi just in case
    const ruhi = users.find(u => u.id !== sakshi?.id && (u.name.toLowerCase().includes('ruhi') || u.email.toLowerCase().includes('ruhi')));

    if (sakshi && ruhi) {
      console.log(`Checking interactions between Sakshi (${sakshi.id}) and Ruhi (${ruhi.id})`);
      
      const swipes = await prisma.swipe.findMany({
        where: {
          senderId: sakshi.id,
          receiverId: ruhi.id
        }
      });
      console.log('--- Swipes from Sakshi to Ruhi ---');
      console.log(JSON.stringify(swipes, null, 2));

      const notifications = await prisma.notification.findMany({
        where: {
          userId: ruhi.id,
          actorId: sakshi.id
        }
      });
      console.log('--- Notifications for Ruhi from Sakshi ---');
      console.log(JSON.stringify(notifications, null, 2));
      
      const ruhiSwipes = await prisma.swipe.findMany({
        where: { senderId: ruhi.id }
      });
      console.log('--- Swipes BY Ruhi ---');
      console.log(JSON.stringify(ruhiSwipes, null, 2));
    } else {
      console.log('Could not uniquely identify Sakshi and Ruhi.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
