import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import mariadb from "mariadb";

const DEFAULT_DATABASE_URL = "mysql://root:root@localhost:3306/forum_hideout";

loadEnvFile();

const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
const parsed = new URL(databaseUrl);

if (!["mysql:", "mariadb:"].includes(parsed.protocol)) {
  throw new Error(
    `DATABASE_URL must use mysql:// or mariadb:// for this Laragon setup. Current protocol: ${parsed.protocol}`,
  );
}

const database = parsed.pathname.replace(/^\//, "");

if (!database) {
  throw new Error("DATABASE_URL must include a database name, for example /forum_hideout.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

async function main() {
  const connection = await mariadb.createConnection({
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    multipleStatements: false,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database.replaceAll("`", "``")}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    console.log(`Database ready: ${database}`);
  } finally {
    await connection.end();
  }
}

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  const contents = readFileSync(envPath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");

    process.env[key] ??= value;
  }
}
