import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useOptimizedImages } from '../utils/imageMemory';

interface ImageLightboxProps {
  isOpen: boolean;
  images: string[];
  initialIndex: number;
  title?: string;
  onClose: (finalIndex: number) => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  images,
  initialIndex,
  title,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPointerDragging, setIsPointerDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const didDragRef = useRef(false);
  const scrollRafRef = useRef<number | null>(null);
  const currentIndexRef = useRef(initialIndex);

  const safeImages = useOptimizedImages(images.filter(Boolean));
  const total = safeImages.length;

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      if (total === 0) return;
      const clamped = Math.max(0, Math.min(total - 1, index));
      currentIndexRef.current = clamped;
      setCurrentIndex(clamped);
      setIsZoomed(false);
      const track = trackRef.current;
      if (track) {
        track.scrollTo({
          left: clamped * track.clientWidth,
          behavior,
        });
      }
    },
    [total]
  );

  // Sync initial index when lightbox opens
  useEffect(() => {
    if (!isOpen || total === 0) return;
    const clamped = Math.max(0, Math.min(total - 1, initialIndex));
    currentIndexRef.current = clamped;
    setCurrentIndex(clamped);
    setIsZoomed(false);
    setIsPointerDragging(false);

    const raf = requestAnimationFrame(() => {
      const track = trackRef.current;
      if (track) {
        track.scrollTo({
          left: clamped * track.clientWidth,
          behavior: 'auto',
        });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [isOpen, initialIndex, total]);

  useEffect(() => {
    return () => {
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, []);

  // Keep active thumbnail centered in the bottom strip
  useEffect(() => {
    if (!isOpen) return;
    const activeThumb = thumbRefs.current[currentIndex];
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [currentIndex, isOpen]);

  // Keyboard navigation (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose(currentIndex);
      } else if (e.key === 'ArrowRight') {
        scrollToIndex(currentIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        scrollToIndex(currentIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, onClose, scrollToIndex]);

  if (!isOpen || total === 0) return null;

  // RAF-gated scroll update prevents drag stutter
  const handleTrackScroll = () => {
    if (scrollRafRef.current !== null) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const track = trackRef.current;
      if (!track || track.clientWidth === 0) return;
      const nextIdx = Math.round(track.scrollLeft / track.clientWidth);
      const clamped = Math.max(0, Math.min(total - 1, nextIdx));
      if (clamped !== currentIndexRef.current) {
        currentIndexRef.current = clamped;
        setCurrentIndex(clamped);
        setIsZoomed(false);
      }
    });
  };

  // Smooth desktop pointer-drag swipe without scroll-smooth/snap tug-of-war
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || isZoomed || total <= 1) return;
    const track = trackRef.current;
    if (!track) return;
    setIsPointerDragging(true);
    didDragRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartScrollRef.current = track.scrollLeft;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDragging) return;
    const track = trackRef.current;
    if (!track) return;
    const dx = e.clientX - dragStartXRef.current;
    if (Math.abs(dx) > 6) {
      didDragRef.current = true;
    }
    track.scrollLeft = dragStartScrollRef.current - dx;
  };

  const handlePointerUpOrCancel = () => {
    if (!isPointerDragging) return;
    setIsPointerDragging(false);
    const track = trackRef.current;
    if (track && track.clientWidth > 0) {
      const targetIdx = Math.round(track.scrollLeft / track.clientWidth);
      scrollToIndex(targetIdx, 'smooth');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col select-none animate-in fade-in duration-150"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="عارض صور الإعلان بملء الشاشة"
    >
      {/* Top Bar with Close, Dynamic Counter (1/N), and Zoom Toggle */}
      <div className="px-4 py-3 flex items-center justify-between gap-3 text-white bg-gradient-to-b from-black/80 to-transparent shrink-0 z-10">
        <button
          type="button"
          onClick={() => onClose(currentIndex)}
          className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="إغلاق عرض الصور"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center min-w-0">
          <span
            dir="ltr"
            className="px-3 py-1 rounded-full bg-white/15 text-white font-mono text-xs font-extrabold tracking-wide"
          >
            {currentIndex + 1} / {total}
          </span>
          {title && (
            <span className="text-[11px] text-white/75 truncate max-w-[200px] sm:max-w-md mt-1">
              {title}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsZoomed((z) => !z)}
          className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label={isZoomed ? 'تصغير الصورة' : 'تكبير الصورة'}
          title={isZoomed ? 'تصغير' : 'تكبير'}
        >
          {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
        </button>
      </div>

      {/* Swipeable Full-Screen Carousel Track */}
      <div className="relative flex-1 min-h-0 flex items-center">
        <div
          ref={trackRef}
          dir="ltr"
          onScroll={handleTrackScroll}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUpOrCancel}
          onPointerCancel={handlePointerUpOrCancel}
          className={`w-full h-full flex no-scrollbar overscroll-x-contain transform-gpu ${
            isZoomed
              ? 'overflow-auto'
              : isPointerDragging
                ? 'overflow-x-auto snap-none cursor-grabbing'
                : 'overflow-x-auto snap-x snap-mandatory touch-pan-y cursor-grab'
          }`}
        >
          {safeImages.map((imgUrl, idx) => (
            <div
              key={`${idx}-${imgUrl.slice(-16)}`}
              className="w-full h-full shrink-0 snap-center snap-always flex items-center justify-center p-2 sm:p-6 overflow-auto"
              onClick={() => {
                if (didDragRef.current) {
                  didDragRef.current = false;
                  return;
                }
                setIsZoomed((z) => !z);
              }}
            >
              <img
                src={imgUrl}
                alt={`${title || 'صورة الإعلان'} (${idx + 1} / ${total})`}
                loading={Math.abs(idx - currentIndex) <= 1 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
                className={`transition-transform duration-200 rounded-lg select-none transform-gpu ${
                  isZoomed && idx === currentIndex
                    ? 'max-w-none max-h-none scale-150 cursor-zoom-out'
                    : 'max-w-full max-h-full object-contain cursor-zoom-in'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Prev / Next Navigation Buttons when multiple images exist */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => scrollToIndex(currentIndex - 1)}
              disabled={currentIndex === 0}
              aria-label="الصورة السابقة"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-all disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollToIndex(currentIndex + 1)}
              disabled={currentIndex === total - 1}
              aria-label="الصورة التالية"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-all disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Dynamic Thumbnail Strip */}
      {total > 1 && (
        <div
          dir="ltr"
          className="px-4 py-3 bg-gradient-to-t from-black/85 to-transparent flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0"
        >
          <div className="flex items-center gap-2 mx-auto">
            {safeImages.map((imgUrl, idx) => (
              <button
                key={`${idx}-${imgUrl.slice(-16)}`}
                ref={(el) => {
                  thumbRefs.current[idx] = el;
                }}
                type="button"
                onClick={() => scrollToIndex(idx)}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-150 cursor-pointer ${
                  idx === currentIndex
                    ? 'border-[#27AE60] ring-2 ring-[#27AE60]/35'
                    : 'border-white/25 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`${idx + 1}`}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
