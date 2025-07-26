const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask for confirmation
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function deleteAllData() {
  try {
    console.log('🗑️  Starting database cleanup...');
    console.log('\n⚠️  WARNING: This will delete ALL user data and events!');
    console.log('⚠️  Reference data (colleges, degrees, specializations) will be preserved.');
    
    // Show what will be deleted
    console.log('\n📋 Data that will be deleted:');
    console.log('   - All users and their accounts');
    console.log('   - All events (mega and sub-events)');
    console.log('   - All registrations and RSVPs');
    console.log('   - All feedback and invitations');
    console.log('   - All waiting list entries');
    console.log('   - All notifications and tokens');
    
    console.log('\n🛡️  Data that will be preserved:');
    console.log('   - Colleges (reference data)');
    console.log('   - Degrees (reference data)');
    console.log('   - Specializations (reference data)');
    
    // Confirmation prompts
    const confirm1 = await askQuestion('\n❓ Type "DELETE ALL DATA" to confirm deletion: ');
    if (confirm1 !== 'DELETE ALL DATA') {
      console.log('❌ Deletion cancelled.');
      return;
    }
    
    const confirm2 = await askQuestion('❓ Are you absolutely sure? Type "YES" to proceed: ');
    if (confirm2 !== 'YES') {
      console.log('❌ Deletion cancelled.');
      return;
    }
    
    // Show record counts before deletion
    console.log('\n📊 Current record counts:');
    const userCount = await prisma.user.count();
    const eventCount = await prisma.event.count();
    const registrationCount = await prisma.registration.count();
    const rsvpCount = await prisma.rsvp.count();
    const feedbackCount = await prisma.feedback.count();
    const invitationCount = await prisma.invitation.count();
    const waitingListCount = await prisma.waitingList.count();
    
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Events: ${eventCount}`);
    console.log(`   - Registrations: ${registrationCount}`);
    console.log(`   - RSVPs: ${rsvpCount}`);
    console.log(`   - Feedback: ${feedbackCount}`);
    console.log(`   - Invitations: ${invitationCount}`);
    console.log(`   - Waiting List: ${waitingListCount}`);
    
    const finalConfirm = await askQuestion('\n❓ Proceed with deletion? Type "PROCEED": ');
    if (finalConfirm !== 'PROCEED') {
      console.log('❌ Deletion cancelled.');
      return;
    }
    
    console.log('\n🗑️  Starting deletion process...');
    
    // Delete in order to avoid foreign key constraints
    // PRESERVE: College, Degree, Specialization tables (reference data)
    
    console.log('🔑 Deleting password reset tokens...');
    await prisma.passwordResetToken.deleteMany({});

    console.log('🔑 Deleting email verification tokens...');
    await prisma.emailVerificationToken.deleteMany({});
    
    console.log('📧 Deleting WhatsApp notifications...');
    await prisma.whatsAppNotification.deleteMany({});

    console.log('❌ Deleting rejection notifications...');
    await prisma.rejectionNotification.deleteMany({});
    
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
    
    // Verify reference data is preserved
    console.log('\n🛡️  Verifying reference data preservation...');
    const collegeCount = await prisma.college.count();
    const degreeCount = await prisma.degree.count();
    const specializationCount = await prisma.specialization.count();
    
    console.log(`   - Colleges preserved: ${collegeCount}`);
    console.log(`   - Degrees preserved: ${degreeCount}`);
    console.log(`   - Specializations preserved: ${specializationCount}`);
    
    console.log('\n✅ All user data and events have been successfully deleted!');
    console.log('✅ Reference data (colleges, degrees, specializations) preserved.');
    
  } catch (error) {
    console.error('❌ Error deleting data:', error);
    throw error;
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Run the deletion
deleteAllData()
  .then(() => {
    console.log('\n🎯 Database cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Database cleanup failed:', error);
    process.exit(1);
  }); 