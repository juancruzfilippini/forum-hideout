import Image from "next/image";
import { User } from "lucide-react";

import { cn } from "@/lib/utils";

type Role = "MEMBER" | "VIP" | "VIP_PLUS" | "ADMIN" | "ADMIN_PLUS" | "STAFF" | string;

const roleStyles: Record<string, { className: string; label: string }> = {
  MEMBER: {
    className: "text-stone-300",
    label: "Miembro",
  },
  VIP: {
    className: "text-violet-400",
    label: "VIP",
  },
  VIP_PLUS: {
    className: "text-pink-400",
    label: "VIP+",
  },
  ADMIN: {
    className: "text-[#b12b3f]",
    label: "Admin",
  },
  ADMIN_PLUS: {
    className: "text-red-400",
    label: "Admin+",
  },
  STAFF: {
    className: "text-lime-300 drop-shadow-[0_0_8px_rgba(190,242,100,0.45)]",
    label: "Staff",
  },
};

function getRoleStyle(role: Role) {
  return roleStyles[role] ?? roleStyles.MEMBER;
}

export function getRoleLabel(role: Role) {
  return getRoleStyle(role).label;
}

function getDecoratedName(name: string, role: Role) {
  if (role === "STAFF") return `⚡${name}⚡`;
  if (role === "VIP_PLUS" || role === "ADMIN_PLUS") return `${name}+`;
  return name;
}

export function UserName({
  name,
  role,
  className,
}: {
  name: string;
  role: Role;
  className?: string;
}) {
  const style = getRoleStyle(role);

  return <span className={cn("font-semibold", style.className, className)}>{getDecoratedName(name, role)}</span>;
}

export function UserAvatar({
  name,
  avatarUrl,
  className,
}: {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-stone-700 bg-stone-900 text-stone-400",
        className,
      )}
    >
      {avatarUrl ? (
        <Image alt={`Avatar de ${name}`} className="object-cover" fill sizes="80px" src={avatarUrl} />
      ) : (
        <User aria-hidden="true" size={18} />
      )}
    </span>
  );
}

export function RoleBadge({ role }: { role: Role }) {
  const style = getRoleStyle(role);

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-sm border border-current/30 px-2 py-0.5 text-xs font-bold uppercase",
        style.className,
      )}
    >
      {style.label}
    </span>
  );
}
