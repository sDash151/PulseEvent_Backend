const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteAllData() {
  try {
    console.log('🗑️  Starting database cleanup...');
    
    // Delete in order to avoid foreign key constraints
    console.log('🔑 Deleting password reset tokens...');
    await prisma.passwordResetToken.deleteMany({});

    console.log('🔑 Deleting email verification tokens...');
    await prisma.emailVerificationToken.deleteMany({});
    
    console.log('📧 Deleting WhatsApp notifications...');
    await prisma.whatsAppNotification.deleteMany({});
    
    console.log('👥 Deleting participants...');
    await prisma.participant.deleteMany({});
    
    console.log('⏳ Deleting waiting list entries...');
    await prisma.waitingList.deleteMany({});
    
    console.log('📝 Deleting registrations...');
    await prisma.registration.deleteMany({});
    
    console.log('📨 Deleting invitations...');
    await prisma.invitation.deleteMany({});
    
    console.log('💬 Deleting feedback...');
    await prisma.feedback.deleteMany({});
    
    console.log('✅ Deleting RSVPs...');
    await prisma.rsvp.deleteMany({});
    
    console.log('🎉 Deleting events...');
    await prisma.event.deleteMany({});
    
    console.log('👤 Deleting users...');
    await prisma.user.deleteMany({});
    
    console.log('✅ All database data has been successfully deleted!');
    
  } catch (error) {
    console.error('❌ Error deleting data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the deletion
deleteAllData()
  .then(() => {
    console.log('🎯 Database cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database cleanup failed:', error);
    process.exit(1);
  }); 