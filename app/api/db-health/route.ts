import { existsSync, readFileSync } from "node:fs";

import mariadb from "mariadb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type HealthRow = {
  db?: string;
  version?: string;
};

type DatabaseConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectTimeout: number;
  socketTimeout: number;
  ssl: {
    ca?: string;
    rejectUnauthorized: boolean;
  };
};

function normalizeCaCertificate(value: string | undefined) {
  let certificate = value?.trim();

  if (!certificate) return undefined;

  if (
    (certificate.startsWith('"') && certificate.endsWith('"')) ||
    (certificate.startsWith("'") && certificate.endsWith("'"))
  ) {
    certificate = certificate.slice(1, -1).trim();
  }

  return certificate
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
}

function readCaCertificate() {
  const caFromEnv = normalizeCaCertificate(
    process.env.DATABASE_CA_CERT ?? process.env.TIDB_CA_CERT,
  );
  const caPath = process.env.DATABASE_CA_PATH ?? process.env.TIDB_CA_PATH;
  const caFromFile =
    caPath && existsSync(caPath) ? normalizeCaCertificate(readFileSync(caPath, "utf8")) : undefined;

  return caFromEnv ?? caFromFile;
}

function getDatabaseConfig(): DatabaseConfig {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const url = new URL(process.env.DATABASE_URL);
  const ca = readCaCertificate();

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectTimeout: Number(process.env.DATABASE_CONNECT_TIMEOUT ?? 30000),
    socketTimeout: Number(process.env.DATABASE_SOCKET_TIMEOUT ?? 30000),
    ssl: {
      ...(ca ? { ca } : {}),
      rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false",
    },
  };
}

function getErrorInfo(error: unknown) {
  if (!(error instanceof Error)) {
    return { message: "Unknown error" };
  }

  const details = error as Error & {
    code?: string;
    errno?: number;
    sqlState?: string;
    fatal?: boolean;
    cause?: unknown;
  };

  return {
    message: details.message,
    code: details.code,
    errno: details.errno,
    sqlState: details.sqlState,
    fatal: details.fatal,
    cause: details.cause instanceof Error ? details.cause.message : undefined,
  };
}

function getCaInfo(config: DatabaseConfig | undefined) {
  const ca = config?.ssl.ca;

  return {
    configured: Boolean(ca),
    length: ca?.length ?? 0,
    startsWithBegin: ca?.startsWith("-----BEGIN CERTIFICATE-----") ?? false,
    endsWithEnd: ca?.endsWith("-----END CERTIFICATE-----") ?? false,
    rejectUnauthorized: config?.ssl.rejectUnauthorized ?? null,
  };
}

export async function GET(request: Request) {
  const token = process.env.DB_HEALTH_TOKEN;
  const requestUrl = new URL(request.url);

  if (!token || requestUrl.searchParams.get("token") !== token) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const startedAt = Date.now();
  let config: DatabaseConfig | undefined;
  let connection: Awaited<ReturnType<typeof mariadb.createConnection>> | undefined;

  try {
    config = getDatabaseConfig();

    connection = await mariadb.createConnection(config);
    const rows = await connection.query("SELECT DATABASE() AS db, VERSION() AS version");
    const firstRow = Array.isArray(rows) ? (rows[0] as HealthRow | undefined) : undefined;

    return NextResponse.json({
      ok: true,
      elapsedMs: Date.now() - startedAt,
      host: config.host,
      database: config.database,
      selectedDatabase: firstRow?.db,
      version: firstRow?.version,
      ca: getCaInfo(config),
      vercelRegion: process.env.VERCEL_REGION ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        elapsedMs: Date.now() - startedAt,
        vercelRegion: process.env.VERCEL_REGION ?? null,
        ca: getCaInfo(config),
        error: getErrorInfo(error),
      },
      { status: 500 },
    );
  } finally {
    await connection?.end().catch(() => undefined);
  }
}
