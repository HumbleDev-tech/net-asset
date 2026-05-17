import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Cache both pool and client in globalThis to prevent memory leaks
// during hot-reload in development (each reload would create a new Pool).
const g = globalThis as unknown as {
  __pool: Pool | undefined;
  __prisma: PrismaClient | undefined;
};

if (!g.__pool) {
  g.__pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 2,           // Limit connections — we don't need 10 for dev
    idleTimeoutMillis: 30000,
  });
}

if (!g.__prisma) {
  const adapter = new PrismaPg(g.__pool);
  g.__prisma = new PrismaClient({ adapter } as any);
}

export const prisma = g.__prisma;
