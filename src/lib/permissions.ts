export const ADMIN_ROLES = ["ADMIN_PLUS", "STAFF"] as const;

export const USER_ROLES = ["MEMBER", "VIP", "VIP_PLUS", "ADMIN", "ADMIN_PLUS", "STAFF"] as const;

export type ForumRole = (typeof USER_ROLES)[number];

const ROLE_RANK: Record<ForumRole, number> = {
  MEMBER: 10,
  VIP: 20,
  VIP_PLUS: 30,
  ADMIN: 40,
  ADMIN_PLUS: 50,
  STAFF: 60,
};

export function canAccessAdmin(role?: string | null) {
  return role === "ADMIN_PLUS" || role === "STAFF";
}

export function isForumRole(role: string): role is ForumRole {
  return USER_ROLES.includes(role as ForumRole);
}

export function getRoleRank(role: string) {
  return isForumRole(role) ? ROLE_RANK[role] : 0;
}

export function canManageUser(actorRole: string, targetRole: string) {
  if (actorRole === "STAFF") return true;
  if (actorRole === "ADMIN_PLUS") return getRoleRank(targetRole) < getRoleRank(actorRole);
  return false;
}

export function canAssignRole(actorRole: string, targetRole: string, nextRole: string) {
  if (actorRole === "STAFF") return true;
  if (actorRole !== "ADMIN_PLUS") return false;
  return getRoleRank(targetRole) < getRoleRank(actorRole) && getRoleRank(nextRole) < getRoleRank(actorRole);
}
