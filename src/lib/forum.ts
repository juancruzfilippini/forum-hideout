import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { ForumRole } from "@/lib/permissions";

const CATEGORY_PAGE_SIZE = 10;
const ADMIN_USERS_PAGE_SIZE = 5;
const ADMIN_TOPICS_PAGE_SIZE = 10;

function buildTopicSearchWhere(query: string): Prisma.TopicWhereInput {
  const trimmed = query.trim();
  if (!trimmed) return {};

  return {
    OR: [
      {
        title: {
          contains: trimmed,
        },
      },
      {
        body: {
          contains: trimmed,
        },
      },
    ],
  };
}

const visibleTopicWhere = {
  status: {
    not: "ARCHIVED",
  },
} satisfies Prisma.TopicWhereInput;

const topicListInclude = {
  author: {
    select: {
      name: true,
      role: true,
    },
  },
  category: {
    select: {
      name: true,
      slug: true,
    },
  },
  _count: {
    select: {
      posts: {
        where: {
          hidden: false,
        },
      },
    },
  },
} satisfies Prisma.TopicInclude;

export async function getForumHome() {
  if (!prisma) return null;

  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          topics: {
            where: visibleTopicWhere,
          },
        },
      },
      topics: {
        where: visibleTopicWhere,
        orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
        take: 1,
        include: {
          author: {
            select: {
              name: true,
              role: true,
            },
          },
        },
      },
    },
  });
}

export async function searchTopics(query: string, categorySlug?: string) {
  if (!prisma) return [];

  const trimmed = query.trim();
  if (!trimmed) return [];

  return prisma.topic.findMany({
    where: {
      ...visibleTopicWhere,
      ...buildTopicSearchWhere(trimmed),
      ...(categorySlug
        ? {
            category: {
              slug: categorySlug,
            },
          }
        : {}),
    },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    take: 20,
    include: topicListInclude,
  });
}

export async function getRecentTopics() {
  if (!prisma) return [];

  return prisma.topic.findMany({
    where: visibleTopicWhere,
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    take: 8,
    include: topicListInclude,
  });
}

export async function getCategoriesForSelect() {
  if (!prisma) return [];

  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

export async function getCategoryPage(slug: string, query = "", page = 1) {
  if (!prisma) return null;

  const searchWhere = buildTopicSearchWhere(query);
  const currentPage = Math.max(1, page);

  const category = await prisma.category.findUnique({
    where: {
      slug,
    },
  });

  if (!category) return null;

  const where = {
    categoryId: category.id,
    ...visibleTopicWhere,
    ...searchWhere,
  } satisfies Prisma.TopicWhereInput;

  const topicCount = await prisma.topic.count({ where });
  const totalPages = Math.max(1, Math.ceil(topicCount / CATEGORY_PAGE_SIZE));
  const effectivePage = Math.min(currentPage, totalPages);

  const topics = await prisma.topic.findMany({
      where,
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
      skip: (effectivePage - 1) * CATEGORY_PAGE_SIZE,
      take: CATEGORY_PAGE_SIZE,
      include: {
        author: {
          select: {
            name: true,
            role: true,
          },
        },
        _count: {
          select: {
            posts: {
              where: {
                hidden: false,
              },
            },
          },
        },
      },
    });

  return {
    ...category,
    topics,
    topicCount,
    currentPage: effectivePage,
    totalPages,
  };
}

export type AdminDashboardFilters = {
  userQ?: string;
  userRole?: ForumRole | "";
  userPage?: number;
  topicQ?: string;
  topicPage?: number;
};

export async function getAdminDashboard(filters: AdminDashboardFilters = {}) {
  if (!prisma) return null;

  const userPage = Math.max(1, filters.userPage ?? 1);
  const topicPage = Math.max(1, filters.topicPage ?? 1);
  const userQ = filters.userQ?.trim() ?? "";
  const topicQ = filters.topicQ?.trim() ?? "";

  const userWhere = {
    ...(userQ
      ? {
          OR: [
            {
              name: {
                contains: userQ,
              },
            },
            {
              email: {
                contains: userQ,
              },
            },
          ],
        }
      : {}),
    ...(filters.userRole ? { role: filters.userRole } : {}),
  } satisfies Prisma.UserWhereInput;

  const topicWhere = {
    ...(topicQ
      ? {
          title: {
            contains: topicQ,
          },
        }
      : {}),
  } satisfies Prisma.TopicWhereInput;

  const [userCount, topicCount] = await Promise.all([
    prisma.user.count({ where: userWhere }),
    prisma.topic.count({ where: topicWhere }),
  ]);
  const userTotalPages = Math.max(1, Math.ceil(userCount / ADMIN_USERS_PAGE_SIZE));
  const topicTotalPages = Math.max(1, Math.ceil(topicCount / ADMIN_TOPICS_PAGE_SIZE));
  const effectiveUserPage = Math.min(userPage, userTotalPages);
  const effectiveTopicPage = Math.min(topicPage, topicTotalPages);

  const [users, topics] = await Promise.all([
    prisma.user.findMany({
      where: userWhere,
      orderBy: [{ active: "desc" }, { role: "desc" }, { createdAt: "desc" }],
      skip: (effectiveUserPage - 1) * ADMIN_USERS_PAGE_SIZE,
      take: ADMIN_USERS_PAGE_SIZE,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        active: true,
        deactivatedAt: true,
        deactivationReason: true,
        createdAt: true,
        _count: {
          select: {
            topics: true,
            posts: true,
          },
        },
      },
    }),
    prisma.topic.findMany({
      where: topicWhere,
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      skip: (effectiveTopicPage - 1) * ADMIN_TOPICS_PAGE_SIZE,
      take: ADMIN_TOPICS_PAGE_SIZE,
      include: {
        ...topicListInclude,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    }),
  ]);

  return {
    users,
    topics,
    userPage: effectiveUserPage,
    topicPage: effectiveTopicPage,
    userCount,
    topicCount,
    userTotalPages,
    topicTotalPages,
  };
}

export async function getTopicPage(slug: string, canSeeHidden = false) {
  if (!prisma) return null;

  const topic = await prisma.topic.findUnique({
    where: {
      slug,
    },
    include: {
      author: {
        select: {
          name: true,
          role: true,
          avatarUrl: true,
        },
      },
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      posts: {
        where: canSeeHidden
          ? {}
          : {
              hidden: false,
            },
        orderBy: {
          createdAt: "asc",
        },
        include: {
          author: {
            select: {
              name: true,
              role: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!topic) return null;
  if (topic.status === "ARCHIVED" && !canSeeHidden) return null;

  await prisma.topic.update({
    where: {
      id: topic.id,
    },
    data: {
      views: {
        increment: 1,
      },
    },
  });

  return topic;
}
