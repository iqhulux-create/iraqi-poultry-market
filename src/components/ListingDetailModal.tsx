import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  Heart,
  Share2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Tag,
  Loader2,
} from 'lucide-react';
import { Listing } from '../types';
import { isListingOwner, isMyPublishedPost } from '../utils/phoneAuth';
import { parseImagesField } from '../utils/mediaUpload';
import { useOptimizedImages } from '../utils/imageMemory';
import { ImageLightbox } from './ImageLightbox';

interface ListingDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onContact: (type: 'call' | 'whatsapp', listing: Listing) => void;
  currentUserPhone: string;
  onRequestDelete: (listing: Listing) => void;
  onToggleSold?: (listing: Listing) => Promise<void>;
  onShare?: (listing: Listing) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  isFavorite,
  onToggleFavorite,
  onContact,
  currentUserPhone,
  onRequestDelete,
  onToggleSold,
  onShare,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isPointerDragging, setIsPointerDragging] = useState(false);
  const [isUpdatingSold, setIsUpdatingSold] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const didDragRef = useRef(false);
  const scrollRafRef = useRef<number | null>(null);
  const activeIndexRef = useRef(0);

  const rawGalleryImages = listing
    ? parseImagesField(listing.images, listing.image || listing.imageUrl)
    : [];
  const galleryImages = useOptimizedImages(rawGalleryImages);
  const totalImages = galleryImages.length;

  useEffect(() => {
    activeIndexRef.current = activeImageIndex;
  }, [activeImageIndex]);

  const scrollToSlide = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      if (totalImages === 0) return;
      const clamped = Math.max(0, Math.min(totalImages - 1, index));
      activeIndexRef.current = clamped;
      setActiveImageIndex(clamped);
      const container = carouselRef.current;
      if (container) {
        container.scrollTo({
          left: clamped * container.clientWidth,
          behavior,
        });
      }
    },
    [totalImages]
  );

  useEffect(() => {
    activeIndexRef.current = 0;
    setActiveImageIndex(0);
    setIsLightboxOpen(false);
    setIsPointerDragging(false);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'auto' });
    }
  }, [listing?.id]);

  useEffect(() => {
    return () => {
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const thumb = thumbRefs.current[activeImageIndex];
    if (thumb) {
      thumb.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeImageIndex]);

  if (!listing) return null;

  const isOwner =
    isListingOwner(currentUserPhone, listing.phone) || isMyPublishedPost(listing.id);

  // RAF-throttled scroll listener avoids mid-swipe React re-render jitter
  const handleCarouselScroll = () => {
    if (scrollRafRef.current !== null) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const container = carouselRef.current;
      if (!container || container.clientWidth === 0 || totalImages === 0) return;
      const nextIdx = Math.round(container.scrollLeft / container.clientWidth);
      const clamped = Math.max(0, Math.min(totalImages - 1, nextIdx));
      if (clamped !== activeIndexRef.current) {
        activeIndexRef.current = clamped;
        setActiveImageIndex(clamped);
      }
    });
  };

  // Smooth desktop pointer drag without CSS scroll-smooth / snap fighting
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || totalImages <= 1) return;
    const container = carouselRef.current;
    if (!container) return;
    setIsPointerDragging(true);
    didDragRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartScrollRef.current = container.scrollLeft;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDragging) return;
    const container = carouselRef.current;
    if (!container) return;
    const dx = e.clientX - dragStartXRef.current;
    if (Math.abs(dx) > 5) {
      didDragRef.current = true;
    }
    container.scrollLeft = dragStartScrollRef.current - dx;
  };

  const handlePointerUpOrCancel = () => {
    if (!isPointerDragging) return;
    setIsPointerDragging(false);
    const container = carouselRef.current;
    if (container && container.clientWidth > 0) {
      const targetIdx = Math.round(container.scrollLeft / container.clientWidth);
      scrollToSlide(targetIdx, 'smooth');
    }
  };

  const isSold = Boolean(listing.isSold);

  const handleShare = () => {
    if (onShare) {
      onShare(listing);
      return;
    }
    if (navigator.share) {
      navigator
        .share({
          title: listing.title,
          text: `شاهد هذا الإعلان في سوق الدواجن والطيور العراقي: ${listing.title} بسعر ${listing.price.toLocaleString('ar-IQ')} د.ع`,
          url: window.location.origin,
        })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin).catch(() => {});
    }
  };

  const handleToggleSoldClick = async () => {
    if (!onToggleSold || isUpdatingSold) return;
    setIsUpdatingSold(true);
    try {
      await onToggleSold(listing);
    } finally {
      setIsUpdatingSold(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
        dir="rtl"
      >
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              aria-label="إغلاق تفاصيل الإعلان"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-500 font-medium truncate">
              تفاصيل الإعلان{' '}
              <span className="font-mono text-[11px] text-slate-400">#{listing.id}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              title="مشاركة"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => onToggleFavorite(listing.id, e)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              title="المفضلة"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4">
          {/* Owner Management Banner */}
          {isOwner && (
            <div
              className={`rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs border ${
                isSold
                  ? 'bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-[#EAFBF1] border-[#27AE60]/30 text-[#219653]'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                <BadgeCheck className="w-4 h-4 shrink-0" />
                <span>
                  {isSold
                    ? 'تم تحديد إعلانك كـ "تم البيع" — أزرار التواصل معطّلة'
                    : 'إدارة إعلانك — يمكنك تحديده كـ "تم البيع" أو حذفه'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {onToggleSold && (
                  <button
                    type="button"
                    disabled={isUpdatingSold}
                    onClick={handleToggleSoldClick}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-60 ${
                      isSold
                        ? 'bg-[#27AE60] hover:bg-[#219653] text-white'
                        : 'bg-slate-800 hover:bg-slate-900 text-white'
                    }`}
                  >
                    {isUpdatingSold ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Tag className="w-3.5 h-3.5" />
                    )}
                    <span>{isSold ? 'إعادة تفعيل كمتاح' : 'تم البيع'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRequestDelete(listing)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف الإعلان</span>
                </button>
              </div>
            </div>
          )}

          {/* Locked Aspect-Ratio Smooth Image Slider (Zero-jitter GPU swipe + Blob RAM optimization) */}
          <div className="space-y-2.5">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900/5 border border-slate-100 shadow-xs group select-none">
              {totalImages > 0 && (
                <div
                  ref={carouselRef}
                  dir="ltr"
                  onScroll={handleCarouselScroll}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUpOrCancel}
                  onPointerCancel={handlePointerUpOrCancel}
                  className={`w-full h-full flex overflow-x-auto no-scrollbar touch-pan-y overscroll-x-contain transform-gpu ${
                    isPointerDragging
                      ? 'snap-none cursor-grabbing'
                      : 'snap-x snap-mandatory cursor-grab'
                  }`}
                >
                  {galleryImages.map((imgUrl, idx) => (
                    <div
                      key={`${idx}-${imgUrl.slice(-16)}`}
                      onClick={() => {
                        if (didDragRef.current) {
                          didDragRef.current = false;
                          return;
                        }
                        setActiveImageIndex(idx);
                        setIsLightboxOpen(true);
                      }}
                      className="w-full h-full shrink-0 snap-center snap-always cursor-zoom-in bg-slate-100"
                    >
                      <img
                        src={imgUrl}
                        alt={`${listing.title} - ${idx + 1}`}
                        loading={Math.abs(idx - activeImageIndex) <= 1 ? 'eager' : 'lazy'}
                        decoding="async"
                        draggable={false}
                        className="w-full h-full object-cover select-none transform-gpu"
                      />
                    </div>
                  ))}
                </div>
              )}

              {isSold && (
                <div className="absolute inset-0 bg-slate-900/35 flex items-center justify-center z-20 pointer-events-none">
                  <span className="px-5 py-1.5 rounded-2xl bg-red-600/95 text-white text-base sm:text-lg font-extrabold tracking-wide shadow-xl border-2 border-white/40 -rotate-6">
                    تم البيع
                  </span>
                </div>
              )}

              {listing.isVerified && !isSold && (
                <div className="absolute top-3 right-3 bg-[#27AE60] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md pointer-events-none">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>إعلان موثوق</span>
                </div>
              )}

              {/* Full-Screen Lightbox Trigger Button */}
              {totalImages > 0 && (
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  aria-label="تكبير الصورة بملء الشاشة"
                  title="عرض بملء الشاشة"
                  className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}

              {/* Prev / Next Carousel Buttons */}
              {totalImages > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToSlide(activeImageIndex - 1);
                    }}
                    disabled={activeImageIndex === 0}
                    aria-label="الصورة السابقة"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-all disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToSlide(activeImageIndex + 1);
                    }}
                    disabled={activeImageIndex === totalImages - 1}
                    aria-label="الصورة التالية"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-all disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Dynamic Photo Counter */}
              {totalImages > 0 && (
                <div
                  dir="ltr"
                  className="absolute bottom-3 left-3 bg-black/65 text-white text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full pointer-events-none"
                >
                  {activeImageIndex + 1} / {totalImages}
                </div>
              )}

              {/* Smooth Indicator Dots */}
              {totalImages > 1 && (
                <div
                  dir="ltr"
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-xs"
                >
                  {galleryImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        scrollToSlide(idx);
                      }}
                      aria-label={`الصورة ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                        idx === activeImageIndex
                          ? 'w-4 bg-[#27AE60]'
                          : 'w-1.5 bg-white/70 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {totalImages > 1 && (
              <div
                dir="ltr"
                className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
              >
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={`${idx}-${imgUrl.slice(-16)}`}
                    ref={(el) => {
                      thumbRefs.current[idx] = el;
                    }}
                    type="button"
                    onClick={() => scrollToSlide(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-150 cursor-pointer ${
                      idx === activeImageIndex
                        ? 'border-[#27AE60] ring-2 ring-[#27AE60]/25'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${listing.title} - ${idx + 1}`}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price & Title */}
          <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-slate-100">
            <div className="flex items-baseline justify-between mb-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#27AE60]">
                  {listing.price.toLocaleString('ar-IQ')}
                </span>
                <span className="text-sm font-bold text-[#27AE60]">دينار عراقي</span>
              </div>
              <span className="text-xs text-slate-500">{listing.date}</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {listing.title}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-[#27AE60]" />
              <span>{listing.city}</span>
              <span>·</span>
              <span>{listing.district}</span>
            </div>
          </div>

          {/* Specifications Grid */}
          {listing.details && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {listing.details.breed && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">السلالة / النوع</span>
                  <span className="font-semibold text-slate-800">{listing.details.breed}</span>
                </div>
              )}
              {listing.details.age && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">العمر</span>
                  <span className="font-semibold text-slate-800">{listing.details.age}</span>
                </div>
              )}
              {listing.details.quantity && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">الكمية المتوفرة</span>
                  <span className="font-semibold text-slate-800">{listing.details.quantity}</span>
                </div>
              )}
              {listing.details.vaccinated !== undefined && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">الحالة الصحية واللقاح</span>
                  <span className="font-semibold text-[#27AE60] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {listing.details.vaccinated ? 'مطعّم بالكامل' : 'يحتاج فحص'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              وصف الإعلان
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
              {listing.description}
            </p>
          </div>

          {/* Seller Profile Card */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#EAFBF1] text-[#27AE60] font-bold text-base flex items-center justify-center">
                {(listing.seller_name || listing.sellerName).slice(0, 1)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-900">
                    {listing.seller_name || listing.sellerName}
                  </span>
                  {listing.isVerified && (
                    <ShieldCheck className="w-4 h-4 text-[#27AE60]" />
                  )}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span>هاتف المعلن:</span>
                  <span className="font-mono dir-ltr font-semibold text-slate-700">
                    {listing.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Tip for Iraqi Animal Trading */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/60 text-amber-900 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              نصيحة أمان: عاين الطيور والدواجن بنفسك وتأكد من سلامتها البيطرية وشهادات اللقاح قبل إتمام الدفع أو الاتفاق.
            </p>
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isSold}
              onClick={() => !isSold && onContact('whatsapp', listing)}
              className={`h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                isSold
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-[#E8F8EE] hover:bg-[#d5f5df] text-[#25D366] active:scale-98 cursor-pointer'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>محادثة واتساب</span>
            </button>
            <button
              type="button"
              disabled={isSold}
              onClick={() => !isSold && onContact('call', listing)}
              className={`h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                isSold
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-[#27AE60] hover:bg-[#219653] text-white active:scale-98 shadow-md shadow-[#27AE60]/20 cursor-pointer'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>{isSold ? 'تم البيع' : 'اتصال هاتفي'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full-Screen Dynamic Image Lightbox */}
      <ImageLightbox
        isOpen={isLightboxOpen}
        images={galleryImages}
        initialIndex={activeImageIndex}
        title={listing.title}
        onClose={(finalIndex) => {
          setIsLightboxOpen(false);
          scrollToSlide(finalIndex, 'auto');
        }}
      />
    </div>
  );
};
