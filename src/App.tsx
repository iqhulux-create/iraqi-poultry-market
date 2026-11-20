import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Plus,
  CheckCircle2,
  RefreshCw,
  BookmarkCheck,
} from 'lucide-react';
import { BannerItem, CategoryId, Listing } from './types';
import { CATEGORIES } from './data/mockData';
import { Header } from './components/Header';
import { CategoryBar } from './components/CategoryBar';
import { BannerSlider } from './components/BannerSlider';
import { ListingCard } from './components/ListingCard';
import { ListingDetailModal } from './components/ListingDetailModal';
import { CitySelectorModal } from './components/CitySelectorModal';
import { PostAdModal } from './components/PostAdModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ReportConfirmModal } from './components/ReportConfirmModal';
import { AboutAppModal } from './components/AboutAppModal';
import { MARKETPLACE_WEB_APP_URL } from './utils/mediaUpload';
import {
  getMyPublishedPostIds,
  saveMyPublishedPostId,
  removeMyPublishedPostId,
} from './utils/phoneAuth';
import { getSavedSellerProfile } from './utils/sellerProfile';
import {
  getReportedPostIds,
  hasReportedPost,
  markPostAsReported,
} from './utils/reportedPosts';
import {
  subscribeToFirebasePosts,
  fetchFirebasePostsOnce,
  deleteFirebasePost,
  reportFirebasePost,
  toggleFirebasePostSoldStatus,
  sortFirebaseListings,
  isPostExpired,
} from './services/firebasePosts';

const BANNERS_API_URL =
  'https://script.google.com/macros/s/AKfycbxQlQZHJ_GKI9mLlGP60BxdHyqnYw5YMAuQKVfB6aUcu3tK1kjXwfzCS3dydeQJsNw_/exec';

function normalizeArabicForSearch(text: string): string {
  return String(text || '')
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback below
    }
  }
  if (typeof document === 'undefined') return false;
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

function parseBannerItems(raw: unknown): BannerItem[] {
  let rows: unknown[] = [];
  if (Array.isArray(raw)) {
    rows = raw;
  } else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const candidate =
      obj.data ?? obj.ads ?? obj.banners ?? obj.items ?? obj.records ?? obj.result;
    if (Array.isArray(candidate)) {
      rows = candidate;
    }
  }

  const parsed: BannerItem[] = [];
  rows.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') return;
    const row = entry as Record<string, unknown>;
    if (row.isActive === false || row.active === false) return;

    const image = String(row.image ?? row.imageUrl ?? row.img ?? '').trim();
    const title = String(row.title ?? '').trim();
    const subtitle = String(row.subtitle ?? row.description ?? '').trim();
    const whatsapp = String(row.whatsapp ?? row.phone ?? '').trim();
    const badgeText = String(row.badgeText ?? row.badge ?? '').trim();

    // تجاهل الصفوف الفارغة التي لا تحتوي على صورة أو عنوان أو وصف فعلي (حتى لو بقي رقم واتساب قديم)
    if (!image && !title && !subtitle) return;

    parsed.push({
      id: String(row.id ?? `sheet-banner-${index}`),
      title,
      subtitle: subtitle || undefined,
      imageUrl: image,
      image,
      whatsapp: whatsapp || undefined,
      badgeText: badgeText || undefined,
      isActive: true,
    });
  });

  return parsed;
}

