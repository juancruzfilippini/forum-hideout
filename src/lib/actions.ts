"use server";

import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { extname, join } from "node:path";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSession, destroySession, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { canAccessAdmin, canAssignRole, canManageUser } from "@/lib/permissions";
import { appendSlugSuffix, slugify } from "@/lib/slug";
import {
  getFormString,
  loginSchema,
  moderationSchema,
  moveTopicSchema,
  passwordChangeSchema,
  profileSchema,
  registerSchema,
  replySchema,
  topicSchema,
  userRoleSchema,
  userStatusSchema,
} from "@/lib/validations";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const AVATAR_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

function sanitizeReturnTo(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/admin";
}

function withQuery(path: string, key: string, value: string) {
  return `${path}${path.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(value)}`;
}

async function requireAdminUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!canAccessAdmin(user.role)) redirect("/");
  return user;
}

export async function registerAction(formData: FormData) {
  if (!prisma) redirect("/register?error=db");

  const parsed = registerSchema.safeParse({
    name: getFormString(formData, "name"),
    email: getFormString(formData, "email"),
    password: getFormString(formData, "password"),
  });

  if (!parsed.success) redirect("/register?error=invalid");

  const existingUser = await prisma.user.findUnique({
    where: {
      email: parsed.data.email,
    },
  });

  if (existingUser) redirect("/register?error=exists");

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
    },
  });

  await createSession(user.id);
  redirect("/");
}

export async function loginAction(formData: FormData) {
  if (!prisma) redirect("/login?error=db");

  const parsed = loginSchema.safeParse({
    email: getFormString(formData, "email"),
    password: getFormString(formData, "password"),
  });

  if (!parsed.success) redirect("/login?error=invalid");

  const user = await prisma.user.findUnique({
    where: {
      email: parsed.data.email,
    },
  });

  if (!user || !user.active) redirect("/login?error=invalid");

  const passwordMatches = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!passwordMatches) redirect("/login?error=invalid");

  await createSession(user.id);
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function createTopicAction(formData: FormData) {
  if (!prisma) redirect("/new-topic?error=db");

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = topicSchema.safeParse({
    categoryId: getFormString(formData, "categoryId"),
    title: getFormString(formData, "title"),
    body: getFormString(formData, "body"),
  });

  if (!parsed.success) redirect("/new-topic?error=invalid");

  const category = await prisma.category.findUnique({
    where: {
      id: parsed.data.categoryId,
    },
  });

  if (!category) redirect("/new-topic?error=category");

  const baseSlug = slugify(parsed.data.title);
  const topic = await prisma.topic.create({
    data: {
      slug: appendSlugSuffix(baseSlug, randomUUID()),
      title: parsed.data.title,
      body: parsed.data.body,
      authorId: user.id,
      categoryId: category.id,
    },
  });

  revalidatePath("/");
  revalidatePath(`/categories/${category.slug}`);
  redirect(`/topics/${topic.slug}`);
}

export async function createReplyAction(formData: FormData) {
  if (!prisma) redirect("/");

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = replySchema.safeParse({
    topicId: getFormString(formData, "topicId"),
    body: getFormString(formData, "body"),
  });

  if (!parsed.success) redirect("/");

  const topic = await prisma.topic.findUnique({
    where: {
      id: parsed.data.topicId,
    },
    include: {
      category: true,
    },
  });

  if (!topic || topic.status !== "OPEN") redirect("/");

  await prisma.post.create({
    data: {
      body: parsed.data.body,
      authorId: user.id,
      topicId: topic.id,
    },
  });

  await prisma.topic.update({
    where: {
      id: topic.id,
    },
    data: {
      updatedAt: new Date(),
    },
  });

  revalidatePath("/");
  revalidatePath(`/categories/${topic.category.slug}`);
  revalidatePath(`/topics/${topic.slug}`);
  redirect(`/topics/${topic.slug}`);
}

export async function updateProfileAction(formData: FormData) {
  if (!prisma) redirect("/profile?profileError=db");

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = profileSchema.safeParse({
    name: getFormString(formData, "name"),
  });

  if (!parsed.success) redirect("/profile?profileError=invalid");

  const avatar = formData.get("avatar");
  let avatarUrl: string | undefined;

  if (avatar instanceof File && avatar.size > 0) {
    if (avatar.size > MAX_AVATAR_SIZE) redirect("/profile?profileError=avatar-size");

    const extension = AVATAR_TYPES[avatar.type] ?? extname(avatar.name).toLowerCase();
    if (!Object.values(AVATAR_TYPES).includes(extension)) {
      redirect("/profile?profileError=avatar-type");
    }

    const uploadsDir = join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(uploadsDir, { recursive: true });

    const filename = `${user.id}-${randomUUID()}${extension}`;
    const bytes = Buffer.from(await avatar.arrayBuffer());
    await writeFile(join(uploadsDir, filename), bytes);
    avatarUrl = `/uploads/avatars/${filename}`;
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      name: parsed.data.name,
      ...(avatarUrl ? { avatarUrl } : {}),
    },
  });

  revalidatePath("/");
  revalidatePath("/profile");
  redirect("/profile?profile=updated");
}

