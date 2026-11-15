'use client';

import React, { useState } from 'react';
import { KeyRound, ShieldCheck, Heart, UserCheck, Delete, ArrowRight } from 'lucide-react';

interface PasscodeModalProps {
  isOpen: boolean;
  onSuccess: (role: 'ELDERLY' | 'CAREGIVER', userDetails: any) => void;
  language: 'mr' | 'en';
}

export const PasscodeModal: React.FC<PasscodeModalProps> = ({
  isOpen,
  onSuccess,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'ELDERLY' | 'CAREGIVER'>('ELDERLY');
  const [pin, setPin] = useState<string>('');
  const [caregiverCode, setCaregiverCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePinInput = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError('');
      if (nextPin.length === 4) {
        verify(nextPin, 'ELDERLY');
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const verify = async (code: string, type: 'ELDERLY' | 'CAREGIVER') => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, type }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess(data.role, data.patient || data.caregiver);
      } else {
        setError(data.error || 'अवैध पासकोड. पुन्हा प्रयत्न करा.');
        if (type === 'ELDERLY') setPin('');
      }
    } catch (err: any) {
      setError('सर्व्हर एरर. पुन्हा प्रयत्न करा.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden p-6 sm:p-8">
        
        {/* Header Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-6">
          <button
            onClick={() => { setActiveTab('ELDERLY'); setError(''); }}
            className={`flex-1 py-3 px-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'ELDERLY'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Heart className="w-4 h-4" />
            {language === 'mr' ? '👵 वयोवृद्ध लॉगिन (४-PIN)' : '👵 Elderly (4-Digit PIN)'}
          </button>
          <button
            onClick={() => { setActiveTab('CAREGIVER'); setError(''); }}
            className={`flex-1 py-3 px-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'CAREGIVER'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            {language === 'mr' ? '👨‍⚕️ कुटुंब / डॉक्टर' : '👨‍⚕️ Caregiver / Doctor'}
          </button>
        </div>

        {/* Tab 1: Elderly 4-digit PIN */}
        {activeTab === 'ELDERLY' ? (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {language === 'mr' ? 'आपला ४-अंकी PIN टाका' : 'Enter your 4-Digit PIN'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {language === 'mr' ? 'क्लिष्ट पासवर्डची गरज नाही, फक्त तुमचा सोपा पिन' : 'No complex password needed, just your quick pin'}
              </p>
            </div>

            {/* PIN Dots Display */}
            <div className="flex justify-center items-center gap-4 mb-6">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all ${
                    pin.length > i
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 scale-105'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {pin.length > i ? '●' : ''}
                </div>
              ))}
            </div>

            {error && (
              <p className="text-center text-sm font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl mb-4">
                {error}
              </p>
            )}

            {/* Giant Keypad for Elderly Accessibility */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  onClick={() => handlePinInput(num)}
                  className="h-16 text-2xl font-bold rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-emerald-100 dark:hover:bg-emerald-950 hover:text-emerald-700 active:scale-95 transition-all shadow-sm border border-slate-200 dark:border-slate-700"
                >
                  {num}
                </button>
              ))}
              <div />
              <button
                onClick={() => handlePinInput('0')}
                className="h-16 text-2xl font-bold rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-emerald-100 dark:hover:bg-emerald-950 active:scale-95 transition-all shadow-sm border border-slate-200 dark:border-slate-700"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-16 flex items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100 active:scale-95 transition-all border border-rose-200 dark:border-rose-800"
                aria-label="Delete"
              >
                <Delete className="w-7 h-7" />
              </button>
            </div>

            {/* Quick Demo Autofill Pill */}
            <button
              onClick={() => { setPin('1234'); verify('1234', 'ELDERLY'); }}
              className="w-full text-center py-2 text-xs font-semibold text-emerald-600 hover:underline"
            >
              👉 {language === 'mr' ? 'डेमो पिन लगेच भरा: [1234]' : 'Quick Demo Autofill: [1234]'}
            </button>
          </div>
        ) : (
          /* Tab 2: Caregiver Passcode */
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {language === 'mr' ? 'केअरटेकर पासकोड टाका' : 'Enter Caregiver Passcode'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {language === 'mr' ? 'कुटुंब सदस्य किंवा डॉक्टरांसाठी सुरक्षित पासकोड' : 'Family member or attending doctor secure access'}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder={language === 'mr' ? 'उदा. CARE-2026' : 'e.g. CARE-2026'}
                value={caregiverCode}
                onChange={e => { setCaregiverCode(e.target.value.toUpperCase()); setError(''); }}
                className="w-full text-center text-xl font-mono tracking-widest uppercase p-4 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
              />

              {error && (
                <p className="text-center text-sm font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl">
                  {error}
                </p>
              )}

              <button
                onClick={() => verify(caregiverCode, 'CAREGIVER')}
                disabled={loading || !caregiverCode}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-lg transition-all"
              >
                <span>{language === 'mr' ? 'डॅशबोर्ड उघडा' : 'Access Dashboard'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Demo Autofill Pill */}
            <button
              onClick={() => { setCaregiverCode('CARE-2026'); verify('CARE-2026', 'CAREGIVER'); }}
              className="w-full text-center py-2 text-xs font-semibold text-blue-600 hover:underline"
            >
              👉 {language === 'mr' ? 'डेमो पासकोड लगेच भरा: [CARE-2026]' : 'Quick Demo Passcode: [CARE-2026]'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
