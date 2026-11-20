import React from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  Heart,
  ShieldCheck,
  Images,
  Share2,
  Tag,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Listing } from '../types';
import { parseImagesField } from '../utils/mediaUpload';
import { getOptimizedImageSrc } from '../utils/imageMemory';

interface ListingCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onQuickContact: (type: 'call' | 'whatsapp', listing: Listing, e: React.MouseEvent) => void;
  isReported?: boolean;
  onReport: (listing: Listing, e: React.MouseEvent) => void;
  onShare: (listing: Listing, e: React.MouseEvent) => void;
  showOwnerActions?: boolean;
  onToggleSold?: (listing: Listing) => Promise<void> | void;
  onRequestDelete?: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onSelect,
  isFavorite,
  onToggleFavorite,
  onQuickContact,
  isReported = false,
  onReport,
  onShare,
  showOwnerActions = false,
  onToggleSold,
  onRequestDelete,
}) => {
  const [isUpdatingSold, setIsUpdatingSold] = React.useState(false);
  const isSold = Boolean(listing.isSold);
  const parsedImages = parseImagesField(
    listing.images,
    listing.image || listing.imageUrl
  );
  const rawPrimaryImage =
    parsedImages[0] || listing.image || listing.imageUrl || '';
  const primaryImage = React.useMemo(
    () => getOptimizedImageSrc(rawPrimaryImage),
    [rawPrimaryImage]
  );
  const totalPhotosCount = parsedImages.length;

  return (
    <article
      onClick={() => onSelect(listing)}
      className={`bg-white rounded-2xl p-3 border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row gap-3 relative group ${
        listing.featured
          ? 'border-amber-300 shadow-[0_4px_14px_rgba(245,158,11,0.12)] bg-gradient-to-l from-amber-50/20 via-white to-white'
          : 'border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-[#27AE60]/30'
      }`}
      dir="rtl"
    >
      {/* Visual First Thumbnail Only with Locked Aspect Ratio (fast feed browsing) */}
      <div className="relative w-full aspect-[16/10] sm:aspect-square sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0">
        {primaryImage && (
          <img
            src={primaryImage}
            alt={listing.title}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-transform duration-300 transform-gpu ${
              isSold ? 'opacity-75 grayscale-[30%]' : 'group-hover:scale-105'
            }`}
          />
        )}

        {/* Sold Ribbon / Badge Overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center z-20 pointer-events-none">
            <span className="px-3 py-1 rounded-xl bg-red-600/95 text-white text-xs sm:text-sm font-extrabold tracking-wide shadow-lg border border-white/30 -rotate-6">
              تم البيع
            </span>
          </div>
        )}

        {/* Featured / Verified Badge */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
          {listing.featured && (
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md shadow-amber-500/30">
              <span>⭐</span>
              <span>مميز مثبت</span>
            </div>
          )}
          {listing.isVerified && !listing.featured && (
            <div className="bg-[#27AE60] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <ShieldCheck className="w-3 h-3" />
              <span>موثوق</span>
            </div>
          )}
        </div>

        {/* Favorite Icon Overlay */}
        <button
          onClick={(e) => onToggleFavorite(listing.id, e)}
          className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-600 hover:text-red-500 active:scale-90 transition-all shadow-xs"
          aria-label="المفضلة"
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-500'
            }`}
          />
        </button>

        {totalPhotosCount > 1 && (
          <div
            dir="ltr"
            className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs"
          >
            <Images className="w-3 h-3 text-emerald-400" />
            <span>{totalPhotosCount}</span>
          </div>
        )}
      </div>

      {/* Content Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Title & Corner Report Icon (🚩) */}
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#27AE60] transition-colors line-clamp-2 leading-snug flex-1">
              {listing.title}
            </h2>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReport(listing, e);
              }}
              title={isReported ? 'تم الإبلاغ عن هذا الإعلان مسبقاً' : 'الإبلاغ عن إعلان مخالف'}
              aria-label={isReported ? 'تم الإبلاغ عن هذا الإعلان مسبقاً' : 'الإبلاغ عن إعلان مخالف'}
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                isReported
                  ? 'bg-slate-100 opacity-50'
                  : 'bg-slate-50 hover:bg-red-50 border border-slate-200/70 hover:border-red-200 active:scale-90'
              }`}
            >
              <span className="text-xs leading-none" aria-hidden="true">
                🚩
              </span>
            </button>
          </div>

          {/* Location & Time Info */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-700">{listing.city}</span>
              <span className="text-slate-400">·</span>
              <span className="truncate max-w-[120px]">{listing.district}</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-400 shrink-0">{listing.date}</span>
          </div>

          {/* Seller Name & Tags */}
          <div className="flex items-center gap-2 text-xs text-slate-600 mt-1.5">
            <span className="truncate max-w-[140px]">
              {listing.seller_name || listing.sellerName}
            </span>
            {listing.details?.vaccinated && (
              <span className="text-[11px] text-[#27AE60] bg-[#EAFBF1] px-1.5 py-0.2 rounded font-medium">
                مطعّم ومعقم
              </span>
            )}
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-50">
          {/* Price formatted in Iraqi Dinar */}
          <div className="flex items-baseline gap-1 min-w-0">
            <span
              className={`text-base sm:text-lg font-extrabold tracking-tight ${
                isSold ? 'text-slate-400 line-through' : 'text-[#27AE60]'
              }`}
            >
              {listing.price.toLocaleString('ar-IQ')}
            </span>
            <span
              className={`text-xs font-bold ${
                isSold ? 'text-slate-400' : 'text-[#27AE60]'
              }`}
            >
              د.ع
            </span>
          </div>

          {/* Share & Quick Contact Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Share Listing */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare(listing, e);
              }}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#EAFBF1] text-slate-600 hover:text-[#27AE60] flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
              title="مشاركة الإعلان"
              aria-label="مشاركة الإعلان"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {showOwnerActions ? (
              <>
                {onToggleSold && (
                  <button
                    type="button"
                    disabled={isUpdatingSold}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (isUpdatingSold) return;
                      setIsUpdatingSold(true);
                      try {
                        await onToggleSold(listing);
                      } finally {
                        setIsUpdatingSold(false);
                      }
                    }}
                    className={`h-8 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-60 ${
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
                    <span>{isSold ? 'إعادة تفعيل' : 'تم البيع'}</span>
                  </button>
                )}

                {onRequestDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestDelete(listing);
                    }}
                    className="h-8 px-2.5 rounded-lg text-xs font-bold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex items-center gap-1 transition-colors active:scale-95 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                )}
              </>
            ) : (
              <>
                {/* WhatsApp */}
                <button
                  type="button"
                  disabled={isSold}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSold) onQuickContact('whatsapp', listing, e);
                  }}
                  className={`h-8 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                    isSold
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-75'
                      : 'bg-[#E8F8EE] hover:bg-[#d2f3dc] text-[#25D366] active:scale-95 cursor-pointer'
                  }`}
                  title={isSold ? 'تم بيع هذا الإعلان' : 'تواصل عبر واتساب'}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">واتساب</span>
                </button>

                {/* Direct Call */}
                <button
                  type="button"
                  disabled={isSold}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSold) onQuickContact('call', listing, e);
                  }}
                  className={`h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                    isSold
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed opacity-75 shadow-none'
                      : 'bg-[#27AE60] hover:bg-[#219653] text-white active:scale-95 shadow-xs shadow-[#27AE60]/20 cursor-pointer'
                  }`}
                  title={isSold ? 'تم بيع هذا الإعلان' : 'اتصال بالبائع'}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{isSold ? 'تم البيع' : 'اتصال'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
