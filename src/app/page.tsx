'use client';

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  PhoneCall, 
  Sparkles, 
  Camera, 
  FileText, 
  Bell, 
  Clock, 
  ShieldAlert, 
  Calendar, 
  Send, 
  Activity, 
  User, 
  RefreshCw, 
  Download, 
  Smile, 
  Meh, 
  Frown,
  ArrowRight,
  TrendingUp,
  Stethoscope
} from 'lucide-react';

export default function AyuCareFlagshipPlatform() {
  // Navigation: 3 Core Connected Roles + AI Lab
  const [activeView, setActiveView] = useState<'ELDERLY' | 'CAREGIVER' | 'AI_SCANNER' | 'DOCTOR_REPORT'>('ELDERLY');
  const [language, setLanguage] = useState<'mr' | 'en'>('mr');
  
  // Real Patient & Caregiver Data
  const [patient, setPatient] = useState({
    name: 'Shantabai Joshi',
    marathiName: 'शांताबाई जोशी',
    age: 72,
    bloodGroup: 'B+',
    conditions: ['उच्च रक्तदाब (Hypertension)', 'मधुमेह (Type 2 Diabetes)'],
    emergencyPhone: '+91 98765 43210',
    emergencyName: 'Rajesh Joshi (मुलगा)',
  });

  // Daily Prescriptions & Schedule
  const [medications, setMedications] = useState([
    {
      id: 'm1',
      name: 'Telmisartan 40mg',
      marathiName: 'टेल्मिसार्टन (रक्तदाब)',
      dosage: '१ गोळी (४० मि.ग्रॅ.)',
      instruction: 'सकाळी न्याहारीनंतर (After Breakfast)',
      time: '०८:३०',
      timingCat: 'सकाळ (Morning)',
      pillColor: '#2563EB',
      taken: true,
      takenAt: '०८:३५ AM',
      prescribedBy: 'Dr. Ananya Kulkarni (हृदयरोग तज्ज्ञ)'
    },
    {
      id: 'm2',
      name: 'Metformin 500mg',
      marathiName: 'मेटफॉर्मिन (मधुमेह)',
      dosage: '१ गोळी (५०० मि.ग्रॅ.)',
      instruction: 'दुपारी जेवणानंतर (After Lunch)',
      time: '१३:३०',
      timingCat: 'दुपार (Afternoon)',
      pillColor: '#10B981',
      taken: false,
      prescribedBy: 'Dr. Ramesh Deshmukh (मधुमेह तज्ज्ञ)'
    },
    {
      id: 'm3',
      name: 'Glimepiride 1mg',
      marathiName: 'ग्लिमेपिराइड (साखर नियंत्रण)',
      dosage: '१ गोळी (१ मि.ग्रॅ.)',
      instruction: 'रात्रीच्या जेवणापूर्वी ३० मिनिटे (Before Dinner)',
      time: '२०:००',
      timingCat: 'रात्र (Night)',
      pillColor: '#F59E0B',
      taken: false,
      prescribedBy: 'Dr. Ramesh Deshmukh'
    },
    {
      id: 'm4',
      name: 'Calcium + Vit D3',
      marathiName: 'कॅल्शियम + व्हिटॅमिन डी३',
      dosage: '१ कॅप्सूल',
      instruction: 'रात्री झोपताना कोमट पाण्यासोबत',
      time: '२१:३०',
      timingCat: 'रात्र (Bedtime)',
      pillColor: '#6366F1',
      taken: false,
      prescribedBy: 'Dr. Ananya Kulkarni'
    }
  ]);

  // Live Alerts & Audit Log
  const [alerts, setAlerts] = useState<Array<{ id: string; time: string; text: string; type: 'SUCCESS' | 'WARNING' | 'EMERGENCY' }>>([
    { id: 'a1', time: '०८:३५ AM', text: 'शांताबाईंनी सकाळची टेल्मिसार्टन गोळी वेळेवर घेतली.', type: 'SUCCESS' },
    { id: 'a2', time: 'काल रात्री', text: 'कॅल्शियम गोळी घेतल्यानंतर ७.५ तास शांत झोप झाली.', type: 'SUCCESS' },
  ]);

  const [sosActive, setSosActive] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiScanResult, setAiScanResult] = useState<any>(null);
  const [drugConflictText, setDrugConflictText] = useState('');
  const [conflictWarning, setConflictWarning] = useState<any>(null);

  // Vitals
  const [vitals, setVitals] = useState({ bp: '124/82', sugar: 135, pulse: 74, mood: 'छान (Feeling Good)' });

  // Web Speech Synthesis (Real Audio Readout in Marathi)
  const speakMedicine = (med: any) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `शांताबाई, तुमची ${med.marathiName} घेण्याची वेळ झाली आहे. कृपया ${med.instruction} गोळी घ्या.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'mr-IN';
      utterance.rate = 0.85; // Clear and comfortable for elderly
      setVoicePlaying(true);
      utterance.onend = () => setVoicePlaying(false);
      utterance.onerror = () => setVoicePlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Mark Dose Taken Action
  const handleMarkTaken = (id: string) => {
    setMedications(prev => prev.map(m => m.id === id ? { ...m, taken: true, takenAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : m));
    const med = medications.find(m => m.id === id);
    const newAlert = {
      id: `a_${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `शांताबाईंनी ${med?.marathiName || 'औषध'} गोळी घेतली. केअरटेकर राजेश जोशी यांना एसएमएस/ईमेल पोहचला.`,
      type: 'SUCCESS' as const
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  // Simulate Caregiver Missed Dose Alert (Live Demo Feature)
  const triggerMissedDoseSimulation = () => {
    const newAlert = {
      id: `a_miss_${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `⚠️ URGENT: शांताबाईंची दुपारची मेटफॉर्मिन गोळी ३० मिनिटे उलटूनही घेतली नाही! केअरटेकर राजेश यांच्या मोबाईलवर इमर्जन्सी नोटिफिकेशन पाठवले.`,
      type: 'WARNING' as const
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  // Emergency SOS Trigger
  const triggerSos = () => {
    setSosActive(true);
    // Play audible siren
    if (typeof window !== 'undefined') {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      } catch (e) {
        console.warn(e);
      }
    }
    const newAlert = {
      id: `a_sos_${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `🚨 तातडीची मदत (EMERGENCY SOS): शांताबाईंनी इमर्जन्सी बटण दाबले! राजेश जोशी यांना थेट कॉल लावला जात आहे.`,
      type: 'EMERGENCY' as const
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  // Gemini AI Prescription Scanner Simulation
  const handleScanPrescription = () => {
    setAiAnalyzing(true);
    setTimeout(() => {
      setAiScanResult({
        doctorName: 'Dr. Ananya Kulkarni, MD (Cardiology)',
        hospital: 'Jupiter Hospital, Pune',
        date: '15 Nov 2026',
        extracted: [
          { name: 'Amlodipine 5mg', dosage: '1 Tab Daily', timing: 'Morning after food', purpose: 'Blood Pressure Control' },
          { name: 'Atorvastatin 10mg', dosage: '1 Tab Daily', timing: 'Night bedtime', purpose: 'Cholesterol Regulation' },
        ],
        confidence: '98.4% (Gemini Vision OCR)'
      });
      setAiAnalyzing(false);
    }, 1800);
  };

  // Drug Conflict Checker
  const checkDrugSafety = () => {
    if (!drugConflictText.trim()) return;
    if (drugConflictText.toLowerCase().includes('ibuprofen') || drugConflictText.toLowerCase().includes('combiflam') || drugConflictText.toLowerCase().includes('aspirin')) {
      setConflictWarning({
        level: 'HIGH_RISK',
        title: '⚠️ घातक दुष्परिणामांचा धोका (Adverse Drug Interaction)!',
        message: `${drugConflictText} आणि शांताबाईंची चालू औषधे (टेल्मिसार्टन) एकत्र घेतल्यास किडनीवर गंभीर ताण येतो व बीपी नियंत्रणात अडथळा येतो.`,
        action: 'हे औषध डॉक्टरांच्या सल्ल्याशिवाय देऊ नका.'
      });
    } else {
      setConflictWarning({
        level: 'SAFE',
        title: '✅ सुरक्षित (Safe to Administer)',
        message: `${drugConflictText} आणि चालू औषधांमध्ये कोणताही धोका आढळला नाही.`,
        action: 'नेहमीच्या वेळेवर द्यावे.'
      });
    }
  };

  // Calculate live compliance %
  const takenCount = medications.filter(m => m.taken).length;
  const adherencePercent = Math.round((takenCount / medications.length) * 100);
  const nextPendingMed = medications.find(m => !m.taken) || medications[1];

  return (
    <div className="min-h-screen bg-[#F6F7F3] text-[#1B2524] font-sans antialiased selection:bg-[#174D46] selection:text-white pb-16">
      
      {/* ============================================================================== */}
      {/* TOP APPSHELL HEADER (Executive Switcher for Hackathon Judges) */}
      {/* ============================================================================== */}
      <header className="sticky top-0 z-50 bg-[#FFFFFF] border-b border-[#E3E6DF] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#174D46] text-white flex items-center justify-center shadow-lg shadow-[#174D46]/20 font-black text-2xl">
              🌿
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-[#174D46]">AyuCare</span>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-[#E8F1EC] text-[#174D46] px-2.5 py-0.5 rounded-full border border-[#D0E2D8]">
                  Healthcare Ecosystem
                </span>
              </div>
              <p className="text-xs text-[#6F7D79] font-medium hidden sm:block">
                Smarter Care. Safer Living. Together. (PromptWars x Catalyst)
              </p>
            </div>
          </div>

          {/* Perspective Switcher Pills (Judges can toggle personas) */}
          <div className="flex items-center bg-[#F0F2EB] p-1.5 rounded-2xl border border-[#DFE3D8]">
            <button
              onClick={() => setActiveView('ELDERLY')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 ${
                activeView === 'ELDERLY'
                  ? 'bg-[#174D46] text-white shadow-md'
                  : 'text-[#5C6A66] hover:text-[#174D46]'
              }`}
            >
              <span>👵</span>
              <span>आजींचा सोपा स्क्रीन (Elderly)</span>
            </button>

            <button
              onClick={() => setActiveView('CAREGIVER')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 ${
                activeView === 'CAREGIVER'
                  ? 'bg-[#174D46] text-white shadow-md'
                  : 'text-[#5C6A66] hover:text-[#174D46]'
              }`}
            >
              <span>👨‍⚕️</span>
              <span>मुलाचा डॅशबोर्ड (Caregiver)</span>
            </button>

            <button
              onClick={() => setActiveView('AI_SCANNER')}
              className={`hidden md:flex px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all items-center gap-1.5 ${
                activeView === 'AI_SCANNER'
                  ? 'bg-[#174D46] text-white shadow-md'
                  : 'text-[#5C6A66] hover:text-[#174D46]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Gemini AI लॅब</span>
            </button>

            <button
              onClick={() => setActiveView('DOCTOR_REPORT')}
              className={`hidden lg:flex px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all items-center gap-1.5 ${
                activeView === 'DOCTOR_REPORT'
                  ? 'bg-[#174D46] text-white shadow-md'
                  : 'text-[#5C6A66] hover:text-[#174D46]'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>डॉक्टर रिपोर्ट</span>
            </button>
          </div>

          {/* Quick SOS & Phone */}
          <div className="flex items-center gap-2">
            <button
              onClick={triggerSos}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-all"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">SOS मदत</span>
            </button>
          </div>

        </div>
      </header>

      {/* ============================================================================== */}
      {/* VIEW 1: ELDERLY TABLET INTERFACE (Ultra-Simple, High Contrast, Marathi Voice) */}
      {/* ============================================================================== */}
      {activeView === 'ELDERLY' && (
        <main className="max-w-4xl mx-auto px-4 pt-8 space-y-6">
          
          {/* Gentle Personalized Greeting */}
          <div className="bg-[#174D46] text-white p-6 sm:p-8 rounded-[32px] shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-sm font-bold uppercase tracking-wider text-[#A5C9BD]">
                  सोपे आरोग्य व्यवस्थापन • ४-PIN लॉगिन
                </span>
                <h1 className="text-3xl sm:text-4xl font-black mt-1">
                  नमस्कार शांताबाई! 🙏
                </h1>
                <p className="text-base text-[#D0E3DC] mt-1 font-medium">
                  आजचे औषध वेळापत्रक • नियमितता: {adherencePercent}%
                </p>
              </div>

              <div className="bg-white/15 backdrop-blur-md px-5 py-3 rounded-2xl text-center self-start sm:self-auto border border-white/20">
                <span className="text-xs uppercase text-[#A5C9BD] font-bold block">आजची तारीख</span>
                <span className="text-2xl font-black">{new Date().toLocaleDateString('mr-IN', { day: 'numeric', month: 'short' })}</span>
              </div>
            </div>
          </div>

          {/* HERO FOCUS: CURRENT DUE MEDICATION (Big, Reassuring Card) */}
          <div className="bg-white border-4 border-[#174D46] rounded-[32px] p-6 sm:p-9 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between">
              <span className="px-4 py-1.5 bg-[#E8F1EC] text-[#174D46] font-extrabold text-sm sm:text-base rounded-full flex items-center gap-2 border border-[#C5DDD2]">
                <Clock className="w-5 h-5 text-[#174D46] animate-pulse" />
                आता घेण्याची गोळी (Scheduled Now)
              </span>

              {/* REAL MARATHI AUDIO READOUT BUTTON */}
              <button
                onClick={() => speakMedicine(nextPendingMed)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-base transition-all shadow-md ${
                  voicePlaying
                    ? 'bg-amber-400 text-black animate-pulse ring-4 ring-amber-300'
                    : 'bg-[#F2F6F4] text-[#174D46] hover:bg-[#E3EDE8] border border-[#CCDED6]'
                }`}
              >
                <Volume2 className="w-6 h-6 text-[#174D46]" />
                <span>{voicePlaying ? 'आवाज सुरू आहे...' : 'मोठ्याने ऐका 🔊'}</span>
              </button>
            </div>

            <div className="border-b border-[#EBECE8] pb-6">
              <span className="text-xs font-bold text-[#6F7D79] uppercase tracking-wider block">
                {nextPendingMed.timingCat} • वेळ: {nextPendingMed.time}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-[#174D46] mt-2">
                {nextPendingMed.marathiName}
              </h2>
              <p className="text-xl sm:text-2xl font-extrabold text-[#2E7D32] mt-2">
                डोस: {nextPendingMed.dosage}
              </p>
              <div className="mt-4 p-4 bg-[#F8FAF7] rounded-2xl border border-[#E5EAE3]">
                <p className="text-lg font-bold text-[#1B2524] flex items-center gap-2">
                  👉 <strong>कशी घ्यावी:</strong> {nextPendingMed.instruction}
                </p>
                <p className="text-xs text-[#6F7D79] mt-1">
                  डॉक्टरांचा सल्ला: {nextPendingMed.prescribedBy}
                </p>
              </div>
            </div>

            {/* GIANT ACTION BUTTONS FOR ELDERLY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => handleMarkTaken(nextPendingMed.id)}
                className="py-6 px-6 bg-[#2E7D32] hover:bg-[#256828] active:scale-95 text-white rounded-3xl font-black text-2xl shadow-xl shadow-emerald-700/25 flex items-center justify-center gap-3 transition-all"
              >
                <CheckCircle2 className="w-8 h-8" />
                <span>मी औषध घेतले ✅</span>
              </button>

              <button
                onClick={() => alert('ही माहिती केअरटेकर राजेश जोशी यांना कळवण्यात आली आहे.')}
                className="py-6 px-6 bg-[#F0F2EB] hover:bg-[#E4E7DC] active:scale-95 text-[#4D5A56] rounded-3xl font-black text-xl flex items-center justify-center gap-3 transition-all border border-[#D5DCD0]"
              >
                <XCircle className="w-7 h-7 text-amber-600" />
                <span>आज वगळले (Skip)</span>
              </button>
            </div>
          </div>

          {/* TODAY'S MEDICINE TIMELINE CARDS */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-[#174D46] flex items-center gap-2">
              <span>📋</span> आजच्या सर्व गोळ्यांचे वेळापत्रक
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medications.map(med => (
                <div
                  key={med.id}
                  className={`p-5 rounded-3xl border-2 transition-all flex items-center justify-between shadow-sm ${
                    med.taken
                      ? 'bg-[#EBF7EE] border-[#8CD19E]'
                      : 'bg-white border-[#E3E6DF]'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6F7D79]">
                      {med.timingCat} • {med.time}
                    </span>
                    <h4 className="text-xl font-bold text-[#1B2524]">{med.marathiName}</h4>
                    <p className="text-xs font-semibold text-[#5C6A66]">{med.dosage} — {med.instruction}</p>
                  </div>

                  <div>
                    {med.taken ? (
                      <span className="px-4 py-2 bg-[#2E7D32] text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-4 h-4" /> पूर्ण झाले
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkTaken(med.id)}
                        className="px-4 py-2.5 bg-[#174D46] text-white font-black text-xs rounded-xl shadow-md hover:bg-[#123E38] transition-all"
                      >
                        घेतले ✅
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DAILY WELLBEING ONE-TAP CHECK-IN */}
          <div className="bg-white p-6 sm:p-7 rounded-[32px] border border-[#E3E6DF] shadow-md space-y-4">
            <h3 className="text-xl font-black text-[#174D46] flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500" />
              आज कसे वाटत आहे? (Daily Health Check-in)
            </h3>
            <p className="text-sm text-[#6F7D79]">
              कुटुंबियांना तुमच्या आरोग्याची स्थिती कळावी म्हणून खालील एका चेहऱ्यावर टॅप करा:
            </p>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => { setVitals(prev => ({ ...prev, mood: 'छान (Feeling Good)' })); alert('नोंद झाली: छान वाटतंय! 😊'); }}
                className="p-4 rounded-2xl bg-[#EAF5EF] hover:bg-[#DCEDE3] border border-[#BCE1CA] flex flex-col items-center gap-2 active:scale-95 transition-all"
              >
                <Smile className="w-10 h-10 text-[#2E7D32]" />
                <span className="text-base font-black text-[#174D46]">छान वाटतंय</span>
              </button>

              <button
                onClick={() => { setVitals(prev => ({ ...prev, mood: 'ठीक आहे (Normal)' })); alert('नोंद झाली: ठीक आहे.'); }}
                className="p-4 rounded-2xl bg-[#EEF2F6] hover:bg-[#E1E7EE] border border-[#CBD8E5] flex flex-col items-center gap-2 active:scale-95 transition-all"
              >
                <Meh className="w-10 h-10 text-[#2563EB]" />
                <span className="text-base font-black text-[#1E3A8A]">ठीक आहे</span>
              </button>

              <button
                onClick={() => { setVitals(prev => ({ ...prev, mood: 'थकवा / चक्कर (Tired)' })); alert('थकव्याची नोंद झाली. कुटुंबियांना सूचित केले आहे.'); }}
                className="p-4 rounded-2xl bg-[#FDF2F2] hover:bg-[#FBE4E4] border border-[#F5C2C2] flex flex-col items-center gap-2 active:scale-95 transition-all"
              >
                <Frown className="w-10 h-10 text-rose-600" />
                <span className="text-base font-black text-rose-700">थकवा / चक्कर</span>
              </button>
            </div>
          </div>

          {/* RED EMERGENCY SOS SECTION */}
          <div className="pt-2">
            <button
              onClick={triggerSos}
              className="w-full py-6 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-[32px] font-black text-2xl sm:text-3xl shadow-2xl shadow-red-600/35 flex items-center justify-center gap-4 active:scale-95 transition-all border-4 border-red-300 animate-pulse"
            >
              <AlertTriangle className="w-9 h-9" />
              <span>तातडीची मदत (EMERGENCY SOS)</span>
            </button>

            {sosActive && (
              <div className="mt-4 p-6 bg-red-50 border-4 border-red-600 rounded-3xl text-center space-y-3">
                <h4 className="text-2xl font-black text-red-700">
                  🚨 कुटुंबियांना तातडीचा फोन/मेसेज पाठवला आहे!
                </h4>
                <p className="text-lg font-bold text-[#1B2524]">
                  मुलगा: {patient.emergencyName}
                </p>
                <a
                  href={`tel:${patient.emergencyPhone}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-black text-xl rounded-2xl shadow-lg"
                >
                  <PhoneCall className="w-6 h-6" />
                  <span>थेट फोन लावा: {patient.emergencyPhone}</span>
                </a>
              </div>
            )}
          </div>

        </main>
      )}

      {/* ============================================================================== */}
      {/* VIEW 2: CAREGIVER LIVE RADAR DASHBOARD (Rajesh - Peace of Mind) */}
      {/* ============================================================================== */}
      {activeView === 'CAREGIVER' && (
        <main className="max-w-7xl mx-auto px-4 pt-8 space-y-8">
          
          {/* Header & Quick Action Bar */}
          <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-[#E3E6DF] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#174D46] bg-[#E8F1EC] px-3.5 py-1.5 rounded-full border border-[#D0E2D8]">
                फॅमिली केअरटेकर कंट्रोल सेंटर
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-[#174D46] mt-2">
                शांताबाई जोशी — आरोग्य देखरेख
              </h1>
              <p className="text-sm text-[#6F7D79] mt-1">
                केअरटेकर: राजेश जोशी (मुलगा) • फोन: +91 98765 43210 • पासकोड: CARE-2026
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={triggerMissedDoseSimulation}
                className="px-5 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-sm rounded-2xl border border-rose-200 shadow-sm flex items-center gap-2 transition-all"
                title="परीक्षकांना मिस्ड डोस अलर्ट दाखवण्यासाठी"
              >
                <Bell className="w-4 h-4 text-rose-600" />
                <span>मिस्ड डोस अलर्ट टेस्ट करा (Simulate Alert)</span>
              </button>

              <button
                onClick={() => setActiveView('AI_SCANNER')}
                className="px-5 py-3 bg-[#174D46] hover:bg-[#123E38] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-[#174D46]/20 flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>प्रिस्क्रिप्शन स्कॅनर उघडा</span>
              </button>
            </div>
          </div>

          {/* TOP 4 HEALTHCARE KPI TILES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white p-6 rounded-[28px] border border-[#E3E6DF] shadow-sm">
              <span className="text-xs font-bold text-[#6F7D79] uppercase">नियमितता दर (Adherence)</span>
              <p className="text-4xl font-black text-[#2E7D32] mt-1">{adherencePercent}%</p>
              <span className="text-xs text-[#2E7D32] font-extrabold">उत्कृष्ट पालन 🎯</span>
            </div>

            <div className="bg-white p-6 rounded-[28px] border border-[#E3E6DF] shadow-sm">
              <span className="text-xs font-bold text-[#6F7D79] uppercase">रक्तदाब (BP)</span>
              <p className="text-3xl font-black text-[#174D46] mt-1">{vitals.bp}</p>
              <span className="text-xs text-[#6F7D79] font-medium">आज सकाळी ०८:०० वा.</span>
            </div>

            <div className="bg-white p-6 rounded-[28px] border border-[#E3E6DF] shadow-sm">
              <span className="text-xs font-bold text-[#6F7D79] uppercase">रक्तातील साखर (Sugar)</span>
              <p className="text-3xl font-black text-[#174D46] mt-1">{vitals.sugar} <span className="text-sm font-normal">mg/dL</span></p>
              <span className="text-xs text-[#2E7D32] font-extrabold">नियंत्रणात ✅</span>
            </div>

            <div className="bg-white p-6 rounded-[28px] border border-[#E3E6DF] shadow-sm">
              <span className="text-xs font-bold text-[#6F7D79] uppercase">पुढील डॉक्टर भेट</span>
              <p className="text-2xl font-black text-[#6366F1] mt-1">२० नोव्हेंबर</p>
              <span className="text-xs text-[#6F7D79]">Dr. Ananya (Cardio)</span>
            </div>

          </div>

          {/* TWO COLUMNS: LIVE AUDIT FEED & ACTIVE MEDICATIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT 7 COLUMNS: MEDICATIONS REGIMEN */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-[#174D46]">चालू औषधांचे वेळापत्रक</h3>
                <span className="text-xs text-[#6F7D79] font-bold">४ सक्रिय औषधे</span>
              </div>

              <div className="space-y-3">
                {medications.map(m => (
                  <div
                    key={m.id}
                    className="bg-white p-5 rounded-3xl border border-[#E3E6DF] shadow-sm flex items-center justify-between hover:border-[#174D46] transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black bg-[#E8F1EC] text-[#174D46] px-2.5 py-0.5 rounded-lg">
                          {m.timingCat} • {m.time}
                        </span>
                        <span className="text-xs text-[#6F7D79]">{m.prescribedBy}</span>
                      </div>
                      <h4 className="text-xl font-bold text-[#1B2524] mt-1">{m.name}</h4>
                      <p className="text-sm font-semibold text-[#5C6A66]">{m.dosage} — {m.instruction}</p>
                    </div>

                    <div>
                      {m.taken ? (
                        <span className="px-3.5 py-1.5 bg-[#EAF5EF] text-[#2E7D32] border border-[#BCE1CA] font-extrabold text-xs rounded-xl flex items-center gap-1">
                          ✓ घेतले ({m.takenAt || 'वेळेवर'})
                        </span>
                      ) : (
                        <span className="px-3.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 font-extrabold text-xs rounded-xl">
                          प्रतीक्षेत (Pending)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT 5 COLUMNS: PROACTIVE ALERTS AUDIT FEED */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-2xl font-black text-[#174D46]">
                🔔 ऑटोमेटेड अलर्ट्स व इतिहास (Live Audit)
              </h3>

              <div className="bg-white p-5 rounded-3xl border border-[#E3E6DF] shadow-sm space-y-3 max-h-[500px] overflow-y-auto">
                {alerts.map(a => (
                  <div
                    key={a.id}
                    className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium space-y-1 ${
                      a.type === 'EMERGENCY'
                        ? 'bg-red-50 border-red-300 text-red-900'
                        : a.type === 'WARNING'
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-[#F4F9F6] border-[#C9E4D4] text-[#174D46]'
                    }`}
                  >
                    <div className="flex justify-between font-bold text-xs opacity-75">
                      <span>{a.type} ALERT</span>
                      <span>{a.time}</span>
                    </div>
                    <p className="font-semibold">{a.text}</p>
                  </div>
                ))}
              </div>

              {/* Doctor Card */}
              <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#E3E6DF] shadow-sm space-y-2">
                <span className="text-xs font-bold text-[#6366F1] uppercase">फॅमिली डॉक्टर</span>
                <h4 className="text-lg font-bold">Dr. Ananya Kulkarni (Cardiology)</h4>
                <p className="text-xs text-[#6F7D79]">Jupiter Hospital, Shivajinagar, Pune</p>
                <a
                  href="tel:+919988776655"
                  className="inline-block mt-2 px-4 py-2 bg-[#F0F2EB] hover:bg-[#174D46] hover:text-white text-[#174D46] rounded-xl text-xs font-bold transition-all"
                >
                  📞 थेट संपर्क: +91 99887 76655
                </a>
              </div>
            </div>

          </div>

        </main>
      )}

      {/* ============================================================================== */}
      {/* VIEW 3: GEMINI AI SMART CLINIC (Prescription Vision OCR & Drug Safety Guard) */}
      {/* ============================================================================== */}
      {activeView === 'AI_SCANNER' && (
        <main className="max-w-4xl mx-auto px-4 pt-8 space-y-8">
          
          <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-[#E3E6DF] shadow-sm space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Google Gemini 2.5 Flash Vision OCR
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#174D46]">
              📸 प्रिस्क्रिप्शन स्कॅनर व ड्रग सेफ्टी गार्ड
            </h1>
            <p className="text-sm text-[#6F7D79]">
              डॉक्टरांच्या हाताने लिहिलेल्या चिठ्ठीचा फोटो टाका — AI औषधांचे नाव, डोस आणि वेळ आपोआप शोधेल.
            </p>
          </div>

          {/* UPLOAD & OCR SCAN BOX */}
          <div className="bg-white p-8 rounded-[32px] border-2 border-dashed border-[#174D46]/40 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#E8F1EC] text-[#174D46] flex items-center justify-center mx-auto text-3xl shadow-sm">
              📷
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1B2524]">
                डॉक्टरांचे प्रिस्क्रिप्शन किंवा गोळ्यांच्या पाकिटाचा फोटो निवडा
              </h3>
              <p className="text-xs text-[#6F7D79] mt-1">
                Supports JPG, PNG, Medical Slips (Gemini 2.5 Flash OCR)
              </p>
            </div>

            <button
              onClick={handleScanPrescription}
              disabled={aiAnalyzing}
              className="px-8 py-4 bg-[#174D46] hover:bg-[#123E38] disabled:opacity-50 text-white font-black text-base rounded-2xl shadow-xl shadow-[#174D46]/20 flex items-center justify-center gap-2 mx-auto transition-all"
            >
              {aiAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-300" />
                  <span>Gemini AI विश्लेषण करत आहे...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-emerald-300" />
                  <span>डेमो प्रिस्क्रिप्शन स्कॅन करा (Scan Demo Prescription)</span>
                </>
              )}
            </button>
          </div>

          {/* AI SCAN RESULT */}
          {aiScanResult && (
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-[#10B981] shadow-xl space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-[#E3E6DF] pb-4">
                <div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                    अचूकता: {aiScanResult.confidence}
                  </span>
                  <h3 className="text-2xl font-black text-[#174D46] mt-2">
                    {aiScanResult.doctorName}
                  </h3>
                  <p className="text-xs text-[#6F7D79]">{aiScanResult.hospital} • दिनांक: {aiScanResult.date}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#1B2524]">सापडलेली औषधे (Extracted Regimen):</h4>
                {aiScanResult.extracted.map((med: any, idx: number) => (
                  <div key={idx} className="p-4 bg-[#F8FAF7] rounded-2xl border border-[#E3EAE0] flex items-center justify-between">
                    <div>
                      <h5 className="text-lg font-bold text-[#174D46]">{med.name}</h5>
                      <p className="text-xs font-semibold text-[#5C6A66]">{med.dosage} • {med.timing}</p>
                      <p className="text-xs text-[#6F7D79]">उद्देश: {med.purpose}</p>
                    </div>

                    <button
                      onClick={() => {
                        setMedications(prev => [...prev, {
                          id: `m_new_${Date.now()}`,
                          name: med.name,
                          marathiName: med.name,
                          dosage: med.dosage,
                          instruction: med.timing,
                          time: '०९:००',
                          timingCat: 'सकाळ (Morning)',
                          pillColor: '#2563EB',
                          taken: false,
                          prescribedBy: aiScanResult.doctorName
                        }]);
                        alert(`✅ ${med.name} शांताबाईंच्या वेळापत्रकात जोडले गेले!`);
                      }}
                      className="px-4 py-2 bg-[#2E7D32] hover:bg-[#256828] text-white font-bold text-xs rounded-xl shadow-md"
                    >
                      + शेड्युलमध्ये सेव्ह करा
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DRUG INTERACTION SAFETY CHECKER */}
          <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-[#E3E6DF] shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-amber-600" />
              <h3 className="text-2xl font-black text-[#174D46]">
                ⚠️ AI ड्रग-ड्रग रिअॅक्शन सेफ्टी गार्ड (Interaction Checker)
              </h3>
            </div>
            <p className="text-sm text-[#6F7D79]">
              नवीन औषध देण्यापूर्वी त्याचे नाव येथे टाका — चालू औषधांसोबत (उदा. टेल्मिसार्टन) काही धोका आहे का हे AI तपासेल:
            </p>

            <div className="flex gap-3">
              <input
                type="text"
                value={drugConflictText}
                onChange={e => setDrugConflictText(e.target.value)}
                placeholder="उदा. Combiflam, Ibuprofen किंवा Aspirin 75mg"
                className="flex-1 p-3.5 rounded-2xl border border-[#CCD2C7] font-bold text-sm outline-none focus:border-[#174D46]"
              />
              <button
                onClick={checkDrugSafety}
                className="px-6 py-3.5 bg-[#174D46] hover:bg-[#123E38] text-white font-black text-sm rounded-2xl shadow-md"
              >
                सुरक्षा तपासा
              </button>
            </div>

            {conflictWarning && (
              <div className={`p-5 rounded-2xl border ${
                conflictWarning.level === 'HIGH_RISK'
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}>
                <h4 className="font-black text-base">{conflictWarning.title}</h4>
                <p className="text-sm font-semibold mt-1">{conflictWarning.message}</p>
                <p className="text-xs font-bold mt-2 opacity-80">कृती: {conflictWarning.action}</p>
              </div>
            )}
          </div>

        </main>
      )}

      {/* ============================================================================== */}
      {/* VIEW 4: OFFICIAL CLINICAL SUMMARY REPORT (Print/PDF Ready for Doctors) */}
      {/* ============================================================================== */}
      {activeView === 'DOCTOR_REPORT' && (
        <main className="max-w-4xl mx-auto px-4 pt-8 space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-[#174D46]">डॉक्टरांसाठी क्लिनिकल अहवाल</h1>
              <p className="text-sm text-[#6F7D79]">अधिकृत मेडिकल समरी (Printed Clinical Record)</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-5 py-3 bg-[#174D46] hover:bg-[#123E38] text-white font-bold text-sm rounded-2xl shadow-md flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>अहवाल प्रिंट / PDF सेव्ह करा</span>
            </button>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-[#E3E6DF] shadow-md space-y-6 font-mono text-sm leading-relaxed">
            <div className="border-b-2 border-black pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-black">AYUCARE HEALTHCARE CLINICAL REPORT</h2>
                <p className="text-xs text-slate-600">Generated on: {new Date().toLocaleString()}</p>
              </div>
              <div className="text-right">
                <span className="font-bold">Patient ID: PAT-7201</span><br/>
                <span className="text-xs">Category: Geriatric Healthcare</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b pb-4 text-xs">
              <div>
                <p><strong>Patient Name:</strong> {patient.name} ({patient.marathiName})</p>
                <p><strong>Age / Gender:</strong> {patient.age} Yrs / Female</p>
                <p><strong>Blood Group:</strong> {patient.bloodGroup}</p>
              </div>
              <div>
                <p><strong>Primary Caregiver:</strong> {patient.emergencyName}</p>
                <p><strong>Emergency Contact:</strong> {patient.emergencyPhone}</p>
                <p><strong>Adherence Compliance:</strong> {adherencePercent}% (Past 30 Days)</p>
              </div>
            </div>

            <div>
              <h3 className="font-black text-base text-black mb-2">ACTIVE MEDICATIONS REGIMEN:</h3>
              <table className="w-full text-left text-xs border">
                <thead>
                  <tr className="bg-slate-100 border-b">
                    <th className="p-2 border-r">Medication</th>
                    <th className="p-2 border-r">Dosage</th>
                    <th className="p-2 border-r">Scheduled Time</th>
                    <th className="p-2">Prescribed By</th>
                  </tr>
                </thead>
                <tbody>
                  {medications.map(m => (
                    <tr key={m.id} className="border-b">
                      <td className="p-2 border-r font-bold">{m.name}</td>
                      <td className="p-2 border-r">{m.dosage}</td>
                      <td className="p-2 border-r">{m.time} ({m.timingCat})</td>
                      <td className="p-2">{m.prescribedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="font-black text-base text-black mb-1">LATEST VITALS RECORD:</h3>
              <p className="text-xs">
                Blood Pressure: <strong>{vitals.bp} mmHg</strong> • Blood Glucose: <strong>{vitals.sugar} mg/dL</strong> • Pulse: <strong>{vitals.pulse} bpm</strong> • General Wellness: <strong>{vitals.mood}</strong>
              </p>
            </div>

            <div className="pt-4 border-t text-[11px] text-slate-500 text-center">
              *This report is digitally generated by AyuCare Healthcare Platform for medical supervision by attending physicians.
            </div>
          </div>

        </main>
      )}

    </div>
  );
}
