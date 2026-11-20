import React, { useState } from 'react';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { Listing } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
  onConfirmDelete: (listing: Listing) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  listing,
  onConfirmDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !listing) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirmDelete(listing);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100 flex flex-col"
        dir="rtl"
      >
        {/* Warning Header */}
        <div className="p-5 text-center bg-red-50/70 border-b border-red-100">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Trash2 className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">
            تأكيد حذف الإعلان
          </h3>
        </div>

        {/* Content Details */}
        <div className="p-5 space-y-3 text-right">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-1">
            <div className="font-bold text-slate-900 truncate text-sm">
              {listing.title}
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>السعر: <strong className="text-[#27AE60]">{listing.price.toLocaleString('ar-IQ')} د.ع</strong></span>
              <span>المحافظة: {listing.city}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 text-amber-900 text-xs border border-amber-200/70">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              هل أنت متأكد من رغبتك في حذف هذا الإعلان؟ سيتم إزالته نهائياً من السوق ولن يظهر للمستخدمين الآخرين.
            </p>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 border-t border-slate-100 bg-white grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            تراجع
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirm}
            className="h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md shadow-red-600/30 disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الحذف...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>نعم، حذف الإعلان</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
