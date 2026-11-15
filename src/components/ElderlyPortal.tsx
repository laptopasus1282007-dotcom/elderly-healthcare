'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, CheckCircle2, XCircle, AlertTriangle, PhoneCall, Heart, Clock, Smile, Meh, Frown, Sparkles } from 'lucide-react';
import { Medication, DoseLog, Patient } from '@/types';

interface ElderlyPortalProps {
  patient: Patient;
  language: 'mr' | 'en';
}

export const ElderlyPortal: React.FC<ElderlyPortalProps> = ({ patient, language }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string>('');
  const [sosActive, setSosActive] = useState<boolean>(false);
  const [playingAudio, setPlayingAudio] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [medRes, adhRes] = await Promise.all([
        fetch('/api/medications?active=true'),
        fetch('/api/adherence'),
      ]);
      const medData = await medRes.json();
      const adhData = await adhRes.json();

      if (medData.success) setMedications(medData.medications);
      if (adhData.success) setDoseLogs(adhData.recentLogs || []);
    } catch (err) {
      console.error('Failed to load elderly data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Find the next or current pending medication
  const pendingMed = medications.find(m => {
    const log = doseLogs.find(l => l.medicationId === m.id);
    return !log || log.status === 'PENDING';
  }) || medications[0];

  // Speech Synthesis for Marathi / Hindi / English
  const playVoiceReminder = (med: Medication) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = language === 'mr'
        ? `${patient.marathiName || patient.name}, तुमची ${med.marathiName || med.name} गोळी घेण्याची वेळ झाली आहे. ${med.instruction}.`
        : `Hello ${patient.name}, it is time to take ${med.name}. ${med.instruction}.`;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for elderly clarity
      utterance.pitch = 1.0;
      utterance.lang = language === 'mr' ? 'mr-IN' : 'en-IN';

      setPlayingAudio(true);
      utterance.onend = () => setPlayingAudio(false);
      utterance.onerror = () => setPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Mark dose status
  const handleMarkDose = async (medId: string, status: 'TAKEN' | 'SKIPPED') => {
    try {
      const res = await fetch(`/api/medications/${medId}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          recordedBy: 'ELDERLY',
          note: status === 'TAKEN' ? 'Marked by elderly one-tap' : 'Skipped by elderly',
        }),
      });
      if (res.ok) {
        setActionMessage(status === 'TAKEN' ? '✅ गोळी घेतली म्हणून नोंद झाली!' : '⚠️ गोळी वगळली म्हणून नोंद झाली.');
        setTimeout(() => setActionMessage(''), 4000);
        fetchData();
      }
    } catch (err) {
      console.error('Error logging dose:', err);
    }
  };

  // Emergency SOS Trigger
  const triggerSos = async () => {
    setSosActive(true);
    // Play loud siren beep using Web Audio API
    if (typeof window !== 'undefined') {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.5);
      } catch (e) {
        console.warn('AudioContext not allowed without gesture', e);
      }
    }

    try {
      await fetch('/api/alerts/emergency-sos', { method: 'POST' });
    } catch (err) {
      console.error('SOS call error:', err);
    }
  };

  // Quick Daily Mood Check-in
  const logMood = async (mood: 'HAPPY' | 'NORMAL' | 'TIRED' | 'DIZZY') => {
    try {
      await fetch('/api/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood }),
      });
      setActionMessage('💖 आजच्या आरोग्याची नोंद झाली. धन्यवाद!');
      setTimeout(() => setActionMessage(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Warm Elderly Greeting */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              {language === 'mr' ? `नमस्कार, ${patient.marathiName || patient.name}! 🙏` : `Hello, ${patient.name}! 🙏`}
            </h1>
            <p className="text-emerald-100 text-lg mt-1 font-medium">
              {language === 'mr' ? 'आजच्या औषधांची वेळ आणि आरोग्य रुटीन' : "Today's medication schedule & health routine"}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-center self-start sm:self-auto">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-100">आजची तारीख</span>
            <p className="text-xl font-bold">{new Date().toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-200 rounded-2xl text-center text-xl font-black animate-bounce shadow-lg">
          {actionMessage}
        </div>
      )}

      {/* Main Focus: CURRENT / UPCOMING DOSE CARD (Extra Large Touch Target) */}
      {pendingMed ? (
        <div className="bg-white dark:bg-slate-900 border-4 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <span className="px-4 py-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold rounded-full text-sm sm:text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600 animate-pulse" />
              {language === 'mr' ? 'आता घेण्याची गोळी' : 'Due Medication Now'}
            </span>
            
            {/* Audio Readout Button */}
            <button
              onClick={() => playVoiceReminder(pendingMed)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-base transition-all ${
                playingAudio
                  ? 'bg-amber-400 text-black animate-pulse shadow-lg'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 hover:bg-emerald-100'
              }`}
              title="मोठ्याने ऐका / Speak Loudly"
              aria-label="Speak Medicine Reminder"
            >
              <Volume2 className="w-6 h-6 text-emerald-600" />
              <span>{language === 'mr' ? 'आवाजात ऐका' : 'Listen'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                {language === 'mr' ? (pendingMed.marathiName || pendingMed.name) : pendingMed.name}
              </h2>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {pendingMed.dosage}
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 font-semibold mt-2 flex items-center gap-2">
                👉 {pendingMed.instruction}
              </p>
            </div>
            
            {/* Visual Pill Indicator */}
            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl self-start sm:self-auto border border-slate-200 dark:border-slate-700">
              <div className={`w-12 h-12 rounded-full shadow-md flex items-center justify-center font-black text-white ${
                pendingMed.pillColor === 'blue' ? 'bg-blue-600' :
                pendingMed.pillColor === 'yellow' ? 'bg-amber-500' :
                pendingMed.pillColor === 'green' ? 'bg-emerald-600' : 'bg-slate-700'
              }`}>
                💊
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold block">वेळ (Time)</span>
                <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{pendingMed.scheduledTime}</span>
              </div>
            </div>
          </div>

          {/* GIANT ACTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => handleMarkDose(pendingMed.id, 'TAKEN')}
              className="py-6 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-3xl font-black text-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all"
            >
              <CheckCircle2 className="w-8 h-8" />
              <span>{language === 'mr' ? 'मी औषध घेतले' : 'Mark Taken'}</span>
            </button>

            <button
              onClick={() => handleMarkDose(pendingMed.id, 'SKIPPED')}
              className="py-6 px-6 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 rounded-3xl font-black text-xl flex items-center justify-center gap-3 transition-all border border-slate-300 dark:border-slate-700"
            >
              <XCircle className="w-7 h-7 text-amber-600" />
              <span>{language === 'mr' ? 'वगळले (Skip)' : 'Skip Dose'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-500 p-8 rounded-3xl text-center space-y-2">
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {language === 'mr' ? 'शाब्बास! आजची सर्व औषधे पूर्ण झाली आहेत.' : "All done! Today's medications are taken."}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            {language === 'mr' ? 'पुढील औषधाची वेळ झाल्यावर ॲप तुम्हाला आठवण करेल.' : 'We will notify you when your next dose is scheduled.'}
          </p>
        </div>
      )}

      {/* TODAY'S MEDICINE TIMELINE CARDS */}
      <div className="space-y-4">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <span>📋</span> {language === 'mr' ? "आजची सर्व औषधे (वेळापत्रक)" : "Today's Full Medication List"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medications.map(med => {
            const log = doseLogs.find(l => l.medicationId === med.id);
            const isTaken = log?.status === 'TAKEN';
            const isSkipped = log?.status === 'SKIPPED';

            return (
              <div
                key={med.id}
                className={`p-5 rounded-3xl border-2 transition-all flex items-center justify-between ${
                  isTaken
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-400'
                    : isSkipped
                    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {med.timingCategory} • {med.scheduledTime}
                  </span>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                    {language === 'mr' ? (med.marathiName || med.name) : med.name}
                  </h4>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    {med.dosage} — {med.instruction}
                  </p>
                </div>

                <div>
                  {isTaken ? (
                    <span className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-4 h-4" /> घेतले
                    </span>
                  ) : isSkipped ? (
                    <span className="px-3 py-1.5 bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center gap-1">
                      वगळले
                    </span>
                  ) : (
                    <button
                      onClick={() => handleMarkDose(med.id, 'TAKEN')}
                      className="px-4 py-2 bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl border border-slate-300 dark:border-slate-700 transition-colors"
                    >
                      घेतले ✅
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK DAILY MOOD & WELLBEING CHECK-IN */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500" />
          {language === 'mr' ? 'आज कसे वाटत आहे? (आरोग्य तपासणी)' : 'How are you feeling today? (Daily Check-in)'}
        </h3>
        <p className="text-sm text-slate-500">
          {language === 'mr' ? 'तुमच्या आरोग्याची स्थिती कुटुंबियांना कळवण्यासाठी एका चिन्हावर टॅप करा:' : 'Tap an emotion to log your wellness for caregivers:'}
        </p>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => logMood('HAPPY')}
            className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-300 flex flex-col items-center gap-2 active:scale-95 transition-all"
          >
            <Smile className="w-10 h-10 text-emerald-600" />
            <span className="text-base font-bold text-emerald-800 dark:text-emerald-200">
              {language === 'mr' ? 'छान वाटतंय' : 'Feeling Good'}
            </span>
          </button>

          <button
            onClick={() => logMood('NORMAL')}
            className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 border border-blue-300 flex flex-col items-center gap-2 active:scale-95 transition-all"
          >
            <Meh className="w-10 h-10 text-blue-600" />
            <span className="text-base font-bold text-blue-800 dark:text-blue-200">
              {language === 'mr' ? 'ठीक आहे' : 'Okay / Normal'}
            </span>
          </button>

          <button
            onClick={() => logMood('DIZZY')}
            className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-300 flex flex-col items-center gap-2 active:scale-95 transition-all"
          >
            <Frown className="w-10 h-10 text-rose-600" />
            <span className="text-base font-bold text-rose-800 dark:text-rose-200">
              {language === 'mr' ? 'थकवा / चक्कर' : 'Tired / Dizzy'}
            </span>
          </button>
        </div>
      </div>

      {/* GIANT RED EMERGENCY SOS BUTTON */}
      <div className="pt-4">
        <button
          onClick={triggerSos}
          className="w-full py-6 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-3xl font-black text-2xl sm:text-3xl shadow-2xl shadow-red-600/40 flex items-center justify-center gap-4 active:scale-95 transition-all border-4 border-red-400 animate-pulse"
        >
          <AlertTriangle className="w-10 h-10" />
          <span>{language === 'mr' ? '🚨 तातडीची मदत (EMERGENCY SOS)' : '🚨 EMERGENCY SOS ASSISTANCE'}</span>
        </button>

        {sosActive && (
          <div className="mt-4 p-6 bg-red-100 dark:bg-red-950 border-4 border-red-600 rounded-3xl text-center space-y-3">
            <h4 className="text-2xl font-black text-red-700 dark:text-red-300">
              🚨 कुटुंबियांना तातडीचा फोन/मेसेज पाठवला आहे!
            </h4>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
              संपर्क: {patient.emergencyContacts?.[0]?.name} ({patient.emergencyContacts?.[0]?.relationship})
            </p>
            <a
              href={`tel:${patient.emergencyContacts?.[0]?.phone}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-black text-xl rounded-2xl shadow-lg"
            >
              <PhoneCall className="w-6 h-6" />
              <span>कॉल करा: {patient.emergencyContacts?.[0]?.phone}</span>
            </a>
          </div>
        )}
      </div>

    </div>
  );
};
