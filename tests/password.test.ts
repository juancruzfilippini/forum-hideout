import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/password";

describe("password hashing", () => {
  it("verifies a matching password", async () => {
    const hash = await hashPassword("hideout-password");

    await expect(verifyPassword("hideout-password", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });
});
