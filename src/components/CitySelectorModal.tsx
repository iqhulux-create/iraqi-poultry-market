import React, { useState } from 'react';
import { X, MapPin, Check, Search } from 'lucide-react';
import { IRAQI_GOVERNORATES } from '../data/mockData';

interface CitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

export const CitySelectorModal: React.FC<CitySelectorModalProps> = ({
  isOpen,
  onClose,
  selectedCity,
  onSelectCity,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  const filteredGovernorates = IRAQI_GOVERNORATES.filter((city) =>
    city.toLowerCase().includes(filterQuery.trim().toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#EAFBF1] text-[#27AE60] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">اختر المحافظة</h3>
              <p className="text-xs text-slate-500">تصفح العروض في محافظتك أو كافة العراق</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Input */}
        <div className="p-4 border-b border-slate-100 bg-[#F8F9FA]">
          <div className="relative flex items-center bg-white rounded-xl border border-slate-200 px-3 h-10">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="ابحث عن اسم المحافظة..."
              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden"
              autoFocus
            />
          </div>
        </div>

        {/* List of Governorates */}
        <div className="overflow-y-auto p-3 space-y-1 divide-y divide-slate-50">
          {filteredGovernorates.map((city) => {
            const isSelected = selectedCity === city;
            return (
              <button
                key={city}
                onClick={() => {
                  onSelectCity(city);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-right text-sm transition-all ${
                  isSelected
                    ? 'bg-[#EAFBF1] text-[#27AE60] font-bold'
                    : 'hover:bg-slate-50 text-slate-700 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{city === 'جميع المحافظات' ? '🇮🇶' : '📍'}</span>
                  <span>{city}</span>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#27AE60] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
