import { readFileSync } from "node:fs";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../src/lib/password";

const databaseUrl = process.env.DATABASE_URL ?? "mysql://root:root@localhost:3306/forum_hideout";
const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(getDatabaseConfig(databaseUrl)),
});

function getDatabaseConfig(databaseUrl: string): ConstructorParameters<typeof PrismaMariaDb>[0] {
  const url = new URL(databaseUrl);
  const wantsTls =
    url.searchParams.has("sslaccept") ||
    process.env.TIDB_SSL === "true" ||
    url.hostname.includes("tidbcloud.com");

  if (!wantsTls) return databaseUrl;

  const caFromEnv = process.env.TIDB_CA_CERT?.replace(/\\n/g, "\n");
  const caFromFile = process.env.TIDB_CA_PATH ? readFileSync(process.env.TIDB_CA_PATH, "utf8") : undefined;
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

async function main() {
  const staff = await prisma.user.upsert({
    where: { email: "staff@forum.local" },
    update: {
      role: "STAFF",
    },
    create: {
      email: "staff@forum.local",
      name: "Equipo Hideout",
      role: "STAFF",
      passwordHash: await hashPassword("change-me-now"),
    },
  });

  const categories = [
    {
      slug: "anuncios",
      name: "Anuncios",
      description: "Noticias del servidor, eventos y cambios importantes.",
      sortOrder: 10,
    },
    {
      slug: "general",
      name: "General",
      description: "Charla libre de la comunidad.",
      sortOrder: 20,
    },
    {
      slug: "soporte",
      name: "Soporte",
      description: "Reportes, ayuda tecnica y problemas de acceso.",
      sortOrder: 30,
    },
    {
      slug: "sugerencias",
      name: "Sugerencias",
      description: "Ideas para mejorar el servidor y el foro.",
      sortOrder: 40,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  const announcements = await prisma.category.findUniqueOrThrow({
    where: { slug: "anuncios" },
  });

  await prisma.topic.upsert({
    where: { slug: "bienvenidos-al-foro-hideout" },
    update: {},
    create: {
      slug: "bienvenidos-al-foro-hideout",
      title: "Bienvenidos al Foro Hideout",
      body:
        "Este espacio queda listo para organizar avisos, soporte, sugerencias y conversaciones de la comunidad.",
      pinned: true,
      authorId: staff.id,
      categoryId: announcements.id,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