export async function changePasswordAction(formData: FormData) {
  if (!prisma) redirect("/profile?passwordError=db");

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = passwordChangeSchema.safeParse({
    currentPassword: getFormString(formData, "currentPassword"),
    newPassword: getFormString(formData, "newPassword"),
    confirmPassword: getFormString(formData, "confirmPassword"),
  });

  if (!parsed.success) redirect("/profile?passwordError=invalid");

  const storedUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      passwordHash: true,
    },
  });

  if (!storedUser) redirect("/login");

  const passwordMatches = await verifyPassword(parsed.data.currentPassword, storedUser.passwordHash);
  if (!passwordMatches) redirect("/profile?passwordError=current");

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordHash: await hashPassword(parsed.data.newPassword),
    },
  });

  redirect("/profile?password=changed");
}

export async function updateUserRoleAction(formData: FormData) {
  if (!prisma) redirect("/admin?error=db");

  const admin = await requireAdminUser();
  const returnTo = sanitizeReturnTo(getFormString(formData, "returnTo"));
  const parsed = userRoleSchema.safeParse({
    userId: getFormString(formData, "userId"),
    role: getFormString(formData, "role"),
  });

  if (!parsed.success) redirect(withQuery(returnTo, "error", "invalid-role"));

  if (parsed.data.userId === admin.id && !canAccessAdmin(parsed.data.role)) {
    redirect(withQuery(returnTo, "error", "self-role"));
  }

  const target = await prisma.user.findUnique({
    where: {
      id: parsed.data.userId,
    },
    select: {
      role: true,
    },
  });

  if (!target) redirect(withQuery(returnTo, "error", "invalid-user"));
  if (!canAssignRole(admin.role, target.role, parsed.data.role)) {
    redirect(withQuery(returnTo, "error", "role-permission"));
  }

  await prisma.user.update({
    where: {
      id: parsed.data.userId,
    },
    data: {
      role: parsed.data.role,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect(withQuery(returnTo, "users", "updated"));
}

export async function deactivateUserAction(formData: FormData) {
  if (!prisma) redirect("/admin?error=db");

  const admin = await requireAdminUser();
  const returnTo = sanitizeReturnTo(getFormString(formData, "returnTo"));
  const parsed = userStatusSchema.safeParse({
    userId: getFormString(formData, "userId"),
    reason: getFormString(formData, "reason"),
  });

  if (!parsed.success) redirect(withQuery(returnTo, "error", "invalid-user"));
  if (parsed.data.userId === admin.id) redirect(withQuery(returnTo, "error", "self-deactivate"));

  const target = await prisma.user.findUnique({
    where: {
      id: parsed.data.userId,
    },
    select: {
      role: true,
    },
  });

  if (!target) redirect(withQuery(returnTo, "error", "invalid-user"));
  if (!canManageUser(admin.role, target.role)) redirect(withQuery(returnTo, "error", "user-permission"));

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: parsed.data.userId,
      },
      data: {
        active: false,
        deactivatedAt: new Date(),
        deactivationReason: parsed.data.reason || "Baja logica desde administracion.",
      },
    }),
    prisma.session.deleteMany({
      where: {
        userId: parsed.data.userId,
      },
    }),
  ]);

  revalidatePath("/admin");
  redirect(withQuery(returnTo, "users", "updated"));
}

export async function reactivateUserAction(formData: FormData) {
  if (!prisma) redirect("/admin?error=db");

  const admin = await requireAdminUser();
  const returnTo = sanitizeReturnTo(getFormString(formData, "returnTo"));
  const parsed = userStatusSchema.safeParse({
    userId: getFormString(formData, "userId"),
    reason: getFormString(formData, "reason"),
  });

  if (!parsed.success) redirect(withQuery(returnTo, "error", "invalid-user"));

  const target = await prisma.user.findUnique({
    where: {
      id: parsed.data.userId,
    },
    select: {
      role: true,
    },
  });

  if (!target) redirect(withQuery(returnTo, "error", "invalid-user"));
  if (!canManageUser(admin.role, target.role)) redirect(withQuery(returnTo, "error", "user-permission"));

  await prisma.user.update({
    where: {
      id: parsed.data.userId,
    },
    data: {
      active: true,
      deactivatedAt: null,
      deactivationReason: null,
    },
  });

  revalidatePath("/admin");
  redirect(withQuery(returnTo, "users", "updated"));
}

