import {
  ref as dbRef,
  push,
  set,
  get,
  update,
  remove,
  onValue,
  runTransaction,
  Unsubscribe,
} from 'firebase/database';
import { FIREBASE_POSTS_PATH, rtdb } from '../firebase';
import { CategoryId, Listing } from '../types';
import {
  MediaImageItem,
  MAX_IMAGES,
  MAX_IMAGE_KB,
  compressImageToTargetSize,
  estimateDataUrlByteSize,
  parseImagesField,
} from '../utils/mediaUpload';
import { removeMyPublishedPostId } from '../utils/phoneAuth';

export const AD_EXPIRATION_DAYS = 15;
export const AD_EXPIRATION_MS = AD_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

export function isPostExpired(
  createdAtMs: number | undefined,
  now = Date.now()
): boolean {
  if (!createdAtMs || !Number.isFinite(createdAtMs) || createdAtMs <= 0) {
    return false;
  }
  return now - createdAtMs > AD_EXPIRATION_MS;
}

const attemptedExpiredCleanupIds = new Set<string>();

function cleanupExpiredPostsInBackground(expiredKeys: string[]): void {
  if (expiredKeys.length === 0) return;
  const keysToDelete = expiredKeys.filter((key) => {
    const cleanKey = String(key || '').trim();
    if (!cleanKey || attemptedExpiredCleanupIds.has(cleanKey)) return false;
    attemptedExpiredCleanupIds.add(cleanKey);
    return true;
  });

  if (keysToDelete.length === 0) return;

  void Promise.allSettled(
    keysToDelete.map((key) => {
      removeMyPublishedPostId(key);
      return remove(getPostDocRef(key));
    })
  );
}

function getPostsCollectionRef() {
  return dbRef(rtdb, FIREBASE_POSTS_PATH);
}

function getPostDocRef(postId: string) {
  const cleanId = String(postId || '').trim().replace(/^\/+|\/+$/g, '');
  return dbRef(rtdb, `${FIREBASE_POSTS_PATH}/${cleanId}`);
}

export interface FirebasePostRecord {
  id: string;
  title: string;
  category: CategoryId;
  price: number;
  governorate: string;
  district: string;
  'seller-name': string;
  phone: string;
  description: string;
  image: string;
  images?: string[];
  video: string;
  'is-pinned': boolean;
  date: string;
  createdAt?: number;
  reports?: number;
  status?: string;
  isSold?: boolean;
}

export interface PublishFirebasePostInput {
  title: string;
  category: CategoryId;
  price: number;
  governorate: string;
  district: string;
  sellerName: string;
  phone: string;
  description: string;
  isPinned: boolean;
  images: MediaImageItem[];
  breed?: string;
}

const CATEGORY_DEFAULT_IMAGES: Record<CategoryId, string> = {
  all: '/images/poultry_rooster_iraq_1793487643523.jpg',
  poultry: '/images/poultry_rooster_iraq_1793487643523.jpg',
  birds: '/images/pigeon_iraqi_zaajil_1793487645000.jpg',
  feed: '/images/poultry_feed_supplies_1793487722608.jpg',
  vet: '/images/veterinary_poultry_vitamins_1793487645672.jpg',
};

function normalizeCategory(rawCategory: unknown): CategoryId {
  const val = String(rawCategory || '').trim().toLowerCase();
  if (val === 'poultry' || val.includes('دواجن') || val.includes('دجاج')) {
    return 'poultry';
  }
  if (val === 'birds' || val.includes('طيور') || val.includes('حمام')) {
    return 'birds';
  }
  if (
    val === 'feed' ||
    val.includes('أعلاف') ||
    val.includes('اعلاف') ||
    val.includes('مستلزمات')
  ) {
    return 'feed';
  }
  if (val === 'vet' || val.includes('أدوية') || val.includes('ادوية') || val.includes('بيطر')) {
    return 'vet';
  }
  return 'poultry';
}

function parsePinnedFlag(rawVal: unknown): boolean {
  if (typeof rawVal === 'boolean') return rawVal;
  if (typeof rawVal === 'number') return rawVal === 1;
  const s = String(rawVal || '').trim().toLowerCase();
  return s === 'true' || s === '1' || s.includes('نعم') || s.includes('مميز');
}

