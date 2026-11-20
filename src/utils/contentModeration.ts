export interface ModerationResult {
  allowed: boolean;
  reason?: 'profanity' | 'off_topic';
  message?: string;
}

const MARKET_SCOPE_WARNING =
  'عذراً، لا يمكن نشر هذا الإعلان. هذا السوق مخصص حصرياً للطيور، الدواجن، الحمام، الأعلاف، الأدوية البيطرية، ومستلزماتها فقط (مثل الفقاسات، الأقفاص، المشارب، وكل ما يخص الدواجن والطيور).';

const PROFANITY_WARNING =
  'عذراً، يحتوي عنوان أو وصف الإعلان على كلمات مسيئة أو غير أخلاقية مخالفة لشروط السوق. يرجى تعديل النص والمحاولة مرة أخرى.';

export function normalizeArabicTextForModeration(text: string): string {
  return String(text || '')
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '') // إزالة التشكيل والتطويل
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// كلمات مسيئة أو غير أخلاقية أو مخالفة
const BLOCKED_PROFANITY_PATTERNS: RegExp[] = [
  // كلمات مسيئة وغير أخلاقية بالعربية
  /(?:^|\s)(?:سكس|اباحي|اباحيه|جنس|جنسي|جنسيه|دعاره|عاهر|عاهره|شرموط|شرموطه|قحب|قحبه|قحابي|منيوك|منيوكه|نيك|انيك|تنيك|ممحون|ممحونه|لوطي|سحاق|زب|كسم|كسمك|كسختك|طيز|عير|شاذ|مؤخره)(?=\s|$)/,
  /(?:^|\s)(?:خرا|زباله|ابن الكلب|ابن الحرام|ولاد الكلب|حمار|حيوان|تافه|سافل|حقير|واطي|ملعون|يلعن|لعنه|كافر|قذر|منحط)(?=\s|$)/,
  /(?:^|\s)(?:مخدرات|حشيش|كريستال|كبتاجون|ترامادول|خمور|خمر|كحول|قمار|مراهنات)(?=\s|$)/,
  /(?:^|\s)(?:سلاح|مسدس|كلاشنكوف|بندقيه|ذخيره|متفجرات|نصاب|نصابين|احتيال)(?=\s|$)/,
  // English profanity / adult / prohibited terms
  /\b(?:fuck|fucking|shit|bitch|asshole|dick|pussy|porn|sex|xxx|nude|whore|slut|bastard|scam|drugs|cocaine|weapon)\b/,
];

// إعلانات خارجة عن اختصاص السوق (السيارات، العقارات، الهواتف، الأثاث وغيرها)
const OFF_TOPIC_PHRASES: RegExp[] = [
  // السيارات والمركبات
  /(?:^|\s)(?:سياره|سيارات|تويوتا|هيونداي|هونداي|كيا|نيسان|مرسيدس|لكزس|شيفروليه|شفروليه|دودج|تاهو|لاندكروزر|كامري|كورولا|سوناتا|النترا|اوبتما|سيراتو|سبورتاج|سورينتو|توسان|بيك اب|تكتك|توك توك|ستوته|دراجه ناريه|دراجه هوائيه|معرض سيارات|تاجير سيارات|قطع غيار سيارات)(?=\s|$)/,
  /\b(?:bmw|toyota|hyundai|kia|nissan|mercedes|lexus|camry|corolla|sonata|elantra)\b/,

  // العقارات والأراضي والإيجارات
  /(?:^|\s)(?:عقار|عقارات|شقه|شقق|بيت للبيع|دار للبيع|منزل للبيع|فيلا|فله|قطعه ارض|ارض سكنيه|ارض للبيع|طابو|مشتمل|للايجار|دار للايجار|بيت للايجار|شقه للايجار|محل للايجار|مكتب للايجار|عماره|شاليه|غرف للايجار)(?=\s|$)/,

  // الهواتف والإلكترونيات
  /(?:^|\s)(?:ايفون|سامسونج|جلاكسي|شاومي|ريدمي|هواوي|اوبو|فيفو|ريلمي|انفنكس|تكنو|نوكيا|ايباد|تابلت|لابتوب|كمبيوتر|حاسبه|حاسوب|بلايستيشن|اكس بوكس|موبايل للبيع|هاتف للبيع|تلفون للبيع|جوال للبيع|جهاز موبايل|ساعه ذكيه|تلفزيون|شاشه سمارت|شاشه بلازما)(?=\s|$)/,
  /\b(?:iphone|samsung|galaxy|xiaomi|redmi|huawei|oppo|vivo|realme|infinix|ipad|tablet|laptop|playstation|ps4|ps5|xbox)\b/,

  // الأثاث والأجهزة المنزلية والسلع العامة
  /(?:^|\s)(?:اثاث|غرفه نوم|غرف نوم|تخم|قنفه|قنفات|كنبه|كنبات|ديوانيه|سجاد|زوليه|كاونتر|طاوله طعام|ميز طعام|سرير نوم|كنتور|دولاب ملابس|كومدي|ستائر|ثلاجه|مجمده|غساله|سبلت|مكيف|طباخ|فرن غاز|مكنسه كهربائيه|ملابس|احذيه|حذاء|عطور|مكياج|ذهب للبيع|مجوهرات)(?=\s|$)/,
];

// كلمات هواتف وأثاث محددة في العنوان فقط (لتجنب حظر جملة "التواصل على الهاتف" في الوصف أو "بيت طيور"/"مكتب أعلاف")
const OFF_TOPIC_TITLE_ONLY: RegExp[] = [
  /(?:^|\s)(?:موبايل|موبايلات|هاتف|هواتف|تلفون|تلفونات|جوال|جوالات|طاوله|كراسي)(?=\s|$)/,
];

export function moderateAdContent(input: {
  title: string;
  description?: string;
  breed?: string;
}): ModerationResult {
  const normalizedTitle = normalizeArabicTextForModeration(input.title);
  const normalizedDesc = normalizeArabicTextForModeration(input.description || '');
  const normalizedBreed = normalizeArabicTextForModeration(input.breed || '');
  const combinedText = [normalizedTitle, normalizedDesc, normalizedBreed]
    .filter(Boolean)
    .join(' ');

  if (!combinedText) {
    return { allowed: true };
  }

  // 1. فحص الكلمات المسيئة أو غير الأخلاقية
  for (const pattern of BLOCKED_PROFANITY_PATTERNS) {
    if (pattern.test(combinedText)) {
      return {
        allowed: false,
        reason: 'profanity',
        message: PROFANITY_WARNING,
      };
    }
  }

  // 2. فحص الإعلانات الخارجة عن اختصاص السوق في العنوان والوصف
  // مع استثناء الإشارات الطبيعية مثل "توصيل بسيارة" داخل وصف إعلان دواجن
  const textWithoutDeliveryCar = combinedText.replace(
    /(?:توصيل|نقل)\s+(?:ب)?سيار[هة]/g,
    ' '
  );

  for (const pattern of OFF_TOPIC_PHRASES) {
    if (pattern.test(textWithoutDeliveryCar)) {
      return {
        allowed: false,
        reason: 'off_topic',
        message: MARKET_SCOPE_WARNING,
      };
    }
  }

  // فحص كلمات البيع التقنية/العامة في العنوان فقط (لتجنب حظر جملة "التواصل على الهاتف" في الوصف)
  for (const pattern of OFF_TOPIC_TITLE_ONLY) {
    if (pattern.test(normalizedTitle)) {
      return {
        allowed: false,
        reason: 'off_topic',
        message: MARKET_SCOPE_WARNING,
      };
    }
  }

  return { allowed: true };
}