export default function App() {
  // State
  const [listings, setListings] = useState<Listing[]>([]);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [selectedCity, setSelectedCity] = useState<string>('جميع المحافظات');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showMyAds, setShowMyAds] = useState<boolean>(false);
  const [myPostIds, setMyPostIds] = useState<string[]>(() =>
    getMyPublishedPostIds()
  );

  const [currentUserPhone, setCurrentUserPhone] = useState<string>(
    () => getSavedSellerProfile()?.phone || ''
  );
  const [appsScriptUrl] = useState<string>(MARKETPLACE_WEB_APP_URL);
  const [isLoadingListings, setIsLoadingListings] = useState<boolean>(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  // Modals
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isPostAdModalOpen, setIsPostAdModalOpen] = useState(false);
  const [isAboutAppModalOpen, setIsAboutAppModalOpen] = useState(false);
  const aboutApiUrl =
    'https://script.google.com/macros/s/AKfycbx1455M9KUfCL68_1pqlBrekGbVJwCnBL3DNvWC_xhjfY2neJ1uh2kio-Y8MFb9wH6c6A/exec';
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [listingToReport, setListingToReport] = useState<Listing | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportedPostIds, setReportedPostIds] = useState<string[]>(() =>
    getReportedPostIds()
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const feedScrollRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPostsRef = useRef<Map<string, Listing>>(new Map());

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const loadLiveBanners = useCallback(async (signal?: AbortSignal) => {
    try {
      const sep = BANNERS_API_URL.includes('?') ? '&' : '?';
      const response = await fetch(`${BANNERS_API_URL}${sep}_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        redirect: 'follow',
        signal,
      });
      if (!response.ok) {
        if (!signal?.aborted) setBanners([]);
        return;
      }
      const raw = await response.json();
      if (signal?.aborted) return;
      setBanners(parseBannerItems(raw));
    } catch {
      if (!signal?.aborted) setBanners([]);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadLiveBanners(controller.signal);
    return () => controller.abort();
  }, [loadLiveBanners]);

  const loadLiveListings = useCallback(
    async (showFeedback = false) => {
      setIsLoadingListings(true);
      void loadLiveBanners();
      try {
        const liveListings = await fetchFirebasePostsOnce(7000);
        setListings(liveListings);
        setMyPostIds(getMyPublishedPostIds());
        setFirebaseError(null);
        if (showFeedback) {
          const activeCount = liveListings.filter(
            (item) => item.status === 'active' && !isPostExpired(item.createdAtMs)
          ).length;
          showToast(
            activeCount > 0
              ? `تم تحديث الإعلانات (${activeCount} إعلان)`
              : 'لا توجد إعلانات متاحة حالياً'
          );
        }
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : 'تعذر تحديث الإعلانات، يرجى التحقق من اتصال الإنترنت';
        setFirebaseError(msg);
        if (showFeedback) {
          showToast(msg);
        }
      } finally {
        setIsLoadingListings(false);
      }
    },
    [loadLiveBanners, showToast]
  );

  useEffect(() => {
    let settled = false;
    setIsLoadingListings(true);

    const fallbackTimer = setTimeout(() => {
      if (!settled) {
        setIsLoadingListings(false);
        setFirebaseError(
          'تعذر تحميل الإعلانات حالياً، يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'
        );
      }
    }, 6500);

    const unsubscribe = subscribeToFirebasePosts(
      (liveListings) => {
        settled = true;
        clearTimeout(fallbackTimer);
        const liveIds = new Set(liveListings.map((item) => item.id));
        const pendingItems: Listing[] = [];
        pendingPostsRef.current.forEach((pendingItem, pendingId) => {
          if (!liveIds.has(pendingId)) {
            pendingItems.push(pendingItem);
          }
        });
        setListings(
          pendingItems.length > 0
            ? sortFirebaseListings([...pendingItems, ...liveListings])
            : liveListings
        );
        setMyPostIds(getMyPublishedPostIds());
        setFirebaseError(null);
        setIsLoadingListings(false);
      },
      (errMsg) => {
        settled = true;
        clearTimeout(fallbackTimer);
        setFirebaseError(errMsg);
        setIsLoadingListings(false);
      }
    );

    return () => {
      clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, []);

  // Delete Listing Handlers
  const handleRequestDelete = (listing: Listing) => {
    setListingToDelete(listing);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (listing: Listing) => {
    try {
      await deleteFirebasePost(listing.id);
      removeMyPublishedPostId(listing.id);
      setMyPostIds(getMyPublishedPostIds());
      setListings((prev) => prev.filter((item) => item.id !== listing.id));
      setFavorites((prev) => prev.filter((id) => id !== listing.id));
      setSelectedListing((prev) => (prev?.id === listing.id ? null : prev));
      setListingToDelete(null);
      showToast('تم حذف الإعلان بنجاح');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'تعذر حذف الإعلان، يرجى المحاولة مرة أخرى'
      );
    }
  };

  // Report Listing Handlers
  const handleRequestReport = (listing: Listing, e: React.MouseEvent) => {
    e.stopPropagation();
    if (reportedPostIds.includes(listing.id) || hasReportedPost(listing.id)) {
      showToast('لقد قمت بالإبلاغ عن هذا الإعلان مسبقاً');
      return;
    }
    setListingToReport(listing);
    setIsReportModalOpen(true);
  };

  const handleConfirmReport = async (listing: Listing) => {
    if (hasReportedPost(listing.id)) {
      setReportedPostIds(getReportedPostIds());
      showToast('لقد قمت بالإبلاغ عن هذا الإعلان مسبقاً');
      return;
    }

    try {
      const result = await reportFirebasePost(listing.id);
      const updatedIds = markPostAsReported(listing.id);
      setReportedPostIds(updatedIds);
      setListings((prev) =>
        prev.map((item) =>
          item.id === listing.id
            ? { ...item, reports: result.reports, status: result.status }
            : item
        )
      );
      if (result.status === 'reported') {
        setSelectedListing((prev) => (prev?.id === listing.id ? null : prev));
        showToast('تم إرسال بلاغك بنجاح، وتم إخفاء الإعلان تلقائياً للمراجعة');
      } else {
        showToast('تم إرسال بلاغك بنجاح، شكراً لمساعدتنا في الحفاظ على جودة السوق');
      }
      setListingToReport(null);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'تعذر إرسال البلاغ، يرجى المحاولة مرة أخرى'
      );
    }
  };


  // Toggle favorite
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      showToast(exists ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة ❤️');
      return next;
    });
  };

  // Toggle Sold Status (Owner management)
  const handleToggleSold = async (listing: Listing) => {
    try {
      const nextSold = await toggleFirebasePostSoldStatus(
        listing.id,
        !listing.isSold
      );
      setListings((prev) =>
        prev.map((item) =>
          item.id === listing.id ? { ...item, isSold: nextSold } : item
        )
      );
      setSelectedListing((prev) =>
        prev && prev.id === listing.id ? { ...prev, isSold: nextSold } : prev
      );
      showToast(
        nextSold
          ? 'تم تحديد الإعلان كـ "تم البيع"'
          : 'تمت إعادة تفعيل الإعلان كمتاح للبيع'
      );
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : 'تعذر تحديث حالة الإعلان، يرجى المحاولة مرة أخرى'
      );
    }
  };

  // Share Listing (Native mobile share sheet or copy formatted details to clipboard)
  const handleShareListing = async (listing: Listing, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const appUrl =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : '';
    const shareText = [
      `🐓 ${listing.title}`,
      `💰 السعر: ${listing.price.toLocaleString('ar-IQ')} د.ع`,
      `📍 الموقع: ${listing.city} - ${listing.district}`,
      `👤 المعلن: ${listing.seller_name || listing.sellerName}`,
      listing.isSold ? '⚠️ الحالة: تم البيع' : `📞 للتواصل: ${listing.phone}`,
      appUrl ? `🔗 رابط السوق: ${appUrl}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: listing.title,
          text: shareText,
          ...(appUrl ? { url: appUrl } : {}),
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
      }
    }

    const copied = await copyTextToClipboard(shareText);
    if (copied) {
      showToast('تم نسخ تفاصيل الإعلان للمشاركة');
    } else {
      showToast('تعذر نسخ تفاصيل الإعلان، يرجى المحاولة يدوياً');
    }
  };

  // Contact actions
  const handleContact = (type: 'call' | 'whatsapp', listing: Listing, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (listing.isSold) {
      showToast('تم بيع هذا الإعلان مسبقاً');
      return;
    }
    if (type === 'call') {
      showToast(`جاري الاتصال بـ ${listing.sellerName}: ${listing.phone}`);
      window.location.href = `tel:${listing.phone}`;
    } else {
      showToast(`فتح محادثة واتساب مع ${listing.sellerName}`);
      window.open(`https://wa.me/${listing.whatsapp}?text=${encodeURIComponent('السلام عليكم، بخصوص إعلانك: ' + listing.title)}`, '_blank');
    }
  };

  // Active listings only (status === 'active' and within 15 days); reported/expired posts stay hidden
  const activeListings = useMemo(
    () =>
      listings.filter(
        (item) => item.status === 'active' && !isPostExpired(item.createdAtMs)
      ),
    [listings]
  );

  // Ads published from this device only
  const myActiveListings = useMemo(
    () => activeListings.filter((item) => myPostIds.includes(item.id)),
    [activeListings, myPostIds]
  );

  const baseFeedListings = showMyAds ? myActiveListings : activeListings;

  // Live category badge counts synced with current feed pool (and selected city)
  const categoriesWithLiveCounts = useMemo(() => {
    const cityScoped =
      selectedCity === 'جميع المحافظات'
        ? baseFeedListings
        : baseFeedListings.filter((item) => item.city.includes(selectedCity));

    return CATEGORIES.map((cat) => ({
      ...cat,
      badgeCount:
        cat.id === 'all'
          ? cityScoped.length
          : cityScoped.filter((item) => item.category === cat.id).length,
    }));
  }, [baseFeedListings, selectedCity]);

  // Filter listings
  const filteredListings = useMemo(() => {
    const normalizedQuery = normalizeArabicForSearch(searchQuery);
    const queryTokens = normalizedQuery ? normalizedQuery.split(' ') : [];

    return baseFeedListings.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // City filter
      if (selectedCity !== 'جميع المحافظات' && !item.city.includes(selectedCity)) {
        return false;
      }

      // Instant search query filter (Arabic-normalized across title, desc, location, breed, seller, and category)
      if (queryTokens.length > 0) {
        const categoryLabel =
          CATEGORIES.find((c) => c.id === item.category)?.label || '';
        const searchableText = normalizeArabicForSearch(
          [
            item.title,
            item.description,
            item.district,
            item.city,
            item.details?.breed || '',
            item.seller_name || item.sellerName || '',
            categoryLabel,
          ].join(' ')
        );
        if (!queryTokens.every((token) => searchableText.includes(token))) {
          return false;
        }
      }

      return true;
    });
  }, [baseFeedListings, selectedCategory, selectedCity, searchQuery]);

  const handleToggleMyAds = useCallback(() => {
    setShowMyAds((prev) => {
      const next = !prev;
      if (next) {
        setSelectedCategory('all');
        setSelectedCity('جميع المحافظات');
        setSearchQuery('');
      }
      return next;
    });
    requestAnimationFrame(() => {
      feedScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, []);

  // Handle adding new listing immediately to main feed (instant optimistic UX + background RTDB save)
  const handleAddListing = (
    newListing: Listing,
    _syncedToBackend?: boolean,
    successMessage?: string,
    commitInBackground?: () => Promise<Listing>
  ) => {
    saveMyPublishedPostId(newListing.id);
    setMyPostIds(getMyPublishedPostIds());
    if (newListing.phone && newListing.phone !== '07701234567') {
      setCurrentUserPhone(newListing.phone);
    }
    if (commitInBackground) {
      pendingPostsRef.current.set(newListing.id, newListing);
    }
    setShowMyAds(false);
    setSelectedCategory('all');
    setSelectedCity('جميع المحافظات');
    setSearchQuery('');
    setListings((prev) =>
      sortFirebaseListings([
        newListing,
        ...prev.filter((item) => item.id !== newListing.id),
      ])
    );
    setFirebaseError(null);
    showToast(successMessage || 'تم نشر إعلانك في القائمة الرئيسية بنجاح! 🎉');

    requestAnimationFrame(() => {
      feedScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    if (commitInBackground) {
      void commitInBackground()
        .then((finalListing) => {
          pendingPostsRef.current.delete(newListing.id);
          setListings((prev) =>
            sortFirebaseListings([
              finalListing,
              ...prev.filter((item) => item.id !== finalListing.id),
            ])
          );
        })
        .catch((err) => {
          pendingPostsRef.current.delete(newListing.id);
          removeMyPublishedPostId(newListing.id);
          setMyPostIds(getMyPublishedPostIds());
          setListings((prev) => prev.filter((item) => item.id !== newListing.id));
          showToast(
            err instanceof Error
              ? err.message
              : 'تعذر حفظ الإعلان في السحابة، يرجى المحاولة مرة أخرى.'
          );
        });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 flex flex-col font-['Cairo',sans-serif]" dir="rtl">
      {/* Main App Container */}
      <main className="flex-1 flex justify-center w-full">
        <div className="max-w-3xl w-full min-h-screen bg-[#F8F9FA] sm:border-x sm:border-slate-200/70 sm:shadow-xs relative flex flex-col">
          {/* App Header (Search + City Selection Filter + Branding + About App) */}
          <Header
            selectedCity={selectedCity}
            onOpenCitySelector={() => setIsCityModalOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            totalListingsCount={filteredListings.length}
            onOpenAboutApp={() => setIsAboutAppModalOpen(true)}
            showMyAds={showMyAds}
            myAdsCount={myActiveListings.length}
            onToggleMyAds={handleToggleMyAds}
          />

          {/* Horizontal Scrollable Category Bar with Pills */}
          <CategoryBar
            categories={categoriesWithLiveCounts}
            selectedCategory={selectedCategory}
            onSelectCategory={(id) => setSelectedCategory(id)}
          />

          {/* Scrollable Feed Area (pb-16 clears the fixed 50px bottom banner ad) */}
          <div
            ref={feedScrollRef}
            className="flex-1 overflow-y-auto p-3.5 pb-[68px] space-y-3 bg-[#F8F9FA]"
          >
            {/* Top Banner Slider (Shown exclusively when Google Sheets API returns non-empty ads and not in My Ads mode) */}
            {banners.length > 0 && !showMyAds && <BannerSlider banners={banners} />}

            {/* My Ads Mode Context Header */}
            {showMyAds && (
              <div className="bg-[#EAFBF1] border border-[#27AE60]/25 rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#219653]">
                  <BookmarkCheck className="w-4 h-4 shrink-0" />
                  <span>إعلاناتي المنشورة من هذا الجهاز ({myActiveListings.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMyAds(false)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-[#27AE60]/20 font-bold text-[11px] shrink-0 cursor-pointer transition-colors"
                >
                  عرض كل الإعلانات
                </button>
              </div>
            )}

            {/* Live Feed Header & Refresh Action */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                {isLoadingListings ? (
                  <div className="flex items-center gap-2" aria-label="جاري التحميل">
                    <span className="w-4 h-4 rounded-full border-2 border-[#27AE60]/25 border-t-[#27AE60] animate-spin inline-block" />
                    <span className="text-slate-500 font-semibold">أحدث الإعلانات</span>
                  </div>
                ) : (
                  <span>الإعلانات ({filteredListings.length})</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => loadLiveListings(true)}
                disabled={isLoadingListings}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#27AE60] hover:bg-[#EAFBF1] px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isLoadingListings ? 'animate-spin' : ''}`}
                />
                <span>تحديث</span>
              </button>
            </div>

            {firebaseError && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2">
                <span className="font-semibold leading-relaxed">{firebaseError}</span>
                <button
                  type="button"
                  onClick={() => loadLiveListings(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 cursor-pointer"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            {/* Listings Grid / List, Calm Skeleton Loader, or Empty State */}
            {isLoadingListings && filteredListings.length === 0 ? (
              <div className="space-y-3" aria-busy="true" aria-label="تحميل الإعلانات">
                {[0, 1, 2].map((skeletonIdx) => (
                  <div
                    key={skeletonIdx}
                    className="bg-white rounded-2xl p-3 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row gap-3 animate-pulse"
                  >
                    <div className="w-full aspect-[16/10] sm:aspect-square sm:w-28 sm:h-28 rounded-xl bg-slate-200/75 shrink-0" />
                    <div className="flex-1 flex flex-col justify-between py-0.5 space-y-2.5">
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200/80 rounded-lg w-4/5" />
                        <div className="h-3 bg-slate-100 rounded-lg w-3/5" />
                        <div className="h-3 bg-slate-100 rounded-lg w-2/5" />
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <div className="h-5 bg-emerald-100/80 rounded-lg w-24" />
                        <div className="flex items-center gap-1.5">
                          <div className="h-8 w-14 bg-slate-100 rounded-lg" />
                          <div className="h-8 w-16 bg-emerald-100/70 rounded-lg" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredListings.length > 0 ? (
              <div className="space-y-3">
                {filteredListings.map((listing, index) => (
                  <React.Fragment key={listing.id}>
                    <ListingCard
                      listing={listing}
                      onSelect={setSelectedListing}
                      isFavorite={favorites.includes(listing.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onQuickContact={handleContact}
                      isReported={reportedPostIds.includes(listing.id)}
                      onReport={handleRequestReport}
                      onShare={handleShareListing}
                      showOwnerActions={showMyAds}
                      onToggleSold={handleToggleSold}
                      onRequestDelete={handleRequestDelete}
                    />

                    {/* Prominent "+ إضافة إعلان" Inline Button/Banner Directly Below First Product Item */}
                    {index === 0 && (
                      <div className="py-1">
                        <button
                          onClick={() => setIsPostAdModalOpen(true)}
                          className="w-full flex items-center justify-between p-3 sm:p-3.5 bg-[#27AE60] hover:bg-[#219653] text-white rounded-2xl shadow-[0_6px_20px_rgba(39,174,96,0.35)] hover:shadow-[0_8px_24px_rgba(39,174,96,0.45)] transition-all duration-200 active:scale-[0.99] cursor-pointer border-2 border-white/30 select-none group"
                          aria-label="+ إضافة إعلان"
                          title="+ إضافة إعلان"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:rotate-90 transition-transform duration-200">
                              <Plus className="w-5 h-5 stroke-[3]" />
                            </div>
                            <div className="text-right">
                              <span className="text-sm sm:text-base font-extrabold block leading-tight">
                                + إضافة إعلان
                              </span>
                              <span className="text-[11px] text-white/90 block mt-0.5">
                                انشر دواجنك أو طيورك أو أعلافك مجاناً وبدون عمولة
                              </span>
                            </div>
                          </div>
                          <div className="px-3.5 py-1.5 bg-white text-[#27AE60] font-extrabold text-xs rounded-full shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                            أضف الآن
                          </div>
                        </button>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              /* Empty State */
              (() => {
                const hasActiveFilters =
                  Boolean(searchQuery.trim()) ||
                  selectedCity !== 'جميع المحافظات' ||
                  selectedCategory !== 'all';

                if (showMyAds && !hasActiveFilters) {
                  return (
                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs my-6 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#EAFBF1] text-[#27AE60] flex items-center justify-center mx-auto mb-3">
                        <BookmarkCheck className="w-8 h-8" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800 mb-1.5">
                        لا توجد لديك إعلانات منشورة بعد
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
                        الإعلانات التي تنشرها من هذا الجهاز ستظهر هنا تلقائياً لتتمكن من إدارتها وتحديدها كـ &quot;تم البيع&quot; أو حذفها بسهولة.
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowMyAds(false)}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          تصفح جميع الإعلانات
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsPostAdModalOpen(true)}
                          className="px-4 py-2.5 bg-[#27AE60] hover:bg-[#219653] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>+ إضافة إعلان</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                const showNoMatchMessage = baseFeedListings.length > 0 || hasActiveFilters;

                return (
                  <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs my-6 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 text-3xl flex items-center justify-center mx-auto mb-3">
                      {showNoMatchMessage ? '🔍' : '🐓'}
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1.5">
                      {showNoMatchMessage
                        ? 'لا توجد نتائج مطابقة'
                        : 'لا توجد منشورات حالياً'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
                      {showNoMatchMessage
                        ? 'لا توجد إعلانات مطابقة لبحثك حالياً، جرب البحث بكلمة أخرى أو تصفح جميع المحافظات'
                        : 'كن أول من يضيف إعلاناً في سوق الدواجن والطيور العراقي، وسيظهر هنا فوراً للمشترين.'}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory('all');
                            setSelectedCity('جميع المحافظات');
                            setSearchQuery('');
                          }}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          تصفح جميع المحافظات
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsPostAdModalOpen(true)}
                        className="px-4 py-2.5 bg-[#27AE60] hover:bg-[#219653] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>+ إضافة إعلان</span>
                      </button>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </main>

      {/* Fixed Bottom Banner Ad Strip (50px height) */}
      <div
        role="region"
        aria-label="بانر إعلاني سفلي"
        className="fixed bottom-0 inset-x-0 z-30 flex justify-center pointer-events-none"
      >
        <div className="max-w-3xl w-full h-[50px] bg-white/95 backdrop-blur-xs border-t border-slate-200 px-3 flex items-center justify-center pointer-events-auto shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
          <div className="w-full h-[36px] rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-500 select-none">
            مساحة إعلانية
          </div>
        </div>
      </div>

      {/* Auto-dismissing Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-[64px] left-1/2 -translate-x-1/2 z-[90] max-w-[90vw] bg-slate-900/95 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-full shadow-xl border border-white/10 backdrop-blur-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-[#27AE60] shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <ListingDetailModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        isFavorite={selectedListing ? favorites.includes(selectedListing.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onContact={handleContact}
        currentUserPhone={currentUserPhone}
        onRequestDelete={handleRequestDelete}
        onToggleSold={handleToggleSold}
        onShare={handleShareListing}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        listing={listingToDelete}
        onConfirmDelete={handleConfirmDelete}
      />

      <ReportConfirmModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        listing={listingToReport}
        onConfirmReport={handleConfirmReport}
      />

      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        selectedCity={selectedCity}
        onSelectCity={(city) => {
          setSelectedCity(city);
          showToast(`تم تغيير المحافظة إلى: ${city}`);
        }}
      />

      <PostAdModal
        isOpen={isPostAdModalOpen}
        onClose={() => setIsPostAdModalOpen(false)}
        onAddListing={handleAddListing}
        currentUserPhone={currentUserPhone}
        appsScriptUrl={appsScriptUrl}
      />

      <AboutAppModal
        isOpen={isAboutAppModalOpen}
        onClose={() => setIsAboutAppModalOpen(false)}
        apiUrl={aboutApiUrl}
      />
    </div>
  );
}
