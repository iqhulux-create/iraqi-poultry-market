import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { BannerItem } from '../types';

interface BannerSliderProps {
  banners: BannerItem[];
  onBannerClick?: (banner: BannerItem) => void;
}

/**
 * تنظيف رقم الواتساب وتحويله لصيغة wa.me القياسية
 */
export function normalizeBannerWhatsapp(rawWhatsapp?: string): string {
  const digits = String(rawWhatsapp || '').replace(/[^\d]/g, '');
  if (!digits) return '';
  // تحويل الرقم العراقي المحلي 07XXXXXXXXX إلى 9647XXXXXXXXX
  if (/^07\d{9}$/.test(digits)) {
    return `964${digits.slice(1)}`;
  }
  return digits;
}

export function buildBannerWhatsappUrl(rawWhatsapp?: string): string | null {
  const normalized = normalizeBannerWhatsapp(rawWhatsapp);
  if (!normalized) return null;
  return `https://wa.me/${normalized}`;
}

const WhatsAppWhiteIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.49 0 .14 5.35.14 11.92c0 2.1.55 4.15 1.59 5.96L0 24l6.28-1.65a11.87 11.87 0 0 0 5.77 1.47h.01c6.57 0 11.92-5.35 11.92-11.92 0-3.18-1.24-6.17-3.46-8.42Zm-8.46 18.33h-.01a9.88 9.88 0 0 1-5.04-1.38l-.36-.21-3.73.98 1-3.63-.24-.37a9.86 9.86 0 0 1-1.52-5.28c0-5.45 4.44-9.89 9.9-9.89 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.9 7c0 5.45-4.44 9.88-9.89 9.88Zm5.42-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.09 3.19 5.06 4.47.71.31 1.26.49 1.69.63.71.22 1.35.19 1.86.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" />
  </svg>
);

