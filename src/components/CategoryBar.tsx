import React, { useRef } from 'react';
import { Category, CategoryId } from '../types';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-white border-b border-slate-100 py-2.5 px-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
        dir="rtl"
      >
        {categories.map((category) => {
          const isActive = selectedCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`shrink-0 h-10 px-4 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer select-none ${
                isActive
                  ? 'bg-[#27AE60] text-white shadow-sm shadow-[#27AE60]/25 font-bold'
                  : 'bg-[#EEF2F6] hover:bg-[#e2e8f0] text-slate-700 font-medium'
              }`}
              style={{
                backgroundColor: isActive ? '#27AE60' : '#EEF2F6',
                color: isActive ? '#FFFFFF' : '#1E293B',
              }}
              aria-pressed={isActive}
            >
              <span>{category.label}</span>
              {typeof category.badgeCount === 'number' && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-white text-slate-600'
                  }`}
                >
                  {category.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
