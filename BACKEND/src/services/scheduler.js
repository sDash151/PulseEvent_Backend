// backend/src/services/scheduler.js
const cron = require('node-cron');

function scheduleJobs(prisma) {
  // Run every hour: Check for upcoming events
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      
      const upcomingEvents = await prisma.event.findMany({
        where: {
          startTime: { gte: oneHourFromNow, lte: twoHoursFromNow }
        },
        include: { rsvps: { include: { user: true } } }
      });
      
      if (upcomingEvents.length > 0) {
        console.log(`Found ${upcomingEvents.length} upcoming events in the next 1–2 hours`);
      }
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  });
  
  // Run every day at 9am: Check for events starting today
  cron.schedule('0 9 * * *', async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const eventsToday = await prisma.event.findMany({
        where: { startTime: { gte: today, lt: tomorrow } },
        include: { host: true, rsvps: { include: { user: true } } }
      });
      
      if (eventsToday.length > 0) {
        console.log(`Found ${eventsToday.length} events happening today`);
      }
    } catch (error) {
      console.error('Daily scheduler error:', error);
    }
  });
  
  // Run every day at midnight: Clean up old events
  cron.schedule('0 0 * * *', async () => {
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const oldEvents = await prisma.event.findMany({
        where: { endTime: { lt: oneMonthAgo } }
      });
      
      if (oldEvents.length > 0) {
        console.log(`Found ${oldEvents.length} old events to archive`);
      }
    } catch (error) {
      console.error('Cleanup scheduler error:', error);
    }
  });
  
  console.log('Scheduled jobs initialized');
}

module.exports = { scheduleJobs };
