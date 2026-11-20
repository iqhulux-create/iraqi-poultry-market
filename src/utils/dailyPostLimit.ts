export const DAILY_POST_LIMIT = 3;
export const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
export const DAILY_POST_LIMIT_MESSAGE =
  'لقد وصلت للحد الأقصى المسموح به للنشر اليوم (3 إعلانات يومياً)، يمكنك النشر مجدداً غداً';

const DAILY_POSTS_STORAGE_KEY = 'iraqi_poultry_daily_post_timestamps';

function readValidTimestamps(now = Date.now()): number[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(DAILY_POSTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cutoff = now - DAILY_WINDOW_MS;
    return parsed
      .map((v) => Number(v))
      .filter((ts) => Number.isFinite(ts) && ts > cutoff && ts <= now + 60_000);
  } catch {
    return [];
  }
}

function writeTimestamps(timestamps: number[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(DAILY_POSTS_STORAGE_KEY, JSON.stringify(timestamps));
  } catch {
    // ignore storage quota errors
  }
}

export function getTodayPublishCount(): number {
  const now = Date.now();
  const valid = readValidTimestamps(now);
  writeTimestamps(valid);
  return valid.length;
}

export function canPublishToday(): boolean {
  return getTodayPublishCount() < DAILY_POST_LIMIT;
}

export function recordDailyPost(): number {
  const now = Date.now();
  const valid = readValidTimestamps(now);
  const next = [...valid, now];
  writeTimestamps(next);
  return now;
}

export function removeDailyPostTimestamp(timestamp: number): void {
  if (!timestamp) return;
  const valid = readValidTimestamps();
  const idx = valid.indexOf(timestamp);
  if (idx !== -1) {
    valid.splice(idx, 1);
    writeTimestamps(valid);
  }
}
