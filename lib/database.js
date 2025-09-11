/**
 * Database connection and utilities
 */

import { PrismaClient } from '@prisma/client';

// Prevent multiple instances in development
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Database health check
export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Initialize database (create tables if they don't exist)
export async function initializeDatabase() {
  try {
    // Test connection
    await checkDatabaseConnection();
    
    // Check if tables exist
    const userCount = await prisma.user.count();
    console.log(`📊 Database initialized: ${userCount} users`);
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.log('💡 Run: npx prisma db push');
    return false;
  }
}

// Graceful shutdown
export async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log('🔌 Database disconnected');
}

// Export default instance
export default prisma;