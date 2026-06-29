import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { cookies } from "next/headers";

import { prisma } from "@/lib/db";

const SESSION_COOKIE = "forum_session";
const SESSION_DAYS = 30;

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  active: boolean;
};

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  if (!prisma) throw new Error("Database is not configured.");

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token && prisma) {
    await prisma.session.deleteMany({
      where: {
        tokenHash: hashSessionToken(token),
      },
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!prisma) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findFirst({
    where: {
      tokenHash: hashSessionToken(token),
      expiresAt: {
        gt: new Date(),
      },
      user: {
        active: true,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatarUrl: true,
          active: true,
        },
      },
    },
  });

  if (!session) return null;

  return {
    ...session.user,
    role: session.user.role,
  };
}
