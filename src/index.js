const http = require('http');
const app = require('./app');
const { initSocket } = require('./socket');
const { scheduleJobs } = require('./services/scheduler');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Get prisma instance from app
const prisma = app.prisma;

initSocket(server, prisma);

server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  scheduleJobs(prisma);
  
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit();
  });
});