/** Normalizes a place name for matching against a curated footage key, independent of exact casing/punctuation ("Paris" / "paris " / "Paris!" all match "paris"). */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
}
