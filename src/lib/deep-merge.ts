/** Shallow-friendly deep merge for plain JSON message trees */
export function deepMerge<T extends Record<string, unknown>>(
  base: T,
  patch: Record<string, unknown>,
): T {
  const out = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(patch)) {
    const pv = patch[key];
    const bv = out[key];
    if (
      pv &&
      typeof pv === "object" &&
      !Array.isArray(pv) &&
      bv &&
      typeof bv === "object" &&
      !Array.isArray(bv)
    ) {
      out[key] = deepMerge(bv as Record<string, unknown>, pv as Record<string, unknown>);
    } else if (pv !== undefined) {
      out[key] = pv;
    }
  }
  return out as T;
}
