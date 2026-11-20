import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Listing } from '../types';

interface ReportConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
  onConfirmReport: (listing: Listing) => Promise<void>;
}

export const ReportConfirmModal: React.FC<ReportConfirmModalProps> = ({
  isOpen,
  onClose,
  listing,
  onConfirmReport,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !listing) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmReport(listing);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => !isSubmitting && onClose()}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-100 flex flex-col"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-ad-dialog-title"
      >
        {/* Header */}
        <div className="p-5 text-center bg-amber-50/70 border-b border-amber-100">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <span aria-hidden="true">🚩</span>
          </div>
          <h3 id="report-ad-dialog-title" className="text-lg font-extrabold text-slate-900">
            الإبلاغ عن إعلان مخالف
          </h3>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 text-right">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-1">
            <div className="font-bold text-slate-900 truncate text-sm">
              {listing.title}
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>البائع: {listing.seller_name || listing.sellerName}</span>
              <span>{listing.city}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 text-amber-950 text-xs sm:text-sm border border-amber-200/70 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              هل تريد الإبلاغ عن هذا الإعلان لكونه مخالفاً؟
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md shadow-red-600/25 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الإرسال...</span>
              </>
            ) : (
              <>
                <span aria-hidden="true">🚩</span>
                <span>تأكيد البلاغ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