export const BannerSlider: React.FC<BannerSliderProps> = ({ banners, onBannerClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isPointerDragging, setIsPointerDragging] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const activeIndexRef = useRef(0);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const didDragRef = useRef(false);

  const total = banners?.length ?? 0;

  useEffect(() => {
    activeIndexRef.current = currentIndex;
  }, [currentIndex]);

  const scrollToSlide = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      if (total === 0) return;
      const clamped = ((index % total) + total) % total;
      activeIndexRef.current = clamped;
      setCurrentIndex(clamped);
      const container = trackRef.current;
      if (container) {
        container.scrollTo({
          left: clamped * container.clientWidth,
          behavior,
        });
      }
    },
    [total]
  );

  // إعادة التموضع إذا تغير عدد البانرات
  useEffect(() => {
    if (total === 0) {
      setCurrentIndex(0);
      activeIndexRef.current = 0;
      return;
    }
    if (currentIndex >= total) {
      scrollToSlide(0, 'auto');
    }
  }, [total, currentIndex, scrollToSlide]);

  // الحركة التلقائية للسلايدر كل 4 ثوانٍ مع التوقف المؤقت عند السحب أو التمرير
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (total <= 1 || isPaused || isPointerDragging) {
      return;
    }

    timerRef.current = setInterval(() => {
      const next = (activeIndexRef.current + 1) % total;
      scrollToSlide(next, 'smooth');
    }, 4000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [total, isPaused, isPointerDragging, scrollToSlide]);

  useEffect(() => {
    return () => {
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, []);

  // إخفاء العنصر بالكامل بدون ترك أي فراغ إذا كانت القائمة فارغة
  if (!Array.isArray(banners) || banners.length === 0) {
    return null;
  }

  const handleTrackScroll = () => {
    if (scrollRafRef.current !== null) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const container = trackRef.current;
      if (!container || container.clientWidth === 0 || total === 0) return;
      const nextIdx = Math.round(container.scrollLeft / container.clientWidth);
      const clamped = Math.max(0, Math.min(total - 1, nextIdx));
      if (clamped !== activeIndexRef.current) {
        activeIndexRef.current = clamped;
        setCurrentIndex(clamped);
      }
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    const container = trackRef.current;
    if (!container) return;
    didDragRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartScrollRef.current = container.scrollLeft;
    if (total > 1) {
      setIsPointerDragging(true);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDragging) return;
    const container = trackRef.current;
    if (!container) return;
    const dx = e.clientX - dragStartXRef.current;
    if (Math.abs(dx) > 6) {
      didDragRef.current = true;
    }
    container.scrollLeft = dragStartScrollRef.current - dx;
  };

  const handlePointerUpOrCancel = () => {
    if (!isPointerDragging) return;
    setIsPointerDragging(false);
    const container = trackRef.current;
    if (container && container.clientWidth > 0) {
      const targetIdx = Math.round(container.scrollLeft / container.clientWidth);
      scrollToSlide(Math.max(0, Math.min(total - 1, targetIdx)), 'smooth');
    }
    setTimeout(() => {
      didDragRef.current = false;
    }, 60);
  };

  const openBannerWhatsApp = (banner: BannerItem) => {
    onBannerClick?.(banner);
    const whatsappUrl = buildBannerWhatsappUrl(banner.whatsapp);
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCardClick = (banner: BannerItem) => {
    if (didDragRef.current) return;
    openBannerWhatsApp(banner);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    scrollToSlide(currentIndex - 1, 'smooth');
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    scrollToSlide(currentIndex + 1, 'smooth');
  };

  return (
    <div
      id="bannerSliderContainer"
      className="relative w-full select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        handlePointerUpOrCancel();
      }}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      onTouchCancel={() => setIsPaused(false)}
    >
      <div className="relative w-full h-[156px] sm:h-[178px] rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-slate-900">
        {/* Horizontal Swipe Track (dir="ltr" ensures consistent scrollLeft physics) */}
        <div
          ref={trackRef}
          dir="ltr"
          onScroll={handleTrackScroll}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUpOrCancel}
          onPointerCancel={handlePointerUpOrCancel}
          className={`flex w-full h-full overflow-x-auto touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            isPointerDragging ? 'snap-none cursor-grabbing' : 'snap-x snap-mandatory cursor-pointer'
          }`}
        >
          {banners.map((banner, idx) => {
            const imgSrc = (banner.image || banner.imageUrl || '').trim();
            const whatsappHref = buildBannerWhatsappUrl(banner.whatsapp);

            return (
              <div
                key={banner.id || `banner-${idx}`}
                dir="rtl"
                role="button"
                tabIndex={0}
                onClick={() => handleCardClick(banner)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openBannerWhatsApp(banner);
                  }
                }}
                aria-label={
                  banner.title
                    ? `${banner.title} - تواصل واتساب`
                    : 'إعلان - تواصل واتساب'
                }
                className="relative w-full h-full shrink-0 snap-center snap-always group focus:outline-none bg-gradient-to-l from-slate-900 via-emerald-950 to-slate-900"
              >
                {/* Banner Image (from Google Sheets API only) */}
                {imgSrc && (
                  <img
                    src={imgSrc}
                    alt={banner.title || 'إعلان'}
                    draggable={false}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] transform-gpu pointer-events-none"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}

                {/* Contrast Overlays */}
                <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/50 to-black/30 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                {/* Card Content */}
                <div className="relative z-10 w-full h-full p-3.5 sm:p-4 flex flex-col justify-between">
                  {/* Top Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#27AE60] text-white shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      <span>{banner.badgeText || 'عروض مميزة'}</span>
                    </span>

                    {total > 1 && (
                      <span className="text-[11px] text-white/85 font-semibold bg-black/45 px-2 py-0.5 rounded-md backdrop-blur-xs">
                        {idx + 1} / {total}
                      </span>
                    )}
                  </div>

                  {/* Title & Subtitle */}
                  <div className="pr-0.5 my-auto py-1">
                    {banner.title && (
                      <h3 className="text-white font-extrabold text-sm sm:text-base leading-snug drop-shadow-md line-clamp-2">
                        {banner.title}
                      </h3>
                    )}
                    {banner.subtitle && (
                      <p className="text-white/90 text-xs line-clamp-1 sm:line-clamp-2 mt-1 font-medium drop-shadow-xs">
                        {banner.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Bottom Bar: Indicators on Right + Prominent Green WhatsApp Button on Bottom-Left */}
                  <div className="flex items-end justify-between gap-2 pt-1">
                    {/* Right side: Pagination Dots & Optional Arrows */}
                    <div className="flex items-center gap-2 min-h-[28px]">
                      {total > 1 && (
                        <>
                          <div className="flex items-center gap-1.5">
                            {banners.map((_, dotIdx) => (
                              <button
                                key={dotIdx}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  scrollToSlide(dotIdx, 'smooth');
                                }}
                                className={`transition-all duration-300 rounded-full cursor-pointer ${
                                  dotIdx === currentIndex
                                    ? 'w-5 h-1.5 bg-[#25D366]'
                                    : 'w-1.5 h-1.5 bg-white/55 hover:bg-white/85'
                                }`}
                                aria-label={`انتقل إلى الإعلان ${dotIdx + 1}`}
                              />
                            ))}
                          </div>

                          <div className="hidden sm:flex items-center gap-1" dir="ltr">
                            <button
                              type="button"
                              onClick={handlePrev}
                              className="w-6 h-6 rounded-full bg-black/45 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                              aria-label="الإعلان السابق"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={handleNext}
                              className="w-6 h-6 rounded-full bg-black/45 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                              aria-label="الإعلان التالي"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Prominent Green WhatsApp Button in Bottom-Left Corner */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openBannerWhatsApp(banner);
                      }}
                      disabled={!whatsappHref}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white text-xs font-extrabold shadow-lg shadow-black/35 border border-white/25 transition-all cursor-pointer shrink-0 disabled:opacity-75"
                    >
                      <WhatsAppWhiteIcon className="w-4 h-4 text-white shrink-0" />
                      <span>تواصل واتساب</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
