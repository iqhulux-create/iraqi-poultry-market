export interface SavedSellerProfile {
  sellerName: string;
  phone: string;
  governorate: string;
}

const SELLER_PROFILE_STORAGE_KEY = 'iraqi_poultry_seller_profile';

export function getSavedSellerProfile(): SavedSellerProfile | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(SELLER_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedSellerProfile> | null;
    if (!parsed || typeof parsed !== 'object') return null;

    return {
      sellerName: typeof parsed.sellerName === 'string' ? parsed.sellerName : '',
      phone: typeof parsed.phone === 'string' ? parsed.phone : '',
      governorate: typeof parsed.governorate === 'string' ? parsed.governorate : '',
    };
  } catch {
    return null;
  }
}

export function saveSellerProfile(profile: Partial<SavedSellerProfile>): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const existing = getSavedSellerProfile();
    const cleanName = (profile.sellerName ?? '').trim();
    const cleanPhone = (profile.phone ?? '').trim();
    const cleanGov = (profile.governorate ?? '').trim();

    const next: SavedSellerProfile = {
      sellerName:
        cleanName && cleanName !== 'بدون اسم'
          ? cleanName
          : existing?.sellerName || '',
      phone: cleanPhone ? cleanPhone : existing?.phone || '',
      governorate:
        cleanGov && cleanGov !== 'جميع المحافظات'
          ? cleanGov
          : existing?.governorate || 'بغداد',
    };

    window.localStorage.setItem(SELLER_PROFILE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage quota errors
  }
}
