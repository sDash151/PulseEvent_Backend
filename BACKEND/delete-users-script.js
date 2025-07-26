const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteNonHostUsers() {
  console.log('🚀 Starting safe deletion of non-host users...');
  console.log('🛡️  Reference data (colleges, degrees, specializations) will be preserved.');
  
  try {
    // Step 1: Get all users
    const allUsers = await prisma.user.findMany({
      include: {
        events: true, // Events they host
        rsvps: true,
        feedbacks: true,
        registrations: true,
        waitingList: true,
        sentInvitations: true,
        receivedInvitations: true,
        whatsAppNotifications: true,
        rejectionNotifications: true,
        emailVerificationTokens: true,
        passwordResetTokens: true
      }
    });

    console.log(`📊 Found ${allUsers.length} total users`);

    // Step 2: Identify hosts (users who have created events)
    const hosts = allUsers.filter(user => user.events.length > 0);
    const nonHosts = allUsers.filter(user => user.events.length === 0);

    // Define nonHostUserIds early for use in all queries
    const nonHostUserIds = nonHosts.map(user => user.id);

    console.log(`👑 Found ${hosts.length} hosts:`);
    hosts.forEach(host => {
      console.log(`   - ${host.name} (${host.email}) - ${host.events.length} events`);
    });

    console.log(`👥 Found ${nonHosts.length} non-host users to delete:`);
    nonHosts.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });

    if (nonHosts.length === 0) {
      console.log('✅ No non-host users to delete!');
      return;
    }

    // Step 3: Show what will be deleted
    console.log('\n📋 Data that will be deleted:');
    const totalRSVPs = nonHosts.reduce((sum, user) => sum + user.rsvps.length, 0);
    const totalFeedbacks = nonHosts.reduce((sum, user) => sum + user.feedbacks.length, 0);
    const totalRegistrations = nonHosts.reduce((sum, user) => sum + user.registrations.length, 0);
    const totalWaitingList = nonHosts.reduce((sum, user) => sum + user.waitingList.length, 0);
    const totalInvitations = nonHosts.reduce((sum, user) => sum + user.sentInvitations.length + user.receivedInvitations.length, 0);
    const totalWhatsAppNotifications = nonHosts.reduce((sum, user) => sum + user.whatsAppNotifications.length, 0);
    const totalRejectionNotifications = nonHosts.reduce((sum, user) => sum + user.rejectionNotifications.length, 0);
    const totalEmailTokens = nonHosts.reduce((sum, user) => sum + user.emailVerificationTokens.length, 0);
    const totalPasswordTokens = nonHosts.reduce((sum, user) => sum + user.passwordResetTokens.length, 0);

    console.log(`   - ${totalRSVPs} RSVPs`);
    console.log(`   - ${totalFeedbacks} feedbacks`);
    console.log(`   - ${totalRegistrations} registrations`);
    console.log(`   - ${totalWaitingList} waiting list entries`);
    console.log(`   - ${totalInvitations} invitations`);
    console.log(`   - ${totalWhatsAppNotifications} WhatsApp notifications`);
    console.log(`   - ${totalRejectionNotifications} rejection notifications`);
    console.log(`   - ${totalEmailTokens} email verification tokens`);
    console.log(`   - ${totalPasswordTokens} password reset tokens`);
    console.log(`   - ${nonHosts.length} user accounts`);

    console.log('\n🛡️  Data that will be preserved:');
    console.log('   - All hosts and their events');
    console.log('   - Colleges (reference data)');
    console.log('   - Degrees (reference data)');
    console.log('   - Specializations (reference data)');

    // Step 4: Confirmation prompt
    console.log('\n⚠️  WARNING: This action cannot be undone!');
    console.log('Type "DELETE" to confirm deletion of all non-host users:');
    
    // For automated execution, we'll proceed with a safety check
    const shouldProceed = process.argv.includes('--confirm');
    
    if (!shouldProceed) {
      console.log('\n❌ Deletion cancelled. Add --confirm flag to proceed.');
      console.log('Example: node delete-users-script.js --confirm');
      return;
    }

    console.log('\n🗑️  Proceeding with deletion...');

    // Step 5: Delete in correct order to maintain referential integrity
    // PRESERVE: College, Degree, Specialization tables (reference data)

    // Delete in order of dependencies (child records first)
    console.log('1. Deleting WhatsApp notifications...');
    await prisma.whatsAppNotification.deleteMany({
      where: { userId: { in: nonHostUserIds } }
    });

    console.log('2. Deleting rejection notifications...');
    await prisma.rejectionNotification.deleteMany({
      where: { userId: { in: nonHostUserIds } }
    });

    console.log('3. Deleting waiting list entries...');
    await prisma.waitingList.deleteMany({
      where: { userId: { in: nonHostUserIds } }
    });

    // Delete participants from registrations
    console.log('4. Deleting participants (from registrations)...');
    // First get all registration IDs for non-host users
    const registrationIds = await prisma.registration.findMany({
      where: { userId: { in: nonHostUserIds } },
      select: { id: true }
    });
    if (registrationIds.length > 0) {
      await prisma.participant.deleteMany({
        where: {
          registrationId: {
            in: registrationIds.map(r => r.id)
          }
        }
      });
    }

    console.log('5. Deleting registrations...');
    await prisma.registration.deleteMany({
      where: { userId: { in: nonHostUserIds } }
    });

    console.log('6. Deleting feedbacks...');
    await prisma.feedback.deleteMany({
      where: { userId: { in: nonHostUserIds } }
    });

    console.log('7. Deleting RSVPs...');
    await prisma.rsvp.deleteMany({
      where: { userId: { in: nonHostUserIds } }
    });

    console.log('8. Deleting invitations...');
    await prisma.invitation.deleteMany({
      where: { 
        OR: [
          { invitedById: { in: nonHostUserIds } },
          { invitedUserId: { in: nonHostUserIds } }
        ]
      }
    });

    console.log('9. Deleting email verification tokens...');
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: { in: nonHostUserIds } }
    });

    console.log('10. Deleting password reset tokens...');
    await prisma.passwordResetToken.deleteMany({
      where: { userId: { in: nonHostUserIds } }
    });

    console.log('11. Deleting non-host users...');
    await prisma.user.deleteMany({
      where: { id: { in: nonHostUserIds } }
    });

    // Step 6: Verification
    console.log('\n✅ Deletion completed!');
    
    const remainingUsers = await prisma.user.findMany({
      include: {
        events: true,
        rsvps: true,
        feedbacks: true,
        registrations: true,
        waitingList: true,
        sentInvitations: true,
        receivedInvitations: true,
        whatsAppNotifications: true
      }
    });

    console.log(`\n📊 Final user count: ${remainingUsers.length}`);
    console.log('👑 Remaining hosts:');
    remainingUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.events.length} events`);
    });

    // Verify no orphaned data
    const orphanedRSVPs = await prisma.rsvp.count();
    const orphanedFeedbacks = await prisma.feedback.count();
    const orphanedRegistrations = await prisma.registration.count();
    const orphanedWaitingList = await prisma.waitingList.count();

    console.log('\n🔍 Data integrity check:');
    console.log(`   - RSVPs: ${orphanedRSVPs} (should be 0)`);
    console.log(`   - Feedbacks: ${orphanedFeedbacks} (should be 0)`);
    console.log(`   - Registrations: ${orphanedRegistrations} (should be 0)`);
    console.log(`   - Waiting list: ${orphanedWaitingList} (should be 0)`);

    // Verify reference data is preserved
    console.log('\n🛡️  Reference data preservation check:');
    const collegeCount = await prisma.college.count();
    const degreeCount = await prisma.degree.count();
    const specializationCount = await prisma.specialization.count();
    
    console.log(`   - Colleges preserved: ${collegeCount}`);
    console.log(`   - Degrees preserved: ${degreeCount}`);
    console.log(`   - Specializations preserved: ${specializationCount}`);

    if (orphanedRSVPs === 0 && orphanedFeedbacks === 0 && 
        orphanedRegistrations === 0 && orphanedWaitingList === 0) {
      console.log('✅ All data integrity checks passed!');
    } else {
      console.log('⚠️  Some orphaned data detected. Manual cleanup may be needed.');
    }

  } catch (error) {
    console.error('❌ Error during deletion:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
deleteNonHostUsers()
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  }); 