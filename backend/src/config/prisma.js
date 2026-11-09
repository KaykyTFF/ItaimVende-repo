import { PrismaClient } from '@prisma/client';
import { ENV } from './env.js';

const prisma = new PrismaClient({
  datasourceUrl: ENV.DATABASE_URL,
});

export default prisma;
