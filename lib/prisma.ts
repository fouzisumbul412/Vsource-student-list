// lib/prisma.ts
import { PrismaClient } from '@/lib/generated/prisma/client'; // your generated client path
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create a pg pool using your DATABASE_URL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create the Prisma adapter
const adapter = new PrismaPg(pool);

// Global cache to avoid multiple Prisma instances in dev
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter, // 👈 THIS is the required argument
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
