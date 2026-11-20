const REPORTED_POSTS_STORAGE_KEY = 'iraqi_poultry_reported_post_ids';

export function getReportedPostIds(): string[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(REPORTED_POSTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function hasReportedPost(postId: string): boolean {
  if (!postId) return false;
  return getReportedPostIds().includes(String(postId));
}

export function markPostAsReported(postId: string): string[] {
  const cleanId = String(postId || '').trim();
  if (!cleanId) return getReportedPostIds();
  const existing = getReportedPostIds();
  if (existing.includes(cleanId)) return existing;
  const next = [cleanId, ...existing].slice(0, 500);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(REPORTED_POSTS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage quota errors
    }
  }
  return next;
}
