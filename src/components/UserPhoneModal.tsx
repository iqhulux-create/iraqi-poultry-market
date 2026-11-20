import React, { useState } from 'react';
import { X, Phone, UserCheck, Link, ShieldAlert, Check } from 'lucide-react';

interface UserPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserPhone: string;
  onUpdateUserPhone: (newPhone: string) => void;
  appsScriptUrl: string;
  onUpdateAppsScriptUrl: (newUrl: string) => void;
}

export const UserPhoneModal: React.FC<UserPhoneModalProps> = ({
  isOpen,
  onClose,
  currentUserPhone,
  onUpdateUserPhone,
  appsScriptUrl,
  onUpdateAppsScriptUrl,
}) => {
  const [phoneInput, setPhoneInput] = useState(currentUserPhone);
  const [scriptUrlInput, setScriptUrlInput] = useState(appsScriptUrl);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.trim()) {
      onUpdateUserPhone(phoneInput.trim());
    }
    onUpdateAppsScriptUrl(scriptUrlInput.trim());
    onClose();
  };

  const presetProfiles = [
    { label: 'أبو فهد (صاحب إعلان دجاج بلدي)', phone: '07701234567' },
    { label: 'هاوي الزواجل (صاحب إعلان حمام زاجل)', phone: '07809876543' },
    { label: 'مشتري / مستخدم عادي آخر', phone: '07799998888' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAFBF1] text-[#27AE60] flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">حساب المستخدم وصلاحية الحذف</h3>
              <p className="text-xs text-slate-500">التحقق من رقم الهاتف لحذف الإعلانات التابعة لك</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Info Banner */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              وفقاً لقواعد الأمان: يظهر زر <strong>«حذف الإعلان»</strong> باللون الأحمر فقط إذا تطابق رقم هاتف المستخدم الحالي مع رقم هاتف معلن السلعة.
            </p>
          </div>

          {/* Quick Select Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              اختر حساباً للتجربة السريعة:
            </label>
            <div className="space-y-1.5">
              {presetProfiles.map((p) => {
                const isActive = phoneInput === p.phone;
                return (
                  <button
                    type="button"
                    key={p.phone}
                    onClick={() => setPhoneInput(p.phone)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-right transition-colors border ${
                      isActive
                        ? 'bg-[#EAFBF1] text-[#27AE60] border-[#27AE60]/40 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/60'
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className="font-mono dir-ltr text-slate-500">{p.phone}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Phone Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              رقم هاتف المستخدم المسجل حالياً:
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="07701234567"
                className="w-full h-11 px-3 bg-[#F8F9FA] border border-slate-200 rounded-xl text-sm focus:border-[#27AE60] focus:bg-white focus:outline-hidden dir-ltr text-right"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Google Apps Script Web App URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Link className="w-3.5 h-3.5 text-slate-500" />
              <span>رابط Google Apps Script (اختياري للربط مع Google Sheet):</span>
            </label>
            <input
              type="url"
              value={scriptUrlInput}
              onChange={(e) => setScriptUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full h-10 px-3 bg-[#F8F9FA] border border-slate-200 rounded-xl text-xs focus:border-[#27AE60] focus:bg-white focus:outline-hidden dir-ltr font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              سيتم إرسال معرف الإعلان <code className="text-[#27AE60]">adId</code> إلى هذا الرابط عند الحذف.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#27AE60] hover:bg-[#219653] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md shadow-[#27AE60]/20"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>حفظ وتطبيق</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
