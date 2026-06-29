const NON_ALPHANUMERIC = /[^a-z0-9]+/g;
const EDGE_DASHES = /^-+|-+$/g;

export function slugify(input: string) {
  const normalized = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(NON_ALPHANUMERIC, "-")
    .replace(EDGE_DASHES, "");

  return normalized || "tema";
}

export function appendSlugSuffix(slug: string, suffix: string) {
  return `${slug}-${suffix.toLowerCase().slice(0, 6)}`;
}
