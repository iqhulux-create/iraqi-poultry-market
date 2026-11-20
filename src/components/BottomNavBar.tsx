import React from 'react';
import { Home, Heart, FileText, MessageSquare, User } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  favoritesCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  favoritesCount,
}) => {
  return (
    <nav
      className="bg-white border-t border-slate-200/80 px-2 py-2 flex items-center justify-around shrink-0 relative z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]"
      dir="rtl"
    >
      {/* Home Tab */}
      <button
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          activeTab === 'home' ? 'text-[#27AE60] font-bold' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Home className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[11px] mt-0.5">الرئيسية</span>
      </button>

      {/* Favorites Tab */}
      <button
        onClick={() => onSelectTab('favorites')}
        className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
          activeTab === 'favorites' ? 'text-[#27AE60] font-bold' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <div className="relative">
          <Heart className="w-5 h-5 stroke-[2.2]" />
          {favoritesCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {favoritesCount}
            </span>
          )}
        </div>
        <span className="text-[11px] mt-0.5">المفضلة</span>
      </button>

      {/* My Ads Tab */}
      <button
        onClick={() => onSelectTab('my_ads')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          activeTab === 'my_ads' ? 'text-[#27AE60] font-bold' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <FileText className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[11px] mt-0.5">إعلاناتي</span>
      </button>

      {/* Messages Tab */}
      <button
        onClick={() => onSelectTab('messages')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          activeTab === 'messages' ? 'text-[#27AE60] font-bold' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <MessageSquare className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[11px] mt-0.5">الرسائل</span>
      </button>

      {/* Account Tab */}
      <button
        onClick={() => onSelectTab('account')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          activeTab === 'account' ? 'text-[#27AE60] font-bold' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <User className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[11px] mt-0.5">حسابي</span>
      </button>
    </nav>
  );
};
