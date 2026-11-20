import React, { useState, useEffect, useCallback } from 'react';
import {
  Info,
  X,
  ExternalLink,
  Tag,
  MessageSquare,
  Globe,
  Mail,
  Phone,
} from 'lucide-react';
import { AppInfoData } from '../types';

interface AboutAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiUrl: string;
}

const STATIC_APP_ABOUT =
  'منصة عراقية متخصصة لبيع وشراء الدواجن، الطيور، الحمام الزاجل، الأعلاف والمستلزمات البيطرية في جميع محافظات العراق بسهولة ومباشرة بين البائع والمشتري بدون عمولة.';

// قيم احتياطية افتراضية تُستخدم فقط إذا تعذر الاتصال بالإنترنت
const DEFAULT_FALLBACK_APP_INFO: AppInfoData = {
  version: '1.0.0',
  contact: 'alimohammed@gmail.com',
};

interface ContactLinkMeta {
  href: string | null;
  isExternalWeb: boolean;
  type: 'email' | 'phone' | 'web' | 'text';
}

function resolveContactLink(rawContact: string): ContactLinkMeta {
  const value = rawContact.trim();
  if (!value) {
    return { href: null, isExternalWeb: false, type: 'text' };
  }

  // Email address (with or without mailto:)
  if (value.toLowerCase().startsWith('mailto:')) {
    return { href: value, isExternalWeb: false, type: 'email' };
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return { href: `mailto:${value}`, isExternalWeb: false, type: 'email' };
  }

  // Phone number (with or without tel:)
  if (value.toLowerCase().startsWith('tel:')) {
    return { href: value, isExternalWeb: false, type: 'phone' };
  }
  if (/^\+?[\d\s\-()]{6,}$/.test(value)) {
    const normalizedPhone = value.replace(/[^\d+]/g, '');
    return { href: `tel:${normalizedPhone}`, isExternalWeb: false, type: 'phone' };
  }

  // Telegram @username
  if (/^@[a-zA-Z0-9_]{3,}$/.test(value)) {
    return {
      href: `https://t.me/${value.slice(1)}`,
      isExternalWeb: true,
      type: 'web',
    };
  }

  // Explicit HTTP / HTTPS URL
  try {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const parsed = new URL(withProtocol);
    if (
      (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
      parsed.hostname.includes('.')
    ) {
      return {
        href: parsed.toString(),
        isExternalWeb: true,
        type: 'web',
      };
    }
  } catch {
    // Fall through to plain text
  }

  return { href: null, isExternalWeb: false, type: 'text' };
}

function buildFreshApiUrl(baseUrl: string): string {
  const sep = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${sep}_t=${Date.now()}`;
}

export const AboutAppModal: React.FC<AboutAppModalProps> = ({
  isOpen,
  onClose,
  apiUrl,
}) => {
  const [appInfo, setAppInfo] = useState<AppInfoData>(DEFAULT_FALLBACK_APP_INFO);

  const fetchLiveAppInfoSilently = useCallback(
    async (signal?: AbortSignal) => {
      const targetUrl = apiUrl.trim();
      if (!targetUrl) return;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const onExternalAbort = () => controller.abort();
        signal?.addEventListener('abort', onExternalAbort, { once: true });

        // جلب مباشر ومحدث من Google Sheets دون تخزين مؤقت (مع معامل زمني لمنع كاش المتصفح)
        const response = await fetch(buildFreshApiUrl(targetUrl), {
          method: 'GET',
          cache: 'no-store',
          redirect: 'follow',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        signal?.removeEventListener('abort', onExternalAbort);

        if (!response.ok || signal?.aborted) return;

        const raw = await response.json();
        if (signal?.aborted) return;

        const payload = raw?.data && typeof raw.data === 'object' ? raw.data : raw;
        const version = String(payload?.version ?? '').trim();
        const contact = String(payload?.contact ?? '').trim();
        if (!version && !contact) return;

        setAppInfo({
          version: version || DEFAULT_FALLBACK_APP_INFO.version,
          contact: contact || DEFAULT_FALLBACK_APP_INFO.contact,
        });
      } catch {
        // صمت تام عند انقطاع الاتصال دون أي تنبيه بصري
      }
    },
    [apiUrl]
  );

  // جلب البيانات بصمت فور فتح التطبيق وفي كل مرة يتم فيها فتح نافذة "حول التطبيق"
  useEffect(() => {
    const controller = new AbortController();
    void fetchLiveAppInfoSilently(controller.signal);
    return () => controller.abort();
  }, [fetchLiveAppInfoSilently]);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    void fetchLiveAppInfoSilently(controller.signal);
    return () => controller.abort();
  }, [isOpen, fetchLiveAppInfoSilently]);

  if (!isOpen) return null;

  const contactMeta = resolveContactLink(appInfo.contact);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-app-dialog-title"
      >
        {/* Dialog Header */}
        <div className="bg-gradient-to-l from-[#27AE60] to-[#219653] px-5 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 id="about-app-dialog-title" className="text-base font-extrabold truncate">
                حول التطبيق
              </h3>
              <p className="text-[11px] text-white/85 truncate">
                سوق الدواجن والطيور العراقي
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dialog Body */}
        <div className="p-5 space-y-3.5">
          {/* 1. نبذة عن التطبيق */}
          <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-slate-100 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#219653]">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>نبذة عن التطبيق</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {STATIC_APP_ABOUT}
            </p>
          </div>

          {/* 2. رقم الإصدار الحالي (version) */}
          <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Tag className="w-4 h-4 text-[#27AE60]" />
              <span>إصدار التطبيق الحالي</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#EAFBF1] text-[#219653] text-xs font-extrabold font-mono border border-[#27AE60]/25">
              v{appInfo.version.replace(/^v/i, '')}
            </span>
          </div>

          {/* 3. رابط أو معلومات التواصل كزر تفاعلي قابل للنقر (contact) */}
          <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-slate-100 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              {contactMeta.type === 'email' ? (
                <Mail className="w-4 h-4 text-[#27AE60]" />
              ) : contactMeta.type === 'phone' ? (
                <Phone className="w-4 h-4 text-[#27AE60]" />
              ) : (
                <Globe className="w-4 h-4 text-[#27AE60]" />
              )}
              <span>للإعلان والاستفسارات - تواصل معنا</span>
            </div>

            {contactMeta.href ? (
              <a
                href={contactMeta.href}
                target={contactMeta.isExternalWeb ? '_blank' : undefined}
                rel={contactMeta.isExternalWeb ? 'noopener noreferrer' : undefined}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#27AE60] hover:bg-[#219653] text-white font-bold text-xs sm:text-sm flex items-center justify-between gap-2 transition-all active:scale-[0.99] shadow-sm shadow-[#27AE60]/20"
              >
                <span className="truncate font-mono dir-ltr">{appInfo.contact}</span>
                <span className="inline-flex items-center gap-1 shrink-0 bg-white/20 px-2 py-0.5 rounded-lg text-[11px]">
                  <span>تواصل الآن</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </a>
            ) : (
              <div className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 truncate">
                {appInfo.contact}
              </div>
            )}
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
