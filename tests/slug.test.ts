import { describe, expect, it } from "vitest";

import { appendSlugSuffix, slugify } from "@/lib/slug";

describe("slugify", () => {
  it("normalizes accented titles", () => {
    expect(slugify("Conexion y sugerencias para el servidor")).toBe(
      "conexion-y-sugerencias-para-el-servidor",
    );
  });

  it("uses a fallback for empty titles", () => {
    expect(slugify("!!!")).toBe("tema");
  });
});

describe("appendSlugSuffix", () => {
  it("adds a compact suffix", () => {
    expect(appendSlugSuffix("mi-tema", "ABCDEF123456")).toBe("mi-tema-abcdef");
  });
});
