import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Plus,
  Image as ImageIcon,
  Upload,
  Star,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { CategoryId, Listing } from '../types';
import { IRAQI_GOVERNORATES } from '../data/mockData';
import {
  MAX_IMAGES,
  MAX_IMAGE_KB,
  MediaImageItem,
  compressImageToTargetSize,
} from '../utils/mediaUpload';
import { prepareOptimisticFirebasePost } from '../services/firebasePosts';
import { moderateAdContent } from '../utils/contentModeration';
import {
  canPublishToday,
  recordDailyPost,
  removeDailyPostTimestamp,
  DAILY_POST_LIMIT_MESSAGE,
} from '../utils/dailyPostLimit';
import {
  getSavedSellerProfile,
  saveSellerProfile,
} from '../utils/sellerProfile';

interface PostAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddListing: (
    listing: Listing,
    syncedToBackend?: boolean,
    successMessage?: string,
    commitInBackground?: () => Promise<Listing>
  ) => void;
  currentUserPhone?: string;
  appsScriptUrl?: string;
}

export const PostAdModal: React.FC<PostAdModalProps> = ({
  isOpen,
  onClose,
  onAddListing,
  currentUserPhone = '07701234567',
}) => {
  const initialSellerProfile = getSavedSellerProfile();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId>('poultry');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState(initialSellerProfile?.governorate || 'بغداد');
  const [district, setDistrict] = useState('');
  const [description, setDescription] = useState('');
  const [sellerName, setSellerName] = useState(initialSellerProfile?.sellerName || '');
  const [phone, setPhone] = useState(initialSellerProfile?.phone || currentUserPhone);
  const [breed, setBreed] = useState('');

  // Media Section State (Up to 5 compressed images ~100 KB each)
  const [images, setImages] = useState<MediaImageItem[]>([]);
  const [isCompressingImages, setIsCompressingImages] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Submission, Gold Pin Toggle & Rewarded Ad State
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting] = useState(false);
  const [rewardStage, setRewardStage] = useState<'idle' | 'prompt' | 'watching'>('idle');
  const [adCountdown, setAdCountdown] = useState(5);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const formBodyRef = useRef<HTMLFormElement>(null);
  const publishFeaturedRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!isOpen) {
      setRewardStage('idle');
      setAdCountdown(5);
      return;
    }
    const saved = getSavedSellerProfile();
    if (saved) {
      if (saved.sellerName) setSellerName(saved.sellerName);
      if (saved.phone) setPhone(saved.phone);
      if (saved.governorate) setCity(saved.governorate);
    } else if (currentUserPhone) {
      setPhone(currentUserPhone);
    }
  }, [isOpen, currentUserPhone]);

  useEffect(() => {
    if (!isOpen || rewardStage !== 'watching') return;
    if (adCountdown <= 0) {
      publishFeaturedRef.current();
      return;
    }
    const timer = setTimeout(() => {
      setAdCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isOpen, rewardStage, adCountdown]);

  if (!isOpen) return null;

  const getFallbackPreviewByCategory = (cat: CategoryId) => {
    const map: Record<CategoryId, string> = {
      all: '/images/poultry_rooster_iraq_1793487643523.jpg',
      poultry: '/images/poultry_rooster_iraq_1793487643523.jpg',
      birds: '/images/pigeon_iraqi_zaajil_1793487645000.jpg',
      feed: '/images/poultry_feed_supplies_1793487722608.jpg',
      vet: '/images/veterinary_poultry_vitamins_1793487645672.jpg',
    };
    return map[cat] || map.poultry;
  };

  const handleSelectImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setMediaError(null);
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      setMediaError(`تم الوصول للحد الأقصى المسموح به (${MAX_IMAGES} صور لكل إعلان).`);
      return;
    }

    const filteredFiles = files.filter(
      (file) =>
        !file.type ||
        file.type.startsWith('image/') ||
        /\.(jpe?g|png|webp|gif|heic|heif|bmp|avif)$/i.test(file.name)
    );

    if (filteredFiles.length === 0) {
      setMediaError('يرجى اختيار ملفات صور صالحة.');
      return;
    }

    const acceptedFiles = filteredFiles.slice(0, remainingSlots);
    if (filteredFiles.length > remainingSlots) {
      setMediaError(
        `تم اختيار ${remainingSlots} صور فقط؛ الحد الأقصى هو ${MAX_IMAGES} صور للإعلان.`
      );
    }

    const fallbackPreview = getFallbackPreviewByCategory(category);
    const createdItems: MediaImageItem[] = acceptedFiles.map((file, idx) => {
      let previewUrl = fallbackPreview;
      try {
        previewUrl = URL.createObjectURL(file);
      } catch {
        previewUrl = fallbackPreview;
      }

      return {
        id: `img-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        previewUrl,
        file,
        name: file.name || `photo-${idx + 1}.jpg`,
      };
    });

    // عرض المصغرات فوراً للمستخدم ثم ضغطها بصمت في الخلفية
    setImages((prev) => [...prev, ...createdItems].slice(0, MAX_IMAGES));
    setIsCompressingImages(true);

    void Promise.all(
      createdItems.map(async (item) => {
        if (!item.file) return;
        const compressed = await compressImageToTargetSize(
          item.file,
          MAX_IMAGE_KB * 1024
        ).catch(() => null);
        if (!compressed?.dataUrl) return;
        setImages((prev) =>
          prev.map((existing) =>
            existing.id === item.id
              ? {
                  ...existing,
                  compressedDataUrl: compressed.dataUrl,
                  compressedSizeBytes: compressed.byteSize,
                }
              : existing
          )
        );
      })
    ).finally(() => {
      setIsCompressingImages(false);
    });
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((item) => item.id !== id));
    setMediaError(null);
  };

  const handleMakeCoverImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (!target) return prev;
      return [target, ...prev.filter((item) => item.id !== id)];
    });
  };

  const validateForm = () => {
    setFormError(null);
    if (!canPublishToday()) {
      setFormError(DAILY_POST_LIMIT_MESSAGE);
      formBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    if (!title.trim() || !price) {
      setFormError('يرجى ملء عنوان الإعلان والسعر قبل النشر.');
      formBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    const moderation = moderateAdContent({
      title,
      description,
      breed,
    });
    if (!moderation.allowed) {
      setFormError(
        moderation.message ||
          'عذراً، السوق مخصص حصرياً للطيور، الدواجن، الحمام، الأعلاف، الأدوية البيطرية، ومستلزماتها فقط.'
      );
      formBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    return true;
  };

  const resetFormState = () => {
    setTitle('');
    setPrice('');
    setDistrict('');
    setDescription('');
    setBreed('');
    setImages([]);
    setIsPinned(false);
    setMediaError(null);
    setFormError(null);
  };

  const publishAdToFirebase = (isFeatured: boolean) => {
    if (!canPublishToday()) {
      setRewardStage('idle');
      setFormError(DAILY_POST_LIMIT_MESSAGE);
      formBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setFormError(null);
    setMediaError(null);

    const numericPrice = Math.max(0, parseInt(price.replace(/,/g, ''), 10) || 0);
    const finalCity = city === 'جميع المحافظات' ? 'بغداد' : city;
    const finalDistrict = district.trim() || 'المركز';
    const finalPhone = phone.trim() || '07701234567';
    const finalSeller = sellerName.trim() || 'بدون اسم';
    const finalDesc =
      description.trim() ||
      'إعلان جديد معروض في سوق الدواجن والطيور العراقي، بحالة ممتازة وجاهز للتسليم.';

    const attachedImages = images.slice(0, MAX_IMAGES);

    saveSellerProfile({
      sellerName: sellerName.trim(),
      phone: phone.trim(),
      governorate: finalCity,
    });

    const { optimisticListing, commitToFirebase } = prepareOptimisticFirebasePost({
      title: title.trim(),
      category,
      price: numericPrice,
      governorate: finalCity,
      district: finalDistrict,
      sellerName: finalSeller,
      phone: finalPhone,
      description: finalDesc,
      isPinned: Boolean(isFeatured),
      images: attachedImages,
      breed: breed.trim() || undefined,
    });

    const recordedTs = recordDailyPost();
    const commitWithLimitTracking = async () => {
      try {
        return await commitToFirebase();
      } catch (err) {
        removeDailyPostTimestamp(recordedTs);
        throw err;
      }
    };

    const successMsg = isFeatured
      ? 'تم نشر إعلانك بشارة «مميز مثبت» في الأعلى بنجاح! ✨'
      : 'تم نشر إعلانك في السوق بنجاح! 🎉';

    // تفريغ الحقول وإغلاق النافذة وإظهار إشعار النجاح فوراً بدون انتظار
    setRewardStage('idle');
    setAdCountdown(5);
    resetFormState();
    onClose();
    onAddListing(optimisticListing, true, successMsg, commitWithLimitTracking);
  };

  publishFeaturedRef.current = () => {
    publishAdToFirebase(true);
  };

  const handlePublishClick = () => {
    if (!validateForm() || isSubmitting) return;
    if (isPinned) {
      setAdCountdown(5);
      setRewardStage('prompt');
      return;
    }
    publishAdToFirebase(false);
  };

  const handleStartWatchingAd = () => {
    setAdCountdown(5);
    setRewardStage('watching');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#EAFBF1] text-[#27AE60] flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">أضف إعلاناً جديداً</h3>
              <p className="text-xs text-slate-500">
                انشر إعلانك مجاناً في سوق العراق للدواجن والطيور
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          ref={formBodyRef}
          onSubmit={(e) => {
            e.preventDefault();
            handlePublishClick();
          }}
          className="overflow-y-auto p-5 space-y-4"
        >
          {formError && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5 leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              عنوان الإعلان <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="مثال: دجاج بلدي بياض / زوج زاجل أصيل / علف بياض 50 كغم"
              className="w-full h-11 px-3 bg-[#F8F9FA] border border-slate-200 rounded-xl text-sm focus:border-[#27AE60] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                التصنيف <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className="w-full h-11 px-3 bg-[#F8F9FA] border border-slate-200 rounded-xl text-sm focus:border-[#27AE60] focus:bg-white focus:outline-hidden"
              >
                <option value="poultry">🐓 دواجن</option>
                <option value="birds">🕊️ طيور وحمام</option>
                <option value="feed">🌾 أعلاف ومستلزمات</option>
                <option value="vet">💊 أدوية وبيطرة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                السعر (دينار عراقي) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="مثال: 35000"
                  className="w-full h-11 px-3 bg-[#F8F9FA] border border-slate-200 rounded-xl text-sm focus:border-[#27AE60] focus:bg-white focus:outline-hidden pl-12"
                />
                <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">
                  د.ع
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                المحافظة <span className="text-red-500">*</span>
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-11 px-3 bg-[#F8F9FA] border border-slate-200 rounded-xl text-sm focus:border-[#27AE60] focus:bg-white focus:outline-hidden"
              >
                {IRAQI_GOVERNORATES.filter((g) => g !== 'جميع المحافظات').map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                المنطقة / القضاء
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="مثال: الكرخ / المنصور / الحلة"
                className="w-full h-11 px-3 bg-[#F8F9FA] border border-slate-200 rounded-xl text-sm focus:border-[#27AE60] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اسم المعلن / المزرعة
              </label>
              <input
                type="text"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="مثال: أبو سجاد"
                className="w-full h-11 px-3 bg-[#F8F9FA] border border-slate-200 rounded-xl text-sm focus:border-[#27AE60] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم الهاتف (آسيا سيل / زين)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07701234567"
                className="w-full h-11 px-3 bg-[#F8F9FA] border border-slate-200 rounded-xl text-sm focus:border-[#27AE60] focus:bg-white focus:outline-hidden dir-ltr text-right"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              تفاصيل وتوضيح إضافي
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="اكتب تفاصيل الصحة، اللقاحات، العمر، وطريقة الاستلام والتوصيل..."
              className="w-full p-3 bg-[#F8F9FA] border border-slate-200 rounded-xl text-sm focus:border-[#27AE60] focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* قسم صور الإعلان */}
          <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EAFBF1] text-[#27AE60] flex items-center justify-center shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">صور الإعلان</h4>
                  <p className="text-[11px] text-slate-500">
                    يمكنك إضافة حتى {MAX_IMAGES} صور (الأولى تظهر كغلاف للإعلان)
                  </p>
                </div>
              </div>

              <span className="font-mono text-xs font-bold text-[#219653] bg-[#EAFBF1] px-2.5 py-0.5 rounded-full shrink-0">
                {images.length} / {MAX_IMAGES}
              </span>
            </div>

            {mediaError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{mediaError}</span>
              </div>
            )}

            <div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleSelectImages}
                className="hidden"
              />

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    className={`relative aspect-square rounded-xl overflow-hidden bg-white border-2 group ${
                      index === 0 ? 'border-[#27AE60]' : 'border-slate-200'
                    }`}
                  >
                    <img
                      src={img.previewUrl}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                    {index === 0 ? (
                      <span className="absolute bottom-1 right-1 left-1 text-center bg-[#27AE60]/95 text-white text-[9px] font-extrabold py-0.5 rounded-md shadow-xs">
                        غلاف الإعلان
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMakeCoverImage(img.id)}
                        title="تعيين كغلاف رئيسي"
                        className="absolute bottom-1 right-1 bg-slate-900/75 hover:bg-[#27AE60] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Star className="w-2.5 h-2.5 inline ml-0.5" />
                        غلاف
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      aria-label="حذف الصورة"
                      className="absolute top-1 left-1 w-5 h-5 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white flex items-center justify-center shadow-xs cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    disabled={isCompressingImages || isSubmitting}
                    onClick={() => imageInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-[#27AE60]/40 bg-white hover:bg-[#EAFBF1]/60 text-[#219653] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isCompressingImages ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-[10px] font-bold">جاري التجهيز...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span className="text-[10px] font-bold">
                          {images.length === 0 ? `أضف حتى ${MAX_IMAGES}` : 'إضافة صورة'}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Featured Gold Pin Toggle Card (binds directly to isPinned / is_pinned) */}
          <button
            type="button"
            role="switch"
            aria-checked={isPinned}
            onClick={() => setIsPinned((prev) => !prev)}
            className={`w-full text-right p-3.5 rounded-2xl border-2 flex items-start gap-3 transition-all cursor-pointer ${
              isPinned
                ? 'bg-gradient-to-r from-amber-100/90 to-emerald-50 border-amber-400 shadow-sm'
                : 'bg-gradient-to-r from-amber-50/70 to-emerald-50/60 border-amber-200/80 hover:border-amber-300'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                isPinned
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-400/20 text-amber-700'
              }`}
            >
              <span>⭐</span>
            </div>

            <div className="flex-1 text-xs min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-slate-900">
                  نشر كإعلان مميز (مثبت في الأعلى)
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold shrink-0 ${
                    isPinned
                      ? 'bg-[#27AE60] text-white'
                      : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  {isPinned ? 'مفعل ✓' : 'تفعيل'}
                </span>
              </div>
              <span className="text-slate-600 block mt-1 leading-relaxed">
                {isPinned
                  ? 'سيُطلب منك مشاهدة إعلان قصير مجاناً ثم يُثبّت إعلانك في الأعلى بشارة «مميز مثبت».'
                  : 'فعّل هذا الخيار لنشر إعلانك بشارة «مميز مثبت» في أعلى القائمة مجاناً.'}
              </span>
            </div>

            <div
              className={`w-10 h-6 rounded-full p-0.5 transition-colors shrink-0 mt-1 flex items-center ${
                isPinned ? 'bg-[#27AE60] justify-start' : 'bg-slate-300 justify-end'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-xs block" />
            </div>
          </button>

          {/* Primary Publish Button */}
          <div className="pt-1">
            <button
              id="btnPublishNormal"
              type="button"
              disabled={isSubmitting}
              onClick={handlePublishClick}
              className={`w-full h-12 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 px-4 transition-all active:scale-98 cursor-pointer disabled:opacity-60 ${
                isPinned
                  ? 'bg-gradient-to-r from-amber-500 via-[#27AE60] to-[#219653] hover:opacity-95 text-white shadow-md shadow-amber-500/20'
                  : 'bg-[#27AE60] hover:bg-[#219653] text-white shadow-md shadow-[#27AE60]/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري حفظ الإعلان فوراً...</span>
                </>
              ) : (
                <span>
                  {isPinned ? 'نشر كإعلان مميز ⭐' : 'نشر الإعلان'}
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Rewarded Ad Modal (Prompt -> 5-second Simulated Ad -> Auto Publish) */}
        {rewardStage !== 'idle' && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-center text-white relative shadow-2xl">
              <div className="flex items-center justify-between mb-4 text-xs text-slate-400">
                <span className="font-semibold text-emerald-400">مكافأة النشر المميز</span>
                <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md font-medium text-[10px]">
                  تثبيت مجاني
                </span>
              </div>

              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-[#27AE60] text-white mx-auto flex items-center justify-center text-3xl shadow-lg shadow-amber-500/25 mb-4 ${
                  rewardStage === 'watching' ? 'animate-pulse' : ''
                }`}
              >
                ⭐
              </div>

              {rewardStage === 'prompt' ? (
                <>
                  <h4 className="text-base font-bold leading-relaxed mb-5 text-white">
                    شاهد إعلاناً قصيراً لتثبيت إعلانك في القسم المميز مجاناً
                  </h4>

                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={handleStartWatchingAd}
                      className="w-full py-3 bg-[#27AE60] hover:bg-[#219653] text-white font-extrabold text-sm rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      مشاهدة الإعلان
                    </button>
                    <button
                      type="button"
                      onClick={() => setRewardStage('idle')}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="text-base font-bold mb-1">جاري عرض الإعلان...</h4>
                  <p className="text-xs text-slate-400 mb-4">
                    سيتم نشر إعلانك تلقائياً بشارة «مميز مثبت» فور انتهاء العداد
                  </p>

                  <div className="w-full bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
                    <div
                      className="bg-[#27AE60] h-full transition-all duration-1000 ease-linear rounded-full"
                      style={{ width: `${((5 - adCountdown) / 5) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mb-5">
                    <span>الوقت المتبقي:</span>
                    <span className="font-extrabold text-amber-400 font-mono text-base">
                      {adCountdown} ثوانٍ
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setRewardStage('idle');
                      setAdCountdown(5);
                    }}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
