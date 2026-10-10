import React from 'react';
import { Trophy, ShieldCheck, LogOut, Sparkles, UserCheck } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isAdmin,
  onOpenAdminLogin,
  onAdminLogout
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-purple-200/60 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Title (One Line) */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-left group cursor-pointer shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-400 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Trophy className="w-5 h-5 text-amber-300 fill-amber-300" />
          </div>
          <div>
            <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-slate-900 flex items-center gap-1.5 whitespace-nowrap">
              TOEFL QUIZ BATTLE
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 hidden sm:inline" />
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-purple-600 cursor-pointer ${
              currentView === 'home' ? 'text-purple-600 font-bold' : ''
            }`}
          >
            Beranda
          </button>
          <button
            type="button"
            onClick={() => onNavigate('join')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-purple-600 cursor-pointer ${
              currentView === 'join' ? 'text-purple-600 font-bold' : ''
            }`}
          >
            Gabung Room
          </button>
          <button
            type="button"
            onClick={() => onNavigate('solo')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-purple-600 cursor-pointer ${
              currentView === 'solo' ? 'text-purple-600 font-bold' : ''
            }`}
          >
            Mode Mandiri
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-purple-600 cursor-pointer ${
                currentView === 'admin' ? 'text-purple-600 font-bold' : ''
              }`}
            >
              Dashboard Admin
            </button>
          )}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-1 rounded-lg">
                <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                Admin
              </span>
              <button
                type="button"
                onClick={onAdminLogout}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Keluar dari mode admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAdminLogin}
              className="px-3.5 py-2 text-xs font-bold text-purple-900 bg-purple-100 hover:bg-purple-200 border border-purple-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
