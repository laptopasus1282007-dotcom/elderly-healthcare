'use client';

import React from 'react';
import { Sun, Moon, Volume2, Shield, HeartPulse, User, LogOut } from 'lucide-react';

interface NavbarProps {
  currentRole: 'ELDERLY' | 'CAREGIVER' | null;
  language: 'mr' | 'en';
  onLanguageChange: (lang: 'mr' | 'en') => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  fontScale: 'normal' | 'large' | 'xl';
  onFontScaleChange: (scale: 'normal' | 'large' | 'xl') => void;
  onSwitchRole: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  language,
  onLanguageChange,
  highContrast,
  onToggleHighContrast,
  fontScale,
  onFontScaleChange,
  onSwitchRole,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-600 text-white p-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <HeartPulse className="w-8 h-8" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              AyuCare <span className="text-emerald-600 text-sm font-semibold uppercase tracking-wider px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-full border border-emerald-200 dark:border-emerald-800">आयुकेअर</span>
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              {language === 'mr' ? 'स्मार्ट वृद्ध आरोग्य व औषध व्यवस्थापन' : 'Smart Elderly Healthcare & Medication Platform'}
            </p>
          </div>
        </div>

        {/* Accessibility & Role Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Font Resizing Controls (A / A+ / A++) */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700" title="अक्षरांचा आकार बदला / Font Size">
            <button
              onClick={() => onFontScaleChange('normal')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                fontScale === 'normal' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600' : 'text-slate-600 dark:text-slate-300'
              }`}
              aria-label="Normal Font Size"
            >
              A
            </button>
            <button
              onClick={() => onFontScaleChange('large')}
              className={`px-2.5 py-1 text-sm font-bold rounded-lg transition-all ${
                fontScale === 'large' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600' : 'text-slate-600 dark:text-slate-300'
              }`}
              aria-label="Large Font Size"
            >
              A+
            </button>
            <button
              onClick={() => onFontScaleChange('xl')}
              className={`px-2.5 py-1 text-base font-bold rounded-lg transition-all ${
                fontScale === 'xl' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600' : 'text-slate-600 dark:text-slate-300'
              }`}
              aria-label="Extra Large Font Size"
            >
              A++
            </button>
          </div>

          {/* High Contrast Mode Toggle */}
          <button
            onClick={onToggleHighContrast}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-500 shadow-lg'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
            title="High Contrast Mode (मोतीबिंदू किंवा दृष्टीच्या सोयीसाठी)"
            aria-label="Toggle High Contrast Mode"
          >
            {highContrast ? <Sun className="w-5 h-5 text-black" /> : <Moon className="w-5 h-5" />}
            <span className="hidden lg:inline">{highContrast ? 'सामान्य' : 'हाय कॉन्ट्रास्ट'}</span>
          </button>

          {/* Language Switcher (मराठी / English) */}
          <button
            onClick={() => onLanguageChange(language === 'mr' ? 'en' : 'mr')}
            className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
          >
            {language === 'mr' ? 'English' : 'मराठी'}
          </button>

          {/* Current Role Badge */}
          {currentRole && (
            <div className="flex items-center gap-1.5">
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                currentRole === 'ELDERLY'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
              }`}>
                {currentRole === 'ELDERLY' ? '👵 आजी/आजोबा मोड' : '👨‍⚕️ केअरटेकर पोर्टल'}
              </span>

              <button
                onClick={onSwitchRole}
                className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="रोल बदला / Switch Role"
                aria-label="Switch Role"
              >
                <User className="w-5 h-5" />
              </button>

              <button
                onClick={onLogout}
                className="p-2 text-rose-500 hover:text-rose-700 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="लॉगआउट / Logout"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
