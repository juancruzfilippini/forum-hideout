import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../src/lib/password";

const databaseUrl = process.env.DATABASE_URL ?? "mysql://root:root@localhost:3306/forum_hideout";

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(getDatabaseUrl(databaseUrl)),
});

function getDatabaseUrl(databaseUrl: string) {
  const url = new URL(databaseUrl);

  url.searchParams.set("connectionLimit", process.env.DATABASE_CONNECTION_LIMIT ?? "5");
  url.searchParams.set("connectTimeout", process.env.DATABASE_CONNECT_TIMEOUT ?? "10000");
  url.searchParams.set("acquireTimeout", process.env.DATABASE_POOL_TIMEOUT ?? "10000");
  url.searchParams.set("initializationTimeout", process.env.DATABASE_POOL_TIMEOUT ?? "10000");

  return url.toString();
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
      body: "Este espacio queda listo para organizar avisos, soporte, sugerencias y conversaciones de la comunidad.",
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
