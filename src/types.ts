export type CategoryId = 'all' | 'poultry' | 'birds' | 'feed' | 'vet';

export interface Category {
  id: CategoryId;
  label: string;
  icon?: string;
  badgeCount?: number;
}

export interface Listing {
  id: string;
  title: string;
  category: CategoryId;
  price: number; // in Iraqi Dinar
  city: string;
  governorate?: string;
  district: string;
  date: string;
  createdAtMs?: number;
  imageUrl: string;
  image?: string;
  images?: string[];
  videoUrl?: string;
  video?: string;
  sellerName: string;
  seller_name?: string;
  phone: string;
  whatsapp: string;
  isVerified: boolean;
  featured?: boolean;
  'is-pinned'?: boolean;
  reports?: number;
  status?: 'active' | 'reported' | string;
  isSold?: boolean;
  description: string;
  details?: {
    age?: string;
    quantity?: string;
    breed?: string;
    vaccinated?: boolean;
    deliveryAvailable?: boolean;
  };
}

export interface AndroidXmlFile {
  name: string;
  path: string;
  language: string;
  description: string;
  code: string;
}

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  image?: string;
  whatsapp?: string;
  linkUrl?: string;
  badgeText?: string;
  backgroundColor?: string;
  isActive: boolean;
}

export interface AppInfoData {
  version: string;
  contact: string;
}
