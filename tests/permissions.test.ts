import { describe, expect, it } from "vitest";

import { canAccessAdmin, canManageUser } from "@/lib/permissions";

describe("admin permissions", () => {
  it("allows only the two highest roles", () => {
    expect(canAccessAdmin("STAFF")).toBe(true);
    expect(canAccessAdmin("ADMIN_PLUS")).toBe(true);
    expect(canAccessAdmin("ADMIN")).toBe(false);
    expect(canAccessAdmin("VIP_PLUS")).toBe(false);
    expect(canAccessAdmin("MEMBER")).toBe(false);
  });

  it("lets staff manage everyone and admin+ only lower roles", () => {
    expect(canManageUser("STAFF", "STAFF")).toBe(true);
    expect(canManageUser("STAFF", "ADMIN_PLUS")).toBe(true);
    expect(canManageUser("ADMIN_PLUS", "ADMIN")).toBe(true);
    expect(canManageUser("ADMIN_PLUS", "VIP_PLUS")).toBe(true);
    expect(canManageUser("ADMIN_PLUS", "ADMIN_PLUS")).toBe(false);
    expect(canManageUser("ADMIN_PLUS", "STAFF")).toBe(false);
    expect(canManageUser("ADMIN", "MEMBER")).toBe(false);
  });
});
