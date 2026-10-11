import { app } from './app';
import { env } from './config/env';
import { prisma } from '@shasthi-guru/database';

const server = app.listen(env.PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`==================================================`);
    console.log(`🚀 Shasthi Guru Dream Campus API Server`);
    console.log(`📡 Listening on: http://localhost:${env.PORT}`);
    console.log(`🔒 Environment:  ${env.NODE_ENV}`);
    console.log(`🛡️  RBAC & Security Enabled`);
    console.log(`🗄️  PostgreSQL Database: Connected`);
    console.log(`==================================================`);
  } catch (error) {
    console.error('Failed to connect to database on startup:', error);
    process.exit(1);
  }
});

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('HTTP server closed and database disconnected.');
  });
});
