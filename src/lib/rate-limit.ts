const hits = new Map<string, number[]>();

export function rateLimited(key: string, limit = 12, windowMs = 60_000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((stamp) => now - stamp < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > limit;
}
