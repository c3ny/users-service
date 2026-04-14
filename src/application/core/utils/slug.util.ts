/**
 * Generates a URL-safe slug from a string.
 * Handles Portuguese diacritics (ã, ç, é, etc.) without external deps.
 */
export function toSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generates a unique slug, appending a numeric suffix if the base slug
 * already exists. Uses the provided existsFn to check availability.
 */
export async function generateUniqueSlug(
  base: string,
  existsFn: (slug: string) => Promise<boolean>,
): Promise<string> {
  const baseSlug = toSlug(base);
  let candidate = baseSlug;
  let suffix = 2;

  while (await existsFn(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
