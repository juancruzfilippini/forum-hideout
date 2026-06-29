import "server-only";

import { existsSync, readFileSync } from "node:fs";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getDatabaseConfig(databaseUrl: string): ConstructorParameters<typeof PrismaMariaDb>[0] {
  const url = new URL(databaseUrl);
  const wantsTls =
    url.searchParams.has("sslaccept") ||
    process.env.TIDB_SSL === "true" ||
    url.hostname.includes("tidbcloud.com");

  if (!wantsTls) return databaseUrl;

  const caFromEnv = process.env.TIDB_CA_CERT?.replace(/\\n/g, "\n");
  const caFromFile =
    process.env.TIDB_CA_PATH && existsSync(process.env.TIDB_CA_PATH)
      ? readFileSync(process.env.TIDB_CA_PATH, "utf8")
      : undefined;
  const ca = caFromEnv ?? caFromFile;

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT ?? 5),
    connectTimeout: Number(process.env.DATABASE_CONNECT_TIMEOUT ?? 30000),
    ssl: ca ? { ca, rejectUnauthorized: true } : true,
  };
}

export const prisma =
  process.env.DATABASE_URL && process.env.NODE_ENV !== "test"
    ? (globalForPrisma.prisma ??
      new PrismaClient({
        adapter: new PrismaMariaDb(getDatabaseConfig(process.env.DATABASE_URL)),
      }))
    : null;

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}
