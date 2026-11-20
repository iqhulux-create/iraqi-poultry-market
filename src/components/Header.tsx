import React, { useState } from 'react';
import { Search, MapPin, X, Info, BookmarkCheck } from 'lucide-react';

interface HeaderProps {
  selectedCity: string;
  onOpenCitySelector: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalListingsCount: number;
  onOpenAboutApp: () => void;
  showMyAds: boolean;
  myAdsCount: number;
  onToggleMyAds: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCity,
  onOpenCitySelector,
  searchQuery,
  onSearchChange,
  totalListingsCount,
  onOpenAboutApp,
  showMyAds,
  myAdsCount,
  onToggleMyAds,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <header className="bg-white border-b border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] sticky top-0 z-20">
      <div className="px-4 pt-3 pb-3">
        {/* Top Branding Row & Actions (Clean layout, NO back arrow on main entry screen) */}
        <div className="flex items-center justify-between gap-2.5 mb-3">
          {/* Brand Wordmark & Iraqi Badge */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#27AE60] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#27AE60]/20">
              <span className="text-2xl">🐓</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                سوق الدواجن والطيور العراقي
              </h1>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="text-[#27AE60] font-semibold">منصة البيع والشراء الأولى</span>
                <span>·</span>
                <span>{totalListingsCount} إعلان متاح</span>
              </div>
            </div>
          </div>

          {/* Top-Left Slot: My Ads Button & About App Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onToggleMyAds}
              aria-pressed={showMyAds}
              title="عرض إعلاناتي المنشورة من هذا الجهاز"
              className={`h-9 px-3 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0 ${
                showMyAds
                  ? 'bg-[#27AE60] text-white border-[#27AE60] shadow-xs shadow-[#27AE60]/25'
                  : 'bg-[#F8F9FA] hover:bg-[#EAFBF1] text-slate-700 hover:text-[#27AE60] border-slate-200 hover:border-[#27AE60]/40'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5 shrink-0" />
              <span>إعلاناتي</span>
              {myAdsCount > 0 && (
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full leading-tight ${
                    showMyAds
                      ? 'bg-white/25 text-white'
                      : 'bg-[#EAFBF1] text-[#27AE60]'
                  }`}
                >
                  {myAdsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenAboutApp}
              title="حول التطبيق"
              aria-label="حول التطبيق"
              className="w-9 h-9 rounded-full bg-[#F8F9FA] hover:bg-[#EAFBF1] text-slate-600 hover:text-[#27AE60] border border-slate-200 hover:border-[#27AE60]/40 flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer shrink-0"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* City Filter & Search Bar Row */}
        <div className="flex items-center gap-2">
          {/* City Selector Button */}
          <button
            onClick={onOpenCitySelector}
            className="flex items-center gap-1.5 px-3 h-11 bg-[#F8F9FA] hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 transition-colors shrink-0 active:scale-95"
            aria-label="اختيار المحافظة"
          >
            <MapPin className="w-4 h-4 text-[#27AE60]" />
            <span className="max-w-[85px] sm:max-w-[120px] truncate">{selectedCity}</span>
            <span className="text-[10px] text-slate-400">▼</span>
          </button>

          {/* Search Input Field */}
          <div
            className={`flex-1 relative flex items-center h-11 bg-[#F8F9FA] border rounded-xl px-3 transition-all ${
              isFocused
                ? 'border-[#27AE60] ring-2 ring-[#27AE60]/15 bg-white shadow-xs'
                : 'border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="ابحث عن دجاج، زاجل، بلابل، أعلاف، بيطرة..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden"
              dir="rtl"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 transition-colors shrink-0"
                aria-label="مسح البحث"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
