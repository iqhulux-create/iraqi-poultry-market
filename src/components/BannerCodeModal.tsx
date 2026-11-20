import React, { useState } from 'react';
import { X, Copy, Check, Eye, EyeOff, Sparkles, Layers, FileCode, CheckCircle2 } from 'lucide-react';
import { BannerItem } from '../types';

interface BannerCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bannersCount: number;
  onToggleBanners: () => void;
}

export const BannerCodeModal: React.FC<BannerCodeModalProps> = ({
  isOpen,
  onClose,
  bannersCount,
  onToggleBanners,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const kotlinCode = `// =========================================================================
// 1. Fetch active banners from Google Sheets backend ("إعلانات البنر" sheet)
// =========================================================================
private fun fetchActiveBannersFromGoogleSheets() {
    lifecycleScope.launch {
        try {
            val banners = withContext(Dispatchers.IO) {
                loadBannersFromSheetApi(GOOGLE_SHEETS_SCRIPT_URL)
            }
            // 2. Apply dynamic visibility condition
            updateBannerSliderVisibility(banners)
        } catch (e: Exception) {
            Log.e("MainActivity", "Error fetching banners: \${e.message}", e)
            // On failure or no connection, hide ViewPager2 container completely
            updateBannerSliderVisibility(null)
        }
    }
}

// =========================================================================
// 2. Dynamic Visibility Condition Logic:
// - If active banners list is empty (size == 0) or null:
//   Hide ViewPager2 container completely (View.GONE) -> NO BLANK SPACE!
// - If active banners exist (size > 0):
//   Set View.VISIBLE, bind adapter, and start auto-scrolling slideshow.
// =========================================================================
private fun updateBannerSliderVisibility(banners: List<BannerItem>?) {
    if (banners.isNullOrEmpty()) {
        // [EMPTY / NULL]: Hide container completely so no blank space is shown
        binding.bannerSliderContainer.visibility = View.GONE
        stopBannerAutoScroll()
        Log.d("MainActivity", "Banners list is empty (size=0) -> View.GONE applied")
    } else {
        // [SIZE > 0]: Show container, bind ViewPager2 adapter, and start auto-scroll
        binding.bannerSliderContainer.visibility = View.VISIBLE
        setupBannerViewPager(banners)
        startBannerAutoScroll(banners.size)
        Log.d("MainActivity", "Active banners found (size=\${banners.size}) -> View.VISIBLE applied")
    }
}

// =========================================================================
// 3. ViewPager2 Adapter Binding & Auto-Scrolling
// =========================================================================
private fun setupBannerViewPager(banners: List<BannerItem>) {
    bannerAdapter = BannersAdapter(banners) { banner ->
        // Handle banner click (promotional deal, external link, or category)
    }
    binding.bannerViewPager.adapter = bannerAdapter

    // Attach TabLayout dots indicator to ViewPager2
    TabLayoutMediator(binding.bannerDotsIndicator, binding.bannerViewPager) { _, _ -> }.attach()
}

private fun startBannerAutoScroll(itemCount: Int) {
    stopBannerAutoScroll()
    if (itemCount <= 1) return

    bannerAutoScrollRunnable = object : Runnable {
        override fun run() {
            val currentItem = binding.bannerViewPager.currentItem
            val nextItem = if (currentItem + 1 >= itemCount) 0 else currentItem + 1
            binding.bannerViewPager.setCurrentItem(nextItem, true)
            bannerHandler.postDelayed(this, 4000)
        }
    }
    bannerHandler.postDelayed(bannerAutoScrollRunnable!!, 4000)
}

private fun stopBannerAutoScroll() {
    bannerAutoScrollRunnable?.let {
        bannerHandler.removeCallbacks(it)
        bannerAutoScrollRunnable = null
    }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(kotlinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden text-right" dir="rtl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#27AE60]/10 flex items-center justify-center text-[#27AE60]">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                منطق إخفاء وإظهار سلايدر البنر (Android Kotlin)
              </h3>
              <p className="text-xs text-slate-500">
                فحص حجم قائمة إعلانات البنر وتطبيق <code className="text-[#27AE60] font-mono">View.GONE</code> لمنع ظهور أي فراغ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Simulator Toggle in Modal */}
        <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${bannersCount > 0 ? 'bg-[#27AE60] animate-pulse' : 'bg-rose-500'}`} />
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                الحالة الحالية في المعاينة:
              </span>
              <span className="text-[11px] text-slate-600 font-mono">
                {bannersCount > 0
                  ? `banners.size = ${bannersCount} -> View.VISIBLE (السلايدر ظاهر ويتنقل تلقائياً)`
                  : 'banners.size = 0 -> View.GONE (الحاوية مخفية تماماً بدون أي مساحة)'}
              </span>
            </div>
          </div>
          <button
            onClick={onToggleBanners}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
              bannersCount > 0
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-[#27AE60] hover:bg-[#219653] text-white'
            }`}
          >
            {bannersCount > 0 ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>محاكاة قائمة فارغة (View.GONE)</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>إعادة تفعيل البنرات (View.VISIBLE)</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="font-bold text-rose-600 block mb-1">
                ❌ حالة القائمة الفارغة أو null:
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                يتم استدعاء <code className="font-mono bg-white px-1 py-0.5 rounded text-rose-700">binding.bannerSliderContainer.visibility = View.GONE</code>.
                الخاصية <code className="font-mono">GONE</code> تزيل العنصر ومساحته تماماً بحيث لا يظهر أي مستطيل أبيض أو فراغ.
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="font-bold text-[#27AE60] block mb-1">
                ✅ حالة وجود بنرات نشطة (size &gt; 0):
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                يتم استدعاء <code className="font-mono bg-white px-1 py-0.5 rounded text-[#27AE60]">View.VISIBLE</code> ثم ربط الـ Adapter بالـ <code className="font-mono">ViewPager2</code> وبدء الـ Auto-scroll بمؤقت 4 ثوانٍ.
              </p>
            </div>
          </div>

          {/* Kotlin Code Box */}
          <div className="relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-inner" dir="ltr">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400 font-mono">
              <span>MainActivity.kt (Banner Slider Dynamic Logic)</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ الكود'}</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-[280px]">
              {kotlinCode}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
