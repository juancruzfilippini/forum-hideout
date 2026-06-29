import "server-only";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getDatabaseUrl(databaseUrl: string) {
  const url = new URL(databaseUrl);

  url.searchParams.set("connectionLimit", process.env.DATABASE_CONNECTION_LIMIT ?? "5");
  url.searchParams.set("connectTimeout", process.env.DATABASE_CONNECT_TIMEOUT ?? "10000");
  url.searchParams.set("acquireTimeout", process.env.DATABASE_POOL_TIMEOUT ?? "10000");
  url.searchParams.set("initializationTimeout", process.env.DATABASE_POOL_TIMEOUT ?? "10000");

  return url.toString();
}

export const prisma =
  process.env.DATABASE_URL && process.env.NODE_ENV !== "test"
    ? (globalForPrisma.prisma ??
      new PrismaClient({
        adapter: new PrismaMariaDb(getDatabaseUrl(process.env.DATABASE_URL)),
      }))
    : null;

if (prisma) {
  globalForPrisma.prisma = prisma;
}