export async function hideTopicAction(formData: FormData) {
  if (!prisma) redirect("/admin?error=db");

  await requireAdminUser();
  const parsed = moderationSchema.safeParse({
    id: getFormString(formData, "id"),
    reason: getFormString(formData, "reason"),
  });
  const returnTo = sanitizeReturnTo(getFormString(formData, "returnTo"));

  if (!parsed.success) redirect(withQuery(returnTo, "error", "invalid-topic"));

  const topic = await prisma.topic.update({
    where: {
      id: parsed.data.id,
    },
    data: {
      status: "ARCHIVED",
      hiddenReason: parsed.data.reason || "Oculto por administracion.",
    },
    select: {
      slug: true,
      category: {
        select: {
          slug: true,
        },
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/categories/${topic.category.slug}`);
  revalidatePath(`/topics/${topic.slug}`);
  redirect(returnTo);
}

export async function restoreTopicAction(formData: FormData) {
  if (!prisma) redirect("/admin?error=db");

  await requireAdminUser();
  const parsed = moderationSchema.safeParse({
    id: getFormString(formData, "id"),
    reason: getFormString(formData, "reason"),
  });
  const returnTo = sanitizeReturnTo(getFormString(formData, "returnTo"));

  if (!parsed.success) redirect(withQuery(returnTo, "error", "invalid-topic"));

  const topic = await prisma.topic.update({
    where: {
      id: parsed.data.id,
    },
    data: {
      status: "OPEN",
      hiddenReason: null,
    },
    select: {
      slug: true,
      category: {
        select: {
          slug: true,
        },
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/categories/${topic.category.slug}`);
  revalidatePath(`/topics/${topic.slug}`);
  redirect(returnTo);
}

export async function moveTopicAction(formData: FormData) {
  if (!prisma) redirect("/admin?error=db");

  await requireAdminUser();
  const returnTo = sanitizeReturnTo(getFormString(formData, "returnTo"));
  const parsed = moveTopicSchema.safeParse({
    id: getFormString(formData, "id"),
    categoryId: getFormString(formData, "categoryId"),
  });

  if (!parsed.success) redirect(withQuery(returnTo, "error", "invalid-topic"));

  const [topic, category] = await Promise.all([
    prisma.topic.findUnique({
      where: {
        id: parsed.data.id,
      },
      select: {
        slug: true,
        category: {
          select: {
            slug: true,
          },
        },
      },
    }),
    prisma.category.findUnique({
      where: {
        id: parsed.data.categoryId,
      },
      select: {
        slug: true,
      },
    }),
  ]);

  if (!topic || !category) redirect(withQuery(returnTo, "error", "invalid-topic"));

  await prisma.topic.update({
    where: {
      id: parsed.data.id,
    },
    data: {
      categoryId: parsed.data.categoryId,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/categories/${topic.category.slug}`);
  revalidatePath(`/categories/${category.slug}`);
  revalidatePath(`/topics/${topic.slug}`);
  redirect(returnTo);
}

export async function hidePostAction(formData: FormData) {
  if (!prisma) redirect("/admin?error=db");

  await requireAdminUser();
  const parsed = moderationSchema.safeParse({
    id: getFormString(formData, "id"),
    reason: getFormString(formData, "reason"),
  });
  const returnTo = sanitizeReturnTo(getFormString(formData, "returnTo"));

  if (!parsed.success) redirect(withQuery(returnTo, "error", "invalid-post"));

  const post = await prisma.post.update({
    where: {
      id: parsed.data.id,
    },
    data: {
      hidden: true,
      hiddenReason: parsed.data.reason || "Respuesta oculta por administracion.",
    },
    select: {
      topic: {
        select: {
          slug: true,
          category: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/categories/${post.topic.category.slug}`);
  revalidatePath(`/topics/${post.topic.slug}`);
  redirect(returnTo);
}

export async function restorePostAction(formData: FormData) {
  if (!prisma) redirect("/admin?error=db");

  await requireAdminUser();
  const parsed = moderationSchema.safeParse({
    id: getFormString(formData, "id"),
    reason: getFormString(formData, "reason"),
  });
  const returnTo = sanitizeReturnTo(getFormString(formData, "returnTo"));

  if (!parsed.success) redirect(withQuery(returnTo, "error", "invalid-post"));

  const post = await prisma.post.update({
    where: {
      id: parsed.data.id,
    },
    data: {
      hidden: false,
      hiddenReason: null,
    },
    select: {
      topic: {
        select: {
          slug: true,
          category: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/categories/${post.topic.category.slug}`);
  revalidatePath(`/topics/${post.topic.slug}`);
  redirect(returnTo);
}