function parseTimestampMs(rawDate: unknown): number {
  if (typeof rawDate === 'number' && Number.isFinite(rawDate)) {
    return rawDate > 0 && rawDate < 1e12 ? rawDate * 1000 : rawDate;
  }
  const s = String(rawDate || '').trim();
  if (!s) return 0;
  if (/^\d{10,13}$/.test(s)) {
    const num = Number(s);
    if (Number.isFinite(num)) {
      return s.length === 10 ? num * 1000 : num;
    }
  }
  const parsed = Date.parse(s);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatFirebaseDate(rawDate: unknown): string {
  if (typeof rawDate === 'number' && Number.isFinite(rawDate)) {
    return new Date(rawDate).toLocaleString('ar-IQ', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  const s = String(rawDate || '').trim();
  if (!s) return 'الآن';
  const parsed = new Date(s);
  if (Number.isNaN(parsed.getTime())) return s;

  const diffMs = Date.now() - parsed.getTime();
  if (diffMs >= 0 && diffMs < 60_000) return 'الآن';
  if (diffMs >= 0 && diffMs < 3_600_000) {
    const mins = Math.max(1, Math.floor(diffMs / 60_000));
    return `منذ ${mins} د`;
  }
  return parsed.toLocaleString('ar-IQ', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFirebaseErrorMessage(err: unknown): string {
  const rawMsg =
    err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code?: unknown }).code || '')
      : '';

  const combined = `${code} ${rawMsg}`.toLowerCase();
  const isBrowserOffline =
    typeof navigator !== 'undefined' && navigator.onLine === false;

  if (
    combined.includes('permission_denied') ||
    combined.includes('403')
  ) {
    return 'عذراً، لا تتوفر صلاحية لإتمام هذه العملية حالياً.';
  }
  if (combined.includes('404')) {
    return 'الخدمة غير متوفرة حالياً، يرجى المحاولة لاحقاً.';
  }
  if (
    isBrowserOffline ||
    combined.includes('network-request-failed') ||
    combined.includes('err_internet_disconnected') ||
    combined.includes('err_network_changed')
  ) {
    return 'انقطع اتصال الإنترنت، يرجى التحقق من الشبكة والمحاولة مرة أخرى.';
  }
  if (combined.includes('timeout')) {
    return 'استغرق الاتصال وقتاً أطول من المعتاد، يرجى المحاولة مرة أخرى.';
  }
  return 'تعذر إكمال العملية حالياً، يرجى المحاولة مرة أخرى.';
}

const MAX_IMAGE_BYTES = MAX_IMAGE_KB * 1024;

async function prepareImageBase64DataUrl(
  item: MediaImageItem
): Promise<string> {
  // Fast path: reuse compressed Base64 if already compressed within < 300 KB budget
  if (
    item.compressedDataUrl &&
    item.compressedDataUrl.startsWith('data:image/') &&
    estimateDataUrlByteSize(item.compressedDataUrl) <= MAX_IMAGE_BYTES
  ) {
    return item.compressedDataUrl;
  }

  if (item.remoteUrl && item.remoteUrl.startsWith('http')) {
    return item.remoteUrl;
  }

  const source: File | string | undefined =
    item.file ||
    (item.compressedDataUrl?.startsWith('data:image/') ? item.compressedDataUrl : undefined) ||
    (item.previewUrl?.startsWith('data:image/') ? item.previewUrl : undefined);

  if (!source) return '';

  const compressed = await compressImageToTargetSize(source, MAX_IMAGE_BYTES);
  if (compressed?.dataUrl) {
    return compressed.dataUrl;
  }

  return typeof source === 'string' ? source : '';
}

/**
 * Creates a Firebase RTDB key and optimistic Listing immediately (0ms wait)
 * while compressing images (< 300 KB) and committing to Firebase RTDB in the background.
 */
export function prepareOptimisticFirebasePost(input: PublishFirebasePostInput): {
  postId: string;
  optimisticListing: Listing;
  commitToFirebase: () => Promise<Listing>;
} {
  const postsListRef = getPostsCollectionRef();
  const pushedRef = push(postsListRef);
  const postId =
    pushedRef.key || `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const targetPostRef = pushedRef.key ? pushedRef : getPostDocRef(postId);

  const activeImages = (input.images || []).slice(0, MAX_IMAGES);
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const cleanPhone = input.phone.trim() || '07701234567';
  const cleanSeller = input.sellerName.trim() || 'بدون اسم';
  const cleanDistrict = input.district.trim() || 'المركز';
  const cleanGov =
    !input.governorate || input.governorate === 'جميع المحافظات'
      ? 'بغداد'
      : input.governorate.trim();
  const cleanDesc =
    input.description.trim() ||
    'إعلان جديد معروض في سوق الدواجن والطيور العراقي، بحالة ممتازة وجاهز للتسليم.';

  const previewImages = activeImages
    .map((imgItem) => imgItem.compressedDataUrl || imgItem.remoteUrl || imgItem.previewUrl)
    .filter(Boolean);

  const optimisticRecord: FirebasePostRecord = {
    id: postId,
    title: input.title.trim(),
    category: input.category,
    price: Number(input.price) || 0,
    governorate: cleanGov,
    district: cleanDistrict,
    'seller-name': cleanSeller,
    phone: cleanPhone,
    description: cleanDesc,
    image: previewImages[0] || '',
    ...(previewImages.length > 0 ? { images: previewImages } : {}),
    video: '',
    'is-pinned': Boolean(input.isPinned),
    date: nowIso,
    createdAt: nowMs,
    reports: 0,
    status: 'active',
    isSold: false,
  };

  const optimisticListing = mapFirebasePostToListing(
    postId,
    optimisticRecord as unknown as Record<string, unknown>,
    {
      breed: input.breed?.trim() || undefined,
    }
  );

  const commitToFirebase = async (): Promise<Listing> => {
    const base64Images = (
      await Promise.all(activeImages.map((imgItem) => prepareImageBase64DataUrl(imgItem)))
    ).filter(Boolean);

    const postRecord: FirebasePostRecord = {
      ...optimisticRecord,
      image: base64Images[0] || '',
      ...(base64Images.length > 0 ? { images: base64Images } : {}),
    };
    if (base64Images.length === 0) {
      delete postRecord.images;
    }

    try {
      await Promise.race([
        set(targetPostRef, postRecord),
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  'استغرق الحفظ وقتاً أطول من المعتاد، يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'
                )
              ),
            20000
          )
        ),
      ]);
    } catch (err) {
      throw new Error(formatFirebaseErrorMessage(err));
    }

    return mapFirebasePostToListing(
      postId,
      postRecord as unknown as Record<string, unknown>,
      {
        breed: input.breed?.trim() || undefined,
      }
    );
  };

  return { postId, optimisticListing, commitToFirebase };
}

/**
 * Compresses and resizes up to 5 images (< 300 KB each with crisp detail)
 * and saves the complete post directly into Firebase Realtime Database.
 */
export async function publishPostToFirebase(
  input: PublishFirebasePostInput
): Promise<{ listing: Listing; postId: string }> {
  const { postId, commitToFirebase } = prepareOptimisticFirebasePost(input);
  const listing = await commitToFirebase();
  return { listing, postId };
}

export function mapFirebasePostToListing(
  key: string,
  raw: Record<string, unknown>,
  extraDetails?: Listing['details']
): Listing {
  const category = normalizeCategory(raw.category);
  const title = String(raw.title ?? '').trim() || 'إعلان دواجن وطيور';
  const price = Math.round(Number(String(raw.price ?? 0).replace(/[^\d.]/g, '')) || 0);
  const governorate = String(raw.governorate ?? raw.city ?? 'بغداد').trim() || 'بغداد';
  const district = String(raw.district ?? 'المركز').trim() || 'المركز';
  const sellerName =
    String(raw['seller-name'] ?? raw.seller_name ?? raw.sellerName ?? 'بدون اسم').trim() ||
    'بدون اسم';

  let phone = String(raw.phone ?? '').trim() || '07700000000';
  if (/^7\d{9}$/.test(phone)) {
    phone = '0' + phone;
  }
  const whatsapp =
    '964' + (phone.startsWith('0') ? phone.slice(1) : phone);

  const description =
    String(raw.description ?? '').trim() ||
    'إعلان منشور في سوق الدواجن والطيور العراقي.';

  const parsedImages = parseImagesField(raw.images, raw.image ?? raw.imageUrl);
  const fallbackImg =
    CATEGORY_DEFAULT_IMAGES[category] || CATEGORY_DEFAULT_IMAGES.poultry;
  const finalImages = parsedImages.length > 0 ? parsedImages : [fallbackImg];

  const isPinned = parsePinnedFlag(
    raw['is-pinned'] ?? raw.is_pinned ?? raw.isPinned ?? raw.featured
  );

  const rawDate = raw.date ?? raw.createdAt ?? raw.timestamp;
  const createdAtMs =
    parseTimestampMs(raw.createdAt) ||
    parseTimestampMs(raw.timestamp) ||
    parseTimestampMs(raw.date);
  const formattedDate = formatFirebaseDate(rawDate);

  const id = String(raw.id || key).trim();
  const reports = Math.max(0, Number(raw.reports ?? 0) || 0);
  const rawStatus = String(raw.status ?? '').trim().toLowerCase();
  const isSold = Boolean(
    raw.isSold ?? raw['is-sold'] ?? raw.sold ?? (rawStatus === 'sold')
  );
  const status = rawStatus === 'sold' ? 'active' : rawStatus || 'active';

  return {
    id,
    title,
    category,
    price,
    city: governorate,
    governorate,
    district,
    date: formattedDate,
    createdAtMs,
    imageUrl: finalImages[0],
    image: finalImages[0],
    images: finalImages,
    sellerName,
    seller_name: sellerName,
    phone,
    whatsapp,
    isVerified: true,
    featured: isPinned,
    'is-pinned': isPinned,
    reports,
    status,
    isSold,
    description,
    details: extraDetails,
  };
}

export function sortFirebaseListings(items: Listing[]): Listing[] {
  return [...items].sort((a, b) => {
    const pinnedDiff = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    if (pinnedDiff !== 0) return pinnedDiff;
    return (b.createdAtMs || 0) - (a.createdAtMs || 0);
  });
}

function parseSnapshotRecordToListings(val: unknown): Listing[] {
  if (!val || typeof val !== 'object') return [];

  const entries = Array.isArray(val)
    ? val
        .map((item, idx) => [String(idx), item] as const)
        .filter(([, item]) => item && typeof item === 'object')
    : Object.entries(val as Record<string, unknown>);

  const now = Date.now();
  const expiredKeys: string[] = [];
  const activeMapped: Listing[] = [];

  entries.forEach(([key, item]) => {
    if (!item || typeof item !== 'object') return;
    const mapped = mapFirebasePostToListing(key, item as Record<string, unknown>);
    if (!mapped.title) return;

    if (isPostExpired(mapped.createdAtMs, now)) {
      expiredKeys.push(key);
      return;
    }

    activeMapped.push(mapped);
  });

  if (expiredKeys.length > 0) {
    cleanupExpiredPostsInBackground(expiredKeys);
  }

  return sortFirebaseListings(activeMapped);
}

export async function fetchFirebasePostsOnce(timeoutMs = 8000): Promise<Listing[]> {
  const postsListRef = getPostsCollectionRef();

  const fetchPromise = get(postsListRef).then((snapshot) => {
    if (!snapshot.exists()) return [];
    return parseSnapshotRecordToListings(snapshot.val());
  });

  const timeoutPromise = new Promise<Listing[]>((_, reject) => {
    setTimeout(
      () =>
        reject(
          new Error(
            'استغرق تحميل الإعلانات وقتاً أطول من المعتاد، يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'
          )
        ),
      timeoutMs
    );
  });

  try {
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (err) {
    throw new Error(formatFirebaseErrorMessage(err));
  }
}

export function subscribeToFirebasePosts(
  onData: (listings: Listing[]) => void,
  onError?: (message: string) => void
): Unsubscribe {
  const postsListRef = getPostsCollectionRef();

  return onValue(
    postsListRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData([]);
        return;
      }
      onData(parseSnapshotRecordToListings(snapshot.val()));
    },
    (error) => {
      onError?.(formatFirebaseErrorMessage(error));
    }
  );
}

export async function deleteFirebasePost(postId: string): Promise<void> {
  if (!postId) return;
  try {
    await remove(getPostDocRef(postId));
  } catch (err) {
    throw new Error(formatFirebaseErrorMessage(err));
  }
}

export async function reportFirebasePost(
  postId: string
): Promise<{ reports: number; status: 'active' | 'reported' }> {
  const cleanId = String(postId || '').trim().replace(/^\/+|\/+$/g, '');
  if (!cleanId) {
    throw new Error('تعذر تحديد الإعلان المطلوب الإبلاغ عنه.');
  }

  const postRef = getPostDocRef(cleanId);
  const reportsRef = dbRef(rtdb, `${FIREBASE_POSTS_PATH}/${cleanId}/reports`);

  try {
    const txResult = await runTransaction(reportsRef, (currentVal) => {
      const currentCount = Number(currentVal);
      return (Number.isFinite(currentCount) && currentCount > 0 ? currentCount : 0) + 1;
    });

    const nextReports = Math.max(1, Number(txResult.snapshot.val() ?? 1) || 1);
    const nextStatus: 'active' | 'reported' = nextReports >= 3 ? 'reported' : 'active';

    if (nextReports >= 3) {
      await update(postRef, { status: 'reported' });
    } else {
      const statusSnap = await get(dbRef(rtdb, `${FIREBASE_POSTS_PATH}/${cleanId}/status`));
      if (!statusSnap.exists()) {
        await update(postRef, { status: 'active' });
      }
    }

    return {
      reports: nextReports,
      status: nextStatus,
    };
  } catch (err) {
    throw new Error(formatFirebaseErrorMessage(err));
  }
}

export async function toggleFirebasePostSoldStatus(
  postId: string,
  isSold: boolean
): Promise<boolean> {
  const cleanId = String(postId || '').trim().replace(/^\/+|\/+$/g, '');
  if (!cleanId) {
    throw new Error('تعذر تحديد الإعلان المطلوب تحديث حالته.');
  }

  try {
    const nextSold = Boolean(isSold);
    await update(getPostDocRef(cleanId), { isSold: nextSold });
    return nextSold;
  } catch (err) {
    throw new Error(formatFirebaseErrorMessage(err));
  }
}
