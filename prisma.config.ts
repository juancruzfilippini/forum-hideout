import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { defineConfig } from "prisma/config";

loadEnvFile();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "mysql://root:root@localhost:3306/forum_hideout",
  },
});

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
