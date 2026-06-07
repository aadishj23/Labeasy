export function slugify(input: string): string {
  const base = (input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "item";
}

/**
 * Generate a slug that's unique within `existing` by appending -2, -3, … on
 * collision.
 */
export function uniqueSlug(input: string, existing: Set<string>): string {
  const base = slugify(input);
  let slug = base;
  let n = 2;
  while (existing.has(slug)) slug = `${base}-${n++}`;
  existing.add(slug);
  return slug;
}
