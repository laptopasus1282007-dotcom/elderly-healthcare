'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { PasscodeModal } from '@/components/PasscodeModal';
import { ElderlyPortal } from '@/components/ElderlyPortal';
import { CaregiverPortal } from '@/components/CaregiverPortal';
import { Patient } from '@/types';

export default function Home() {
  const [role, setRole] = useState<'ELDERLY' | 'CAREGIVER' | null>('ELDERLY');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [language, setLanguage] = useState<'mr' | 'en'>('mr');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'xl'>('normal');

  useEffect(() => {
    // Load initial patient profile
    fetch('/api/auth/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: '1234', type: 'ELDERLY' }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.patient) {
          setPatient(data.patient);
        }
      })
      .catch(console.error);
  }, []);

  const handleLoginSuccess = (newRole: 'ELDERLY' | 'CAREGIVER', userDetails: any) => {
    setRole(newRole);
    if (newRole === 'ELDERLY') {
      setPatient(userDetails);
    }
    setShowLoginModal(false);
  };

  return (
    <div className={`min-h-screen transition-all ${highContrast ? 'high-contrast' : ''} ${
      fontScale === 'large' ? 'font-scale-large' : fontScale === 'xl' ? 'font-scale-xl' : ''
    }`}>
      {/* Top Accessible Navbar */}
      <Navbar
        currentRole={role}
        language={language}
        onLanguageChange={setLanguage}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        fontScale={fontScale}
        onFontScaleChange={setFontScale}
        onSwitchRole={() => setShowLoginModal(true)}
        onLogout={() => { setRole(null); setShowLoginModal(true); }}
      />

      {/* Main Content Area */}
      <main className="pb-16">
        {role === 'ELDERLY' && patient && (
          <ElderlyPortal patient={patient} language={language} />
        )}

        {role === 'CAREGIVER' && (
          <CaregiverPortal language={language} />
        )}

        {!role && (
          <div className="max-w-md mx-auto mt-20 text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h2 className="text-2xl font-black">स्वागत आहे! / Welcome</h2>
            <p className="text-sm text-slate-500">
              कृपया पुढे जाण्यासाठी लॉगिन करा / Please sign in to continue
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg"
            >
              लॉगिन करा (Sign In)
            </button>
          </div>
        )}
      </main>

      {/* Passcode / PIN Login Modal */}
      <PasscodeModal
        isOpen={showLoginModal}
        onSuccess={handleLoginSuccess}
        language={language}
      />
    </div>
  );
}
