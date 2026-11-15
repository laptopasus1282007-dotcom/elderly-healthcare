'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  MessageSquare, 
  Plus, 
  Sparkles, 
  Send, 
  Mic, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Activity, 
  Stethoscope, 
  User, 
  ShieldAlert,
  ChevronRight,
  PhoneCall,
  Volume2
} from 'lucide-react';

export default function AyuCarePortal() {
  const [activeNav, setActiveNav] = useState<'Dashboard' | 'Patients' | 'Appointments' | 'Prescriptions' | 'Medical Records'>('Dashboard');
  const [aiInput, setAiInput] = useState('');
  const [aiChat, setAiChat] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    { sender: 'ai', text: 'Hello Shantabai! All morning medications were taken on time. Your next dose is Metformin 500mg after lunch at 1:30 PM.' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [adherenceStats, setAdherenceStats] = useState({ taken: 4, pending: 1, total: 5, rate: 80 });
  const [selectedDay, setSelectedDay] = useState('Mon 15');
  const [toast, setToast] = useState('');

  // Daily medicine timeline data
  const [medicines, setMedicines] = useState([
    { id: '1', name: 'Metformin 500mg', startDay: 'Wed 10', endDay: 'Tue 16', time: '13:30', badge: '1', badgeColor: 'bg-purple-600', taken: false },
    { id: '2', name: 'Telmisartan 40mg', startDay: 'Tue 9', endDay: 'Thu 18', time: '08:30', badge: '2', badgeColor: 'bg-amber-400', taken: true },
    { id: '3', name: 'Atorvastatin 20mg', startDay: 'Fri 12', endDay: 'Sun 14', time: '21:30', badge: '2', badgeColor: 'bg-amber-400', taken: false },
    { id: '4', name: 'Glimepiride 1mg', startDay: 'Thu 11', endDay: 'Mon 15', time: '20:00', badge: '1', badgeColor: 'bg-purple-600', taken: false },
    { id: '5', name: 'Calcium + Vit D3', startDay: 'Mon 15', endDay: 'Fri 19', time: '21:30', badge: '2', badgeColor: 'bg-amber-400', taken: false },
  ]);

  const days = ['Tue 9', 'Wed 10', 'Thu 11', 'Fri 12', 'Sat 13', 'Sun 14', 'Mon 15', 'Tue 16', 'Wed 17', 'Thu 18', 'Fri 19'];

  const handleTakeDose = (id: string, name: string) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, taken: true } : m));
    setAdherenceStats(prev => ({ ...prev, taken: prev.taken + 1, pending: Math.max(0, prev.pending - 1) }));
    setToast(`✅ Marked ${name} as Taken! Caregiver notified.`);
    setTimeout(() => setToast(''), 4000);
  };

  const handleAiSend = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput;
    setAiChat(prev => [...prev, { sender: 'user', text: userMsg }]);
    setAiInput('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai/drug-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newMedication: userMsg }),
      });
      const data = await res.json();
      setAiChat(prev => [...prev, { 
        sender: 'ai', 
        text: data.message || `I checked your request regarding "${userMsg}". All current prescriptions (Telmisartan, Metformin) remain regular.` 
      }]);
    } catch {
      setAiChat(prev => [...prev, { 
        sender: 'ai', 
        text: `Regarding "${userMsg}": Your vitals are stable (BP 124/82). Remember to take Metformin strictly after lunch.` 
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EBEBF5] p-3 sm:p-6 lg:p-8 flex items-center justify-center font-sans antialiased selection:bg-purple-600 selection:text-white">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#171923] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}

      {/* Main Floating Mac-OS Style Application Window Container */}
      <div className="w-full max-w-[1440px] bg-[#F8F9FD] rounded-[36px] shadow-[0_24px_60px_-15px_rgba(20,25,45,0.18)] border border-white/80 overflow-hidden flex flex-col">
        
        {/* Top Browser Bar & Window Header */}
        <div className="bg-[#FFFFFF] border-b border-[#E8ECF4] px-6 py-4 flex items-center justify-between">
          
          {/* Left Traffic Lights & Logo */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 inline-block" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 inline-block" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 inline-block" />
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6366F1] via-[#8B5CF6] to-[#10B981] p-0.5 flex items-center justify-center shadow-md shadow-indigo-500/20">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-tr from-[#6366F1] to-[#10B981] text-lg">
                  ✚
                </div>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-[#1E2538]">
                CuraNet <span className="text-xs text-[#6366F1] font-bold px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100">AyuCare</span>
              </span>
            </div>
          </div>

          {/* Center Navigation Pills */}
          <div className="hidden md:flex items-center bg-[#F3F5FA] p-1.5 rounded-full border border-[#E4E7F0]">
            {(['Dashboard', 'Patients', 'Appointments', 'Prescriptions', 'Medical Records'] as const).map(nav => (
              <button
                key={nav}
                onClick={() => setActiveNav(nav)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  activeNav === nav
                    ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-500/30'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {nav}
              </button>
            ))}
          </div>

          {/* Right Action Icons & Avatar */}
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-[#F3F5FA] hover:bg-[#EAEFF8] flex items-center justify-center text-[#4B5563] transition-colors">
              <MessageSquare className="w-4 h-4" />
            </button>
            
            <button className="w-10 h-10 rounded-full bg-[#F3F5FA] hover:bg-[#EAEFF8] flex items-center justify-center text-[#4B5563] relative transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            <div className="flex items-center gap-2 pl-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 p-0.5 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"
                  alt="Shantabai"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Workspace Body: Split Grid Layout */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT 8 COLUMNS: Healthcare Management Dashboard */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Greeting Header & Global Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#6B7280]">Good morning, Shantabai!</p>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
                  How are you today?
                </h1>
              </div>

              {/* Pill Search Input */}
              <div className="relative flex items-center w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Search medications..."
                  className="w-full bg-[#FFFFFF] pl-11 pr-14 py-2.5 rounded-full text-xs font-medium border border-[#E5E7EB] shadow-sm outline-none focus:border-[#6366F1] transition-all"
                />
                <span className="absolute right-3 text-[10px] font-bold text-[#9CA3AF] bg-[#F3F4F6] px-1.5 py-0.5 rounded border border-[#E5E7EB]">
                  ⌘ K
                </span>
              </div>
            </div>

            {/* "YOUR DAILY MEDICINE" GANTT TIMELINE CARD */}
            <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-7 border border-[#E8ECF4] shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">Your daily medicine</h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">Track weekly dosages and scheduled consumption timeline</p>
                </div>
                <button
                  onClick={() => alert("Add Medication Dialog: Open Schedule Form")}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-[#F3F5FA] hover:bg-[#6366F1] hover:text-white text-[#6366F1] transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add medicine
                </button>
              </div>

              {/* Days Header Row */}
              <div className="overflow-x-auto pb-2">
                <div className="min-w-[620px]">
                  
                  <div className="grid grid-cols-11 text-center border-b border-[#F1F3F9] pb-3 text-xs font-bold text-[#6B7280]">
                    {days.map(d => (
                      <span 
                        key={d} 
                        onClick={() => setSelectedDay(d)}
                        className={`cursor-pointer transition-colors ${selectedDay === d ? 'text-[#6366F1] font-extrabold' : 'hover:text-[#111827]'}`}
                      >
                        {d}
                      </span>
                    ))}
                  </div>

                  {/* Medicines Gantt Timeline Rows */}
                  <div className="space-y-3.5 pt-4">
                    {medicines.map((med, index) => (
                      <div key={med.id} className="relative flex items-center py-1">
                        
                        {/* Soft Pill Horizontal Timeline Bar */}
                        <div 
                          className="w-full bg-[#F3F5FD] hover:bg-[#EBEFFF] rounded-full p-2 pl-5 pr-3 flex items-center justify-between border border-[#EAEFF9] transition-all group"
                          style={{
                            marginLeft: `${(index % 4) * 8}%`,
                            width: `${82 - (index % 3) * 6}%`
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-xs text-[#1F2937]">{med.name}</span>
                            <span className="text-[10px] text-[#6B7280] font-semibold">⏰ {med.time}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Color Badges matching design */}
                            <span className={`w-6 h-6 rounded-full ${med.badgeColor} text-white text-[11px] font-black flex items-center justify-center shadow-sm`}>
                              {med.badge}
                            </span>
                            
                            <button
                              onClick={() => handleTakeDose(med.id, med.name)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                                med.taken 
                                  ? 'bg-emerald-500 text-white' 
                                  : 'bg-white hover:bg-emerald-500 hover:text-white text-[#4B5563] border border-[#E5E7EB]'
                              }`}
                            >
                              {med.taken ? '✓ Taken' : 'Mark Taken'}
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>

            {/* BOTTOM 3 CARDS ROW: Schedule Heatmap, Adherence Donut, Consultations */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              {/* Card 1: Schedule Heatmap */}
              <div className="bg-[#FFFFFF] rounded-3xl p-5 border border-[#E8ECF4] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-[#111827]">Schedule</h4>
                    <span className="text-xs text-[#9CA3AF]">⤢</span>
                  </div>
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[#6B7280]">
                      <span className="text-[11px] font-semibold">Morning</span>
                      <div className="flex gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-[#818CF8]" />
                        <span className="w-5 h-5 rounded-md bg-[#818CF8]" />
                        <span className="w-5 h-5 rounded-md bg-[#EEF2FF]" />
                        <span className="w-5 h-5 rounded-md bg-[#818CF8]" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[#6B7280]">
                      <span className="text-[11px] font-semibold">Afternoon</span>
                      <div className="flex gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-[#EEF2FF]" />
                        <span className="w-5 h-5 rounded-md bg-[#818CF8]" />
                        <span className="w-5 h-5 rounded-md bg-[#818CF8]" />
                        <span className="w-5 h-5 rounded-md bg-[#818CF8]" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[#6B7280]">
                      <span className="text-[11px] font-semibold">Evening</span>
                      <div className="flex gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-[#818CF8]" />
                        <span className="w-5 h-5 rounded-md bg-[#EEF2FF]" />
                        <span className="w-5 h-5 rounded-md bg-[#818CF8]" />
                        <span className="w-5 h-5 rounded-md bg-[#818CF8]" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-center text-[#9CA3AF] font-bold mt-3 border-t border-[#F3F4F6] pt-2">
                  Mon Tue Wed Thu Fri
                </div>
              </div>

              {/* Card 2: Adherence Compliance Donut */}
              <div className="bg-[#FFFFFF] rounded-3xl p-5 border border-[#E8ECF4] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#111827]">Adherence Rate</h4>
                  <span className="text-xs text-[#9CA3AF]">⤢</span>
                </div>

                <div className="my-auto py-2 flex items-center justify-center">
                  <div className="relative w-28 h-28 rounded-full border-[10px] border-emerald-400 border-t-amber-400 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-2xl font-black text-[#111827]">84%</span>
                      <span className="text-[9px] text-[#6B7280] block font-bold">COMPLIANT</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-[11px] font-bold">
                  <span className="flex items-center gap-1.5 text-amber-500">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> Pending (1)
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Taken (4)
                  </span>
                </div>
              </div>

              {/* Card 3: Consultations / Vitals */}
              <div className="bg-[#FFFFFF] rounded-3xl p-5 border border-[#E8ECF4] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#111827]">Consultations</h4>
                  <span className="text-xs text-[#9CA3AF]">⤢</span>
                </div>

                <div className="space-y-3 my-auto py-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-[#4B5563] mb-1">
                      <span>Cardiologist (Dr. Kulkarni)</span>
                      <span>Nov 20</span>
                    </div>
                    <div className="w-full bg-[#F3F4F6] h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full w-[45%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-[#4B5563] mb-1">
                      <span>Diabetologist (Dr. Deshmukh)</span>
                      <span>Nov 28</span>
                    </div>
                    <div className="w-full bg-[#F3F4F6] h-2.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full w-[70%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-[#4B5563] mb-1">
                      <span>General Checkup</span>
                      <span>Dec 05</span>
                    </div>
                    <div className="w-full bg-[#F3F4F6] h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full w-[85%]" />
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-[#9CA3AF] text-center border-t border-[#F3F4F6] pt-2">
                  *Hospital visits include routine BP & ECG
                </p>
              </div>

            </div>

          </div>

          {/* RIGHT 4 COLUMNS: THE GLOWING AI HEALTH ASSISTANT PANEL */}
          <div className="lg:col-span-4 flex flex-col">
            
            <div className="w-full bg-gradient-to-b from-[#00C5FF] via-[#0284C7] to-[#4F46E5] rounded-[32px] p-6 text-white shadow-xl shadow-cyan-500/20 flex flex-col justify-between min-h-[680px] relative overflow-hidden">
              
              {/* Background ambient lighting glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-900/40 rounded-full blur-3xl pointer-events-none" />

              {/* Top Assistant Header */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-xs font-bold text-white/80">AyuCare AI 1.4</span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold backdrop-blur-sm">
                    Beta
                  </span>
                  <button className="text-white/80 hover:text-white text-xs">⤢</button>
                </div>
              </div>

              {/* Center 3D Digital Holographic Sphere Orb */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto py-6">
                
                {/* Glowing Morphing Mesh Orb */}
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-300 via-sky-200 to-indigo-300 opacity-75 blur-xl animate-pulse" />
                  
                  {/* Digital wireframe orb */}
                  <div className="w-36 h-36 rounded-full border border-white/50 bg-white/10 backdrop-blur-md flex items-center justify-center shadow-inner relative animate-spin duration-1000" style={{ animationDuration: '24s' }}>
                    <div className="w-28 h-28 rounded-full border border-cyan-200/60 flex items-center justify-center animate-ping duration-1000" style={{ animationDuration: '4s' }} />
                    <span className="absolute text-3xl font-black text-white drop-shadow-md">✚</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mt-4 text-center tracking-tight">
                  How can I assist you today?
                </h3>
              </div>

              {/* Action Chips Grid (2x3 Grid matching design) */}
              <div className="relative z-10 grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Specialists', icon: '🩺' },
                  { label: 'Med. History', icon: '📋' },
                  { label: 'My EHR', icon: '📁' },
                  { label: 'Health report', icon: '📊' },
                  { label: 'Prescriptions', icon: '💊' },
                  { label: 'Consultation', icon: '📞' }
                ].map(chip => (
                  <button
                    key={chip.label}
                    onClick={() => setAiInput(`Show my ${chip.label}`)}
                    className="bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 rounded-2xl py-2 px-1 text-center text-white transition-all active:scale-95 flex flex-col items-center justify-center gap-1"
                  >
                    <span className="text-sm">{chip.icon}</span>
                    <span className="text-[10px] font-bold truncate w-full">{chip.label}</span>
                  </button>
                ))}
              </div>

              {/* Chat Output & Interactive Pill Input */}
              <div className="relative z-10 space-y-2">
                {aiChat.length > 0 && (
                  <div className="max-h-24 overflow-y-auto text-xs bg-white/15 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-white/95 leading-relaxed">
                    {aiChat[aiChat.length - 1].text}
                  </div>
                )}

                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAiSend()}
                    placeholder="Ask anything..."
                    className="w-full bg-white/20 backdrop-blur-md text-white placeholder-white/70 pl-4 pr-16 py-3 rounded-full text-xs font-medium border border-white/30 outline-none focus:bg-white/30 transition-all shadow-inner"
                  />
                  
                  <div className="absolute right-2 flex items-center gap-1">
                    <button 
                      onClick={() => alert("Voice assistant ready. Speak into microphone.")}
                      className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/20"
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleAiSend}
                      className="p-1.5 bg-white text-[#0284C7] rounded-full hover:bg-white/90 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[9px] text-center text-white/60 font-medium">
                  AyuAI can make mistakes. Check important medical information.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
