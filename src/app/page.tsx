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
  Stethoscope,
  Search,
  Settings,
  MessageCircle,
  Mic,
  PlusCircle,
  ChevronRight,
  Home,
  Pill,
  Users,
  BarChart2,
  Zap,
} from 'lucide-react';

export default function AyuCareFlagshipPlatform() {
  const [activeView, setActiveView] = useState<'ELDERLY' | 'CAREGIVER' | 'AI_SCANNER' | 'DOCTOR_REPORT'>('ELDERLY');
  const [language, setLanguage] = useState<'mr' | 'en'>('mr');
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'नमस्कार! मी AyuCare AI आहे. औषधे, आरोग्य किंवा अपॉइंटमेंटबद्दल काहीही विचारा.' },
  ]);

  const [patient] = useState({
    name: 'Shantabai Joshi',
    marathiName: 'शांताबाई जोशी',
    age: 72,
    bloodGroup: 'B+',
    conditions: ['उच्च रक्तदाब (Hypertension)', 'मधुमेह (Type 2 Diabetes)'],
    emergencyPhone: '+91 98765 43210',
    emergencyName: 'Rajesh Joshi (मुलगा)',
  });

  const [medications, setMedications] = useState([
    {
      id: 'm1',
      name: 'Telmisartan 40mg',
      marathiName: 'टेल्मिसार्टन (रक्तदाब)',
      dosage: '१ गोळी',
      instruction: 'After Breakfast',
      time: '08:30',
      timingCat: 'Morning',
      pillColor: '#7C3AED',
      taken: true,
      takenAt: '08:35 AM',
      prescribedBy: 'Dr. Ananya Kulkarni',
      slots: [1],
    },
    {
      id: 'm2',
      name: 'Metformin 500mg',
      marathiName: 'मेटफॉर्मिन (मधुमेह)',
      dosage: '१ गोळी',
      instruction: 'After Lunch',
      time: '13:30',
      timingCat: 'Afternoon',
      pillColor: '#0EA5E9',
      taken: false,
      prescribedBy: 'Dr. Ramesh Deshmukh',
      slots: [2, 1],
    },
    {
      id: 'm3',
      name: 'Glimepiride 1mg',
      marathiName: 'ग्लिमेपिराइड (साखर)',
      dosage: '१ गोळी',
      instruction: 'Before Dinner',
      time: '20:00',
      timingCat: 'Evening',
      pillColor: '#F59E0B',
      taken: false,
      prescribedBy: 'Dr. Ramesh Deshmukh',
      slots: [2],
    },
    {
      id: 'm4',
      name: 'Calcium + Vit D3',
      marathiName: 'कॅल्शियम + व्हिटॅमिन डी३',
      dosage: '१ कॅप्सूल',
      instruction: 'At Bedtime',
      time: '21:30',
      timingCat: 'Night',
      pillColor: '#10B981',
      taken: false,
      prescribedBy: 'Dr. Ananya Kulkarni',
      slots: [2],
    },
    {
      id: 'm5',
      name: 'Omeprazole 20mg',
      marathiName: 'ओमेप्राझोल (जठर)',
      dosage: '१ गोळी',
      instruction: 'Before Breakfast',
      time: '08:00',
      timingCat: 'Morning',
      pillColor: '#EC4899',
      taken: true,
      takenAt: '08:05 AM',
      prescribedBy: 'Dr. Ananya Kulkarni',
      slots: [2],
    },
  ]);

  const weekDays = ['Tue 9', 'Wed 10', 'Thu 11', 'Fri 12', 'Sat 13', 'Sun 14', 'Mon 15', 'Tue 16', 'Wed 17', 'Thu 18', 'Fri 19'];
  const todayIdx = 6; // Mon 15

  const [alerts, setAlerts] = useState<Array<{ id: string; time: string; text: string; type: 'SUCCESS' | 'WARNING' | 'EMERGENCY' }>>([
    { id: 'a1', time: '08:35 AM', text: 'शांताबाईंनी सकाळची Telmisartan गोळी वेळेवर घेतली.', type: 'SUCCESS' },
    { id: 'a2', time: 'काल रात्री', text: 'कॅल्शियम गोळीनंतर ७.५ तास शांत झोप.', type: 'SUCCESS' },
  ]);

  const [sosActive, setSosActive] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiScanResult, setAiScanResult] = useState<any>(null);
  const [drugConflictText, setDrugConflictText] = useState('');
  const [conflictWarning, setConflictWarning] = useState<any>(null);
  const [vitals] = useState({ bp: '124/82', sugar: 135, pulse: 74, mood: 'छान (Feeling Good)' });

  const takenCount = medications.filter(m => m.taken).length;
  const adherencePercent = Math.round((takenCount / medications.length) * 100);
  const nextPendingMed = medications.find(m => !m.taken) || medications[1];

  const speakMedicine = (med: any) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `शांताबाई, तुमची ${med.marathiName} घेण्याची वेळ झाली आहे. कृपया ${med.instruction} गोळी घ्या.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'mr-IN';
      utterance.rate = 0.85;
      setVoicePlaying(true);
      utterance.onend = () => setVoicePlaying(false);
      utterance.onerror = () => setVoicePlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleMarkTaken = (id: string) => {
    setMedications(prev =>
      prev.map(m =>
        m.id === id
          ? { ...m, taken: true, takenAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          : m
      )
    );
    const med = medications.find(m => m.id === id);
    setAlerts(prev => [
      {
        id: `a_${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `शांताबाईंनी ${med?.marathiName || 'औषध'} घेतली. केअरटेकर राजेश यांना SMS पोहचला.`,
        type: 'SUCCESS',
      },
      ...prev,
    ]);
  };

  const triggerMissedDoseSimulation = () => {
    setAlerts(prev => [
      {
        id: `a_miss_${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `⚠️ URGENT: Metformin ३० मिनिटे उलटूनही घेतली नाही! राजेश यांना Emergency Notification पाठवले.`,
        type: 'WARNING',
      },
      ...prev,
    ]);
  };

  const triggerSos = () => {
    setSosActive(true);
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
      } catch (e) { console.warn(e); }
    }
    setAlerts(prev => [
      {
        id: `a_sos_${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `🚨 EMERGENCY SOS: शांताबाईंनी Emergency Button दाबले! राजेश जोशी यांना थेट कॉल जात आहे.`,
        type: 'EMERGENCY',
      },
      ...prev,
    ]);
  };

  const handleScanPrescription = () => {
    setAiAnalyzing(true);
    setTimeout(() => {
      setAiScanResult({
        doctorName: 'Dr. Ananya Kulkarni, MD (Cardiology)',
        hospital: 'Jupiter Hospital, Pune',
        date: '15 Nov 2026',
        extracted: [
          { name: 'Amlodipine 5mg', dosage: '1 Tab Daily', timing: 'Morning after food', purpose: 'Blood Pressure' },
          { name: 'Atorvastatin 10mg', dosage: '1 Tab Daily', timing: 'Night bedtime', purpose: 'Cholesterol' },
        ],
        confidence: '98.4% (Gemini Vision OCR)',
      });
      setAiAnalyzing(false);
    }, 1800);
  };

  const checkDrugSafety = () => {
    if (!drugConflictText.trim()) return;
    const danger = ['ibuprofen', 'combiflam', 'aspirin'].some(d => drugConflictText.toLowerCase().includes(d));
    setConflictWarning(
      danger
        ? {
            level: 'HIGH_RISK',
            title: '⚠️ Adverse Drug Interaction Detected!',
            message: `${drugConflictText} + Telmisartan → Kidney stress & BP control disruption.`,
            action: 'डॉक्टरांच्या सल्ल्याशिवाय देऊ नका.',
          }
        : {
            level: 'SAFE',
            title: '✅ Safe to Administer',
            message: `${drugConflictText} आणि चालू औषधांमध्ये कोणताही धोका आढळला नाही.`,
            action: 'नेहमीच्या वेळेवर द्यावे.',
          }
    );
  };

  const handleAiSend = () => {
    if (!aiInput.trim()) return;
    const q = aiInput.trim();
    setAiMessages(prev => [...prev, { role: 'user', text: q }]);
    setAiInput('');
    setTimeout(() => {
      let reply = 'मला समजले. कृपया डॉक्टरांचा सल्ला घ्या.';
      if (q.toLowerCase().includes('medic') || q.toLowerCase().includes('औषध')) reply = 'आजच्या ४ पैकी ' + takenCount + ' औषधे घेतली आहेत. ' + (medications.length - takenCount) + ' बाकी आहेत.';
      if (q.toLowerCase().includes('bp') || q.toLowerCase().includes('रक्तदाब')) reply = 'रक्तदाब: ' + vitals.bp + ' mmHg — नियंत्रणात आहे ✅';
      if (q.toLowerCase().includes('appoint') || q.toLowerCase().includes('डॉक्टर')) reply = 'पुढील भेट: Dr. Ananya Kulkarni — २० नोव्हेंबर २०२६, Jupiter Hospital, Pune.';
      setAiMessages(prev => [...prev, { role: 'ai', text: reply }]);
    }, 900);
  };

  // ─────────────────────── NAV CONFIG ───────────────────────
  const navItems = [
    { id: 'ELDERLY', label: 'Dashboard', icon: Home },
    { id: 'CAREGIVER', label: 'Patients', icon: Users },
    { id: 'AI_SCANNER', label: 'Prescriptions', icon: Pill },
    { id: 'DOCTOR_REPORT', label: 'Medical Records', icon: FileText },
  ] as const;

  // ─────────────────────── SCHEDULE DATA ───────────────────────
  const schedule = [
    { name: 'Dentist', days: [1, 3, 4] },
    { name: 'Gym', days: [0, 2, 4] },
    { name: 'Physician', days: [1, 4] },
  ];

  const consultations = [
    { type: 'Phone', count: 4, color: '#F59E0B', width: 15 },
    { type: 'Video', count: 12, color: '#0EA5E9', width: 40 },
    { type: 'Offline', count: 24, color: '#7C3AED', width: 80 },
  ];

  const billingPaid = 32;
  const billingPending = 12;

  return (
    <div className="min-h-screen bg-[#F0F2FF] font-sans antialiased text-[#1A1D2E]">

      {/* ══════════════════════════════════════════════════════
          TOP NAVIGATION — CuraNet style horizontal pill tabs
      ══════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#E8EAFF] shadow-sm">
        <div className="max-w-[1400px] mx-auto px-5 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#4FC3F7] flex items-center justify-center shadow-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#1A1D2E]">
              Ayu<span className="text-[#6C63FF]">Care</span>
            </span>
          </div>

          {/* Nav Pills */}
          <nav className="flex items-center bg-[#F0F2FF] rounded-2xl p-1 gap-0.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/30'
                      : 'text-[#6B7280] hover:text-[#1A1D2E] hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Search + Bell + Profile */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-2 bg-[#F0F2FF] rounded-xl px-3 py-2 w-44">
              <Search className="w-4 h-4 text-[#9CA3AF]" />
              <input
                className="bg-transparent text-xs outline-none w-full placeholder:text-[#9CA3AF] text-[#1A1D2E]"
                placeholder="Search..."
              />
              <span className="text-[10px] text-[#9CA3AF] bg-white px-1.5 py-0.5 rounded-md border border-[#E5E7EB]">⌘K</span>
            </div>

            <button
              onClick={triggerSos}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              SOS
            </button>

            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-[#F0F2FF] hover:bg-[#E8EAFF] transition-all">
              <Bell className="w-4 h-4 text-[#6B7280]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>

            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#4FC3F7] flex items-center justify-center cursor-pointer">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════
          VIEW 1: ELDERLY / DASHBOARD (CuraNet layout)
      ══════════════════════════════════════════════════════ */}
      {activeView === 'ELDERLY' && (
        <main className="max-w-[1400px] mx-auto px-5 py-8 grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">

          {/* LEFT COLUMN */}
          <div className="space-y-6">

            {/* Welcome + Stats Row */}
            <div>
              <p className="text-sm text-[#6B7280]">Good morning, Shantabai! 👋</p>
              <h1 className="text-3xl font-black text-[#1A1D2E] mt-0.5">How are you today?</h1>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Adherence', value: `${adherencePercent}%`, sub: 'This week', color: '#6C63FF', bg: '#EEF2FF' },
                { label: 'Blood Pressure', value: vitals.bp, sub: 'mmHg • Normal', color: '#0EA5E9', bg: '#E0F2FE' },
                { label: 'Blood Sugar', value: vitals.sugar + '', sub: 'mg/dL • Controlled', color: '#10B981', bg: '#D1FAE5' },
                { label: 'Next Appointment', value: 'Nov 20', sub: 'Dr. Ananya • Cardio', color: '#F59E0B', bg: '#FEF3C7' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-2xl p-5 border border-[#E8EAFF] shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">{stat.label}</span>
                  <p className="text-2xl font-black mt-1" style={{ color: stat.color }}>{stat.value}</p>
                  <span className="text-xs text-[#6B7280]">{stat.sub}</span>
                </div>
              ))}
            </div>

            {/* Medication Timeline — CuraNet style */}
            <div className="bg-white rounded-2xl border border-[#E8EAFF] shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-[#F3F4F6]">
                <h2 className="text-base font-bold text-[#1A1D2E]">Your daily medicine</h2>
                <button
                  onClick={() => setActiveView('AI_SCANNER')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6C63FF] text-white rounded-lg text-xs font-semibold hover:bg-[#5B52EE] transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add medicine
                </button>
              </div>

              {/* Week scrollbar */}
              <div className="overflow-x-auto px-5 pt-4 pb-2">
                <div className="flex gap-2 min-w-max">
                  {weekDays.map((day, idx) => (
                    <div
                      key={day}
                      className={`flex flex-col items-center px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                        idx === todayIdx
                          ? 'bg-[#6C63FF] text-white'
                          : 'text-[#9CA3AF] hover:bg-[#F0F2FF]'
                      }`}
                    >
                      <span>{day.split(' ')[0]}</span>
                      <span className="font-black">{day.split(' ')[1]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medicine rows */}
              <div className="p-5 space-y-3">
                {medications.map(med => (
                  <div
                    key={med.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#F9F9FF] transition-colors group"
                  >
                    {/* Pill color dot */}
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: med.pillColor }}
                    />

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#1A1D2E]">{med.name}</span>
                        <span className="text-xs text-[#9CA3AF]">{med.dosage}</span>
                      </div>
                      <span className="text-[11px] text-[#9CA3AF]">{med.instruction}</span>
                    </div>

                    {/* Dose slot pills (CuraNet style numbered badges) */}
                    <div className="flex gap-1.5">
                      {med.slots.map((s, i) => (
                        <span
                          key={i}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                          style={{ backgroundColor: med.pillColor }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Status */}
                    {med.taken ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#10B981] bg-[#D1FAE5] px-2.5 py-1 rounded-lg shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        Done {med.takenAt}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkTaken(med.id)}
                        className="text-[11px] font-bold text-[#6C63FF] bg-[#EEF2FF] hover:bg-[#6C63FF] hover:text-white px-3 py-1.5 rounded-lg transition-all shrink-0"
                      >
                        Mark taken
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom 3-col: Schedule + Billing + Consultations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Schedule card */}
              <div className="bg-white rounded-2xl border border-[#E8EAFF] shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#1A1D2E]">Schedule</h3>
                  <button className="w-6 h-6 rounded-lg bg-[#F0F2FF] flex items-center justify-center">
                    <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
                  </button>
                </div>
                <div className="space-y-3">
                  {schedule.map(item => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="text-xs text-[#6B7280] w-16 shrink-0">{item.name}</span>
                      <div className="flex gap-1">
                        {['M', 'T', 'W', 'T', 'F'].map((d, i) => (
                          <div
                            key={i}
                            className={`w-5 h-5 rounded-md text-[9px] font-bold flex items-center justify-center ${
                              item.days.includes(i)
                                ? 'bg-[#7C3AED] text-white'
                                : 'bg-[#F3F4F6] text-[#D1D5DB]'
                            }`}
                          >
                            {d}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Status — donut */}
              <div className="bg-white rounded-2xl border border-[#E8EAFF] shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[#1A1D2E]">Billing Status</h3>
                  <button className="w-6 h-6 rounded-lg bg-[#F0F2FF] flex items-center justify-center">
                    <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
                  </button>
                </div>
                <div className="flex items-center justify-center gap-6">
                  {/* SVG Donut */}
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#F0F2FF" strokeWidth="12" />
                    <circle
                      cx="40" cy="40" r="30" fill="none"
                      stroke="#0EA5E9" strokeWidth="12"
                      strokeDasharray={`${(billingPaid / (billingPaid + billingPending)) * 188.4} 188.4`}
                      strokeDashoffset="47.1"
                      strokeLinecap="round"
                      transform="rotate(-90 40 40)"
                    />
                    <circle
                      cx="40" cy="40" r="30" fill="none"
                      stroke="#F59E0B" strokeWidth="12"
                      strokeDasharray={`${(billingPending / (billingPaid + billingPending)) * 188.4} 188.4`}
                      strokeDashoffset={`${-(billingPaid / (billingPaid + billingPending)) * 188.4 + 47.1}`}
                      strokeLinecap="round"
                      transform="rotate(-90 40 40)"
                    />
                  </svg>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                      <span className="text-xs text-[#6B7280]">Pending <strong className="text-[#1A1D2E]">{billingPending}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />
                      <span className="text-xs text-[#6B7280]">Paid <strong className="text-[#1A1D2E]">{billingPaid}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consultations — bar chart */}
              <div className="bg-white rounded-2xl border border-[#E8EAFF] shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#1A1D2E]">Consultations</h3>
                  <button className="w-6 h-6 rounded-lg bg-[#F0F2FF] flex items-center justify-center">
                    <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
                  </button>
                </div>
                <div className="space-y-3">
                  {consultations.map(c => (
                    <div key={c.type} className="flex items-center gap-2">
                      <span className="text-xs text-[#6B7280] w-12 shrink-0">{c.type}</span>
                      <div className="flex-1 bg-[#F3F4F6] rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${c.width}%`, backgroundColor: c.color }}
                        />
                      </div>
                      <span className="text-xs font-bold text-[#1A1D2E] w-5 text-right">{c.count}</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-[#9CA3AF] mt-1">*Offline visits deliver better results.</p>
                </div>
              </div>
            </div>

            {/* Wellness Check-in */}
            <div className="bg-white rounded-2xl border border-[#E8EAFF] shadow-sm p-5">
              <h3 className="text-sm font-bold text-[#1A1D2E] mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                Daily Wellness Check-in — आज कसे वाटत आहे?
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'छान वाटतंय', icon: Smile, color: '#10B981', bg: '#D1FAE5', border: '#6EE7B7' },
                  { label: 'ठीक आहे', icon: Meh, color: '#0EA5E9', bg: '#E0F2FE', border: '#7DD3FC' },
                  { label: 'थकवा / चक्कर', icon: Frown, color: '#EF4444', bg: '#FEE2E2', border: '#FCA5A5' },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => alert(`नोंद झाली: ${item.label} 😊`)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 hover:scale-105 active:scale-95 transition-all"
                      style={{ backgroundColor: item.bg, borderColor: item.border }}
                    >
                      <Icon className="w-8 h-8" style={{ color: item.color }} />
                      <span className="text-xs font-bold" style={{ color: item.color }}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Emergency SOS */}
            <button
              onClick={triggerSos}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-xl shadow-xl shadow-rose-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all border-2 border-rose-300"
            >
              <AlertTriangle className="w-6 h-6" />
              तातडीची मदत — EMERGENCY SOS
            </button>
            {sosActive && (
              <div className="p-5 bg-rose-50 border-2 border-rose-400 rounded-2xl text-center space-y-3">
                <p className="text-lg font-black text-rose-700">🚨 {patient.emergencyName} यांना कॉल केला जात आहे!</p>
                <a
                  href={`tel:${patient.emergencyPhone}`}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-rose-600 text-white font-black text-base rounded-xl shadow-lg"
                >
                  <PhoneCall className="w-5 h-5" />
                  थेट फोन: {patient.emergencyPhone}
                </a>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN — CureAI Assistant Panel */}
          <div className="space-y-5">

            {/* AI Assistant Card */}
            <div className="bg-gradient-to-b from-[#4FC3F7] to-[#6C63FF] rounded-2xl overflow-hidden shadow-xl min-h-[420px] flex flex-col">

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-white font-black text-sm">AyuAI 1.4</span>
                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">Beta</span>
                </div>
                <button className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">
                  <span className="text-white text-lg leading-none">+</span>
                </button>
              </div>

              {/* Orb */}
              <div className="flex-1 flex flex-col items-center justify-center px-5 py-4 gap-3">
                <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/30">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/40 to-transparent flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-white drop-shadow-lg" />
                  </div>
                </div>
                <p className="text-white font-semibold text-sm">How can I assist you today?</p>

                {/* Quick action chips */}
                <div className="grid grid-cols-3 gap-2 w-full mt-1">
                  {[
                    { icon: User, label: 'Specialists' },
                    { icon: FileText, label: 'Med. History' },
                    { icon: Activity, label: 'My EHR' },
                    { icon: BarChart2, label: 'Health report' },
                    { icon: Pill, label: 'Prescriptions' },
                    { icon: Stethoscope, label: 'Consultation' },
                  ].map(chip => {
                    const Icon = chip.icon;
                    return (
                      <button
                        key={chip.label}
                        onClick={() => setAiInput(chip.label)}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-all border border-white/20"
                      >
                        <Icon className="w-4 h-4 text-white" />
                        <span className="text-[10px] text-white/90 font-semibold">{chip.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat messages */}
              {aiMessages.length > 1 && (
                <div className="mx-4 mb-2 max-h-28 overflow-y-auto space-y-2">
                  {aiMessages.slice(1).map((msg, i) => (
                    <div
                      key={i}
                      className={`text-xs px-3 py-2 rounded-xl font-medium ${
                        msg.role === 'user'
                          ? 'bg-white/90 text-[#1A1D2E] ml-6'
                          : 'bg-white/20 text-white mr-6'
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>
              )}

              {/* Chat input */}
              <div className="m-4 mt-0">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/30">
                  <Sparkles className="w-4 h-4 text-white/70 shrink-0" />
                  <input
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAiSend()}
                    placeholder="Ask anything..."
                    className="flex-1 bg-transparent text-xs text-white placeholder:text-white/60 outline-none font-medium"
                  />
                  <button onClick={handleAiSend} className="text-white/80 hover:text-white transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => speakMedicine(nextPendingMed)}
                    className={`transition-colors ${voicePlaying ? 'text-yellow-300 animate-pulse' : 'text-white/80 hover:text-white'}`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-white/50 text-center mt-1">AyuAI can make mistakes. Check important information.</p>
              </div>
            </div>

            {/* Patient Profile Card */}
            <div className="bg-white rounded-2xl border border-[#E8EAFF] shadow-sm p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#4FC3F7] flex items-center justify-center text-white font-black text-lg">
                  SJ
                </div>
                <div>
                  <h4 className="font-black text-sm text-[#1A1D2E]">{patient.marathiName}</h4>
                  <p className="text-xs text-[#9CA3AF]">Age {patient.age} · Blood {patient.bloodGroup}</p>
                </div>
                <span className="ml-auto text-[10px] bg-[#D1FAE5] text-[#065F46] px-2 py-0.5 rounded-full font-bold">Active</span>
              </div>
              <div className="space-y-1">
                {patient.conditions.map(c => (
                  <span key={c} className="inline-block mr-2 mb-1 text-[11px] bg-[#EEF2FF] text-[#6C63FF] px-2.5 py-1 rounded-lg font-semibold">
                    {c}
                  </span>
                ))}
              </div>
              <div className="pt-2 border-t border-[#F3F4F6] text-xs text-[#6B7280]">
                Emergency: <strong className="text-[#1A1D2E]">{patient.emergencyName}</strong> · {patient.emergencyPhone}
              </div>
            </div>

            {/* Today's adherence progress */}
            <div className="bg-white rounded-2xl border border-[#E8EAFF] shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#1A1D2E]">Today's Adherence</h3>
                <span className="text-sm font-black text-[#6C63FF]">{adherencePercent}%</span>
              </div>
              <div className="w-full bg-[#F0F2FF] rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#4FC3F7] transition-all duration-700"
                  style={{ width: `${adherencePercent}%` }}
                />
              </div>
              <p className="text-xs text-[#9CA3AF] mt-2">{takenCount} of {medications.length} doses taken</p>
            </div>

          </div>
        </main>
      )}

      {/* ══════════════════════════════════════════════════════
          VIEW 2: CAREGIVER DASHBOARD
      ══════════════════════════════════════════════════════ */}
      {activeView === 'CAREGIVER' && (
        <main className="max-w-[1400px] mx-auto px-5 py-8 space-y-6">

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#6C63FF] bg-[#EEF2FF] px-3 py-1 rounded-full">Family Caregiver Control Center</span>
              <h1 className="text-3xl font-black text-[#1A1D2E] mt-2">Shantabai Joshi — Health Monitor</h1>
              <p className="text-sm text-[#9CA3AF]">Caregiver: Rajesh Joshi · Passcode: CARE-2026</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={triggerMissedDoseSimulation}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-sm font-semibold hover:bg-rose-100 transition-all"
              >
                <Bell className="w-4 h-4" />
                Simulate Missed Alert
              </button>
              <button
                onClick={() => setActiveView('AI_SCANNER')}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#6C63FF] text-white rounded-xl text-sm font-semibold shadow hover:bg-[#5B52EE] transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Open AI Scanner
              </button>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Adherence Rate', value: `${adherencePercent}%`, color: '#10B981', bg: '#D1FAE5', note: 'Excellent compliance 🎯' },
              { label: 'Blood Pressure', value: vitals.bp, color: '#6C63FF', bg: '#EEF2FF', note: 'Checked 08:00 AM' },
              { label: 'Blood Sugar', value: `${vitals.sugar} mg/dL`, color: '#0EA5E9', bg: '#E0F2FE', note: 'Within range ✅' },
              { label: 'Next Doctor Visit', value: 'Nov 20', color: '#F59E0B', bg: '#FEF3C7', note: 'Dr. Ananya (Cardio)' },
            ].map(k => (
              <div key={k.label} className="bg-white rounded-2xl border border-[#E8EAFF] p-5 shadow-sm">
                <span className="text-xs text-[#9CA3AF] font-semibold uppercase">{k.label}</span>
                <p className="text-3xl font-black mt-1" style={{ color: k.color }}>{k.value}</p>
                <span className="text-xs font-semibold" style={{ color: k.color }}>{k.note}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            {/* Medications */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E8EAFF] shadow-sm p-5 space-y-4">
              <h3 className="font-black text-[#1A1D2E]">Active Medication Schedule</h3>
              <div className="space-y-3">
                {medications.map(m => (
                  <div key={m.id} className="flex items-center gap-4 p-4 rounded-xl border border-[#F3F4F6] hover:border-[#C7D2FE] transition-all">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: m.pillColor }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold bg-[#EEF2FF] text-[#6C63FF] px-2 py-0.5 rounded-lg">{m.timingCat} · {m.time}</span>
                        <span className="text-[11px] text-[#9CA3AF]">{m.prescribedBy}</span>
                      </div>
                      <p className="font-bold text-[#1A1D2E] mt-0.5">{m.name}</p>
                      <p className="text-xs text-[#6B7280]">{m.dosage} — {m.instruction}</p>
                    </div>
                    {m.taken ? (
                      <span className="text-[11px] font-bold text-[#10B981] bg-[#D1FAE5] px-3 py-1 rounded-lg shrink-0 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Taken {m.takenAt}
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-[#F59E0B] bg-[#FEF3C7] px-3 py-1 rounded-lg shrink-0">Pending</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts + Doctor */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white rounded-2xl border border-[#E8EAFF] shadow-sm p-5">
                <h3 className="font-black text-[#1A1D2E] mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#6C63FF]" /> Live Alerts
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {alerts.map(a => (
                    <div key={a.id} className={`p-3 rounded-xl text-xs font-medium border ${
                      a.type === 'EMERGENCY' ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : a.type === 'WARNING' ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-[#EEF2FF] border-[#C7D2FE] text-[#3730A3]'
                    }`}>
                      <div className="flex justify-between font-bold opacity-70 mb-0.5">
                        <span>{a.type}</span><span>{a.time}</span>
                      </div>
                      {a.text}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8EAFF] shadow-sm p-5">
                <span className="text-xs font-bold text-[#6C63FF] uppercase">Family Doctor</span>
                <h4 className="font-black text-[#1A1D2E] mt-1">Dr. Ananya Kulkarni</h4>
                <p className="text-xs text-[#9CA3AF]">Cardiology · Jupiter Hospital, Pune</p>
                <a href="tel:+919988776655" className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-[#6C63FF] bg-[#EEF2FF] px-3 py-2 rounded-xl hover:bg-[#6C63FF] hover:text-white transition-all">
                  <PhoneCall className="w-3.5 h-3.5" /> +91 99887 76655
                </a>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ══════════════════════════════════════════════════════
          VIEW 3: AI SCANNER — Prescription OCR + Drug Checker
      ══════════════════════════════════════════════════════ */}
      {activeView === 'AI_SCANNER' && (
        <main className="max-w-4xl mx-auto px-5 py-8 space-y-6">

          <div className="bg-white rounded-2xl border border-[#E8EAFF] shadow-sm p-6">
            <span className="text-xs font-bold text-[#6C63FF] bg-[#EEF2FF] px-3 py-1 rounded-full">Google Gemini 2.5 Flash Vision OCR</span>
            <h1 className="text-3xl font-black text-[#1A1D2E] mt-3">📸 Prescription Scanner</h1>
            <p className="text-sm text-[#6B7280] mt-1">
              डॉक्टरांच्या हस्ताक्षरातील चिठ्ठी फोटो टाका — AI औषधांचे नाव, डोस आणि वेळ शोधेल.
            </p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-dashed border-[#C7D2FE] p-10 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] text-4xl flex items-center justify-center mx-auto">📷</div>
            <div>
              <h3 className="font-bold text-[#1A1D2E]">Upload Prescription or Medicine Packet</h3>
              <p className="text-xs text-[#9CA3AF] mt-1">Supports JPG, PNG, Medical Slips (Gemini 2.5 Flash OCR)</p>
            </div>
            <button
              onClick={handleScanPrescription}
              disabled={aiAnalyzing}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#6C63FF] hover:bg-[#5B52EE] disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-[#6C63FF]/30 transition-all"
            >
              {aiAnalyzing ? <><RefreshCw className="w-5 h-5 animate-spin" /> Gemini AI विश्लेषण...</> : <><Sparkles className="w-5 h-5" /> Scan Demo Prescription</>}
            </button>
          </div>

          {aiScanResult && (
            <div className="bg-white rounded-2xl border-2 border-[#10B981] shadow-xl p-6 space-y-4">
              <div className="flex items-start justify-between border-b border-[#F3F4F6] pb-4">
                <div>
                  <span className="text-xs font-bold text-[#10B981] bg-[#D1FAE5] px-3 py-1 rounded-full">Accuracy: {aiScanResult.confidence}</span>
                  <h3 className="text-xl font-black text-[#1A1D2E] mt-2">{aiScanResult.doctorName}</h3>
                  <p className="text-xs text-[#9CA3AF]">{aiScanResult.hospital} · {aiScanResult.date}</p>
                </div>
              </div>
              <h4 className="font-bold text-sm text-[#1A1D2E]">Extracted Medications:</h4>
              <div className="space-y-3">
                {aiScanResult.extracted.map((med: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-[#F9F9FF] rounded-xl border border-[#E8EAFF]">
                    <div>
                      <p className="font-bold text-[#1A1D2E]">{med.name}</p>
                      <p className="text-xs text-[#6B7280]">{med.dosage} · {med.timing}</p>
                      <p className="text-xs text-[#9CA3AF]">Purpose: {med.purpose}</p>
                    </div>
                    <button
                      onClick={() => {
                        setMedications(prev => [...prev, {
                          id: `m_new_${Date.now()}`,
                          name: med.name, marathiName: med.name,
                          dosage: med.dosage, instruction: med.timing,
                          time: '09:00', timingCat: 'Morning',
                          pillColor: '#6C63FF', taken: false,
                          prescribedBy: aiScanResult.doctorName, slots: [1],
                        }]);
                        alert(`✅ ${med.name} scheduled!`);
                      }}
                      className="px-4 py-2 bg-[#6C63FF] hover:bg-[#5B52EE] text-white font-bold text-xs rounded-xl shadow transition-all"
                    >
                      + Add to Schedule
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drug Interaction Checker */}
          <div className="bg-white rounded-2xl border border-[#E8EAFF] shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#F59E0B]" />
              <h3 className="font-black text-[#1A1D2E]">AI Drug Interaction Safety Guard</h3>
            </div>
            <p className="text-sm text-[#6B7280]">
              नवीन औषधाचे नाव टाका — चालू औषधांसोबत धोका आहे का हे AI तपासेल:
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={drugConflictText}
                onChange={e => setDrugConflictText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && checkDrugSafety()}
                placeholder="e.g. Combiflam, Ibuprofen, Aspirin 75mg"
                className="flex-1 px-4 py-3 rounded-xl border border-[#E8EAFF] text-sm font-medium outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
              />
              <button
                onClick={checkDrugSafety}
                className="px-5 py-3 bg-[#6C63FF] hover:bg-[#5B52EE] text-white font-bold text-sm rounded-xl shadow transition-all"
              >
                Check Safety
              </button>
            </div>
            {conflictWarning && (
              <div className={`p-4 rounded-xl border font-medium text-sm ${
                conflictWarning.level === 'HIGH_RISK'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-[#D1FAE5] border-[#6EE7B7] text-[#065F46]'
              }`}>
                <p className="font-black">{conflictWarning.title}</p>
                <p className="mt-1">{conflictWarning.message}</p>
                <p className="text-xs mt-2 opacity-70">Action: {conflictWarning.action}</p>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ══════════════════════════════════════════════════════
          VIEW 4: DOCTOR CLINICAL REPORT
      ══════════════════════════════════════════════════════ */}
      {activeView === 'DOCTOR_REPORT' && (
        <main className="max-w-4xl mx-auto px-5 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-[#1A1D2E]">Clinical Summary Report</h1>
              <p className="text-sm text-[#9CA3AF]">Official Medical Record · Print/PDF Ready</p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-3 bg-[#6C63FF] hover:bg-[#5B52EE] text-white font-bold text-sm rounded-xl shadow transition-all"
            >
              <Download className="w-4 h-4" /> Print / Save PDF
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8EAFF] shadow-sm p-8 font-mono text-sm leading-relaxed space-y-6">
            <div className="border-b-2 border-[#1A1D2E] pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-[#1A1D2E]">AYUCARE CLINICAL REPORT</h2>
                <p className="text-xs text-[#9CA3AF]">Generated: {new Date().toLocaleString()}</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-bold">Patient ID: PAT-7201</p>
                <p>Category: Geriatric Healthcare</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs border-b pb-4">
              <div className="space-y-1">
                <p><strong>Patient:</strong> {patient.name} ({patient.marathiName})</p>
                <p><strong>Age / Gender:</strong> {patient.age} Yrs / Female</p>
                <p><strong>Blood Group:</strong> {patient.bloodGroup}</p>
              </div>
              <div className="space-y-1">
                <p><strong>Caregiver:</strong> {patient.emergencyName}</p>
                <p><strong>Emergency:</strong> {patient.emergencyPhone}</p>
                <p><strong>Adherence:</strong> {adherencePercent}% (Past 30 Days)</p>
              </div>
            </div>

            <div>
              <h3 className="font-black text-sm mb-2">ACTIVE MEDICATIONS REGIMEN:</h3>
              <table className="w-full text-left text-xs border border-[#E8EAFF] rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-[#EEF2FF] text-[#6C63FF]">
                    <th className="p-3 border-b border-[#E8EAFF]">Medication</th>
                    <th className="p-3 border-b border-[#E8EAFF]">Dosage</th>
                    <th className="p-3 border-b border-[#E8EAFF]">Schedule</th>
                    <th className="p-3 border-b border-[#E8EAFF]">Prescribed By</th>
                  </tr>
                </thead>
                <tbody>
                  {medications.map(m => (
                    <tr key={m.id} className="border-b border-[#F3F4F6] hover:bg-[#F9F9FF]">
                      <td className="p-3 font-bold text-[#1A1D2E]">{m.name}</td>
                      <td className="p-3">{m.dosage}</td>
                      <td className="p-3">{m.time} ({m.timingCat})</td>
                      <td className="p-3 text-[#9CA3AF]">{m.prescribedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="font-black text-sm mb-1">LATEST VITALS:</h3>
              <p className="text-xs">
                BP: <strong>{vitals.bp} mmHg</strong> · Sugar: <strong>{vitals.sugar} mg/dL</strong> · Pulse: <strong>{vitals.pulse} bpm</strong> · Wellness: <strong>{vitals.mood}</strong>
              </p>
            </div>

            <div className="pt-4 border-t text-[11px] text-[#9CA3AF] text-center">
              * This report is digitally generated by AyuCare Healthcare Platform for medical supervision by attending physicians.
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
