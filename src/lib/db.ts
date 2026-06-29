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
    url.searchParams.get("ssl-mode") === "REQUIRED" ||
    process.env.DATABASE_SSL === "true" ||
    process.env.TIDB_SSL === "true" ||
    url.hostname.includes("aivencloud.com") ||
    url.hostname.includes("tidbcloud.com");

  if (!wantsTls) return databaseUrl;

  const caFromEnv = (process.env.DATABASE_CA_CERT ?? process.env.TIDB_CA_CERT)?.replace(
    /\\n/g,
    "\n",
  );
  const caPath = process.env.DATABASE_CA_PATH ?? process.env.TIDB_CA_PATH;
  const caFromFile = caPath && existsSync(caPath) ? readFileSync(caPath, "utf8") : undefined;
  const ca = caFromEnv ?? caFromFile;
  const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false";

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT ?? 1),
    connectTimeout: Number(process.env.DATABASE_CONNECT_TIMEOUT ?? 30000),
    socketTimeout: Number(process.env.DATABASE_SOCKET_TIMEOUT ?? 30000),
    acquireTimeout: Number(process.env.DATABASE_POOL_TIMEOUT ?? 30000),
    initializationTimeout: Number(process.env.DATABASE_POOL_TIMEOUT ?? 30000),
    minimumIdle: 0,
    ssl: ca ? { ca, rejectUnauthorized } : { rejectUnauthorized },
  };
}

export const prisma =
  process.env.DATABASE_URL && process.env.NODE_ENV !== "test"
    ? (globalForPrisma.prisma ??
      new PrismaClient({
        adapter: new PrismaMariaDb(getDatabaseConfig(process.env.DATABASE_URL)),
      }))
    : null;

if (prisma) {
  globalForPrisma.prisma = prisma;
}
