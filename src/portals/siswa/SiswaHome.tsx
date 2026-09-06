import React, { useState } from 'react';
import { DoubleBezelCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GlassmorphismCTA } from '@/components/ui/glass-cta';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { User } from '@/types';
import { storageService } from '@/services/storageService';
import {
  BookOpen,
  FileText,
  PenTool,
  ArrowRight,
  ShieldCheck,
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  TrendingUp,
  Award,
  ChevronRight,
  ExternalLink,
  Bot,
  Sparkles,
  Zap,
  Flame,
  PieChart,
  BarChart2,
  Check,
  ArrowUpRight,
  ChevronDown
} from 'lucide-react';

export const SiswaHome: React.FC<{
  currentUser: User;
  onNavigate: (route: string) => void;
}> = ({ currentUser, onNavigate }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'minggu' | 'bulan' | 'semua'>('minggu');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const p = currentUser.progress || { materi: 85, video: 70, lkpd: 100, evaluasi: 90 };
  const db = storageService.getState();

  // Concept mastery analytics per sub-topic
  const conceptScores = [
    { title: 'Konsep & Notasi', score: 95, kkm: 75, code: 'BAB 1.1', desc: 'Pemahaman representasi bagian dari keseluruhan' },
    { title: 'Pecahan Senilai', score: 90, kkm: 75, code: 'BAB 1.2', desc: 'Penyederhanaan dan kesetaraan nilai pecahan' },
    { title: 'Penjumlahan & Pengurangan', score: 82, kkm: 75, code: 'BAB 1.3', desc: 'Operasi pecahan beda penyebut dengan KPK' },
    { title: 'Perkalian & Pembagian', score: 88, kkm: 75, code: 'BAB 1.4', desc: 'Perkalian langsung dan invers perkalian' },
  ];

  return (
    <div className="space-y-8 pb-10">
      
      {/* Top Greeting Island (Double-Bezel Light Architecture) */}
      <DoubleBezelCard className="bg-slate-100/70 border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ffc6]"></span>
                <span>{currentUser.class || "Kelas 7-A"} • Kurikulum Merdeka</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span>1 Device Terlindungi</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Selamat Belajar, <span className="text-brand-600">{currentUser.name}</span>!
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
              Pantau kemajuan penguasaan materi bilangan pecahan, hasil umpan balik asisten koreksi AI, dan jadwal evaluasi sumatif harianmu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate('siswa/lkpd')}
              className="text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              <span>Riwayat LKPD</span>
            </Button>
            
            <GlassmorphismCTA
              variant="mint"
              size="md"
              onClick={() => onNavigate('siswa/materi')}
            >
              Lanjut Belajar
            </GlassmorphismCTA>
          </div>
        </div>
      </DoubleBezelCard>

      {/* Row 1: Spike 4-Card Metric Grid (Double-Bezel Haptic Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Metric 1: Materi Pecahan */}
        <div
          onClick={() => onNavigate('siswa/materi')}
          className="group rounded-[2rem] p-1.5 bg-slate-100/80 border border-slate-200/80 hover:border-brand-500/40 hover:shadow-md shadow-xs transition-all duration-300 cursor-pointer active:scale-[0.98]"
        >
          <div className="rounded-[calc(2rem-0.375rem)] bg-white p-5 flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-brand-600 transition-colors">
                <span>Materi Tuntas</span>
                <ChevronRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {p.materi}%
              </div>
              <div className="inline-flex items-center gap-1.5 text-[10.5px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                <TrendingUp size={11} />
                <span>+15% Pekan Ini</span>
              </div>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100/80 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <BookOpen size={22} />
            </div>
          </div>
        </div>

        {/* Metric 2: LKPD AI */}
        <div
          onClick={() => onNavigate('siswa/lkpd')}
          className="group rounded-[2rem] p-1.5 bg-slate-100/80 border border-slate-200/80 hover:border-emerald-500/40 hover:shadow-md shadow-xs transition-all duration-300 cursor-pointer active:scale-[0.98]"
        >
          <div className="rounded-[calc(2rem-0.375rem)] bg-white p-5 flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">
                <span>Tuntas LKPD</span>
                <ChevronRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {p.lkpd}%
              </div>
              <div className="inline-flex items-center gap-1.5 text-[10.5px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                <CheckCircle2 size={11} />
                <span>Koreksi AI Aktif</span>
              </div>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <FileText size={22} />
            </div>
          </div>
        </div>

        {/* Metric 3: Nilai Evaluasi */}
        <div
          onClick={() => onNavigate('siswa/evaluasi')}
          className="group rounded-[2rem] p-1.5 bg-slate-100/80 border border-slate-200/80 hover:border-amber-500/40 hover:shadow-md shadow-xs transition-all duration-300 cursor-pointer active:scale-[0.98]"
        >
          <div className="rounded-[calc(2rem-0.375rem)] bg-white p-5 flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-amber-600 transition-colors">
                <span>Skor Evaluasi</span>
                <ChevronRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {p.evaluasi > 0 ? p.evaluasi : 90}
              </div>
              <div className="inline-flex items-center gap-1.5 text-[10.5px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                <CheckCircle2 size={11} />
                <span>Terverifikasi Tuntas</span>
              </div>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100/80 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Award size={22} />
            </div>
          </div>
        </div>

        {/* Metric 4: Keamanan Sesi 1 Device */}
        <div
          onClick={() => onNavigate('siswa/profil')}
          className="group rounded-[2rem] p-1.5 bg-slate-100/80 border border-slate-200/80 hover:border-cyan-500/40 hover:shadow-md shadow-xs transition-all duration-300 cursor-pointer active:scale-[0.98]"
        >
          <div className="rounded-[calc(2rem-0.375rem)] bg-white p-5 flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-cyan-700 transition-colors">
                <span>Sesi Akun</span>
                <ChevronRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                1 Device
              </div>
              <div className="inline-flex items-center gap-1.5 text-[10.5px] font-black text-cyan-800 bg-cyan-50 border border-cyan-200/60 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                <ShieldCheck size={11} />
                <span>Anti-Joki Aktif</span>
              </div>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100/80 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Bot size={22} />
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Spike Asymmetrical 8/4 Grid (Analytical Chart + Distribution Stacks) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Col 8: Spike "Profit & Expenses" Equivalent -> Penguasaan Konsep Pecahan */}
        <div className="lg:col-span-8">
          <DoubleBezelCard className="bg-slate-100/80 border-slate-200/80">
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
                    <span>Penguasaan Konsep Pecahan</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200/60 whitespace-nowrap inline-flex items-center">
                      Live Analytics
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Capaian kompetensi siswa dibandingkan garis standar Ketuntasan Minimal (KKM 75). Klik bar materi untuk mulai belajar.
                  </p>
                </div>

                {/* Filter Pill Tabs */}
                <div className="inline-flex items-center p-1 rounded-full bg-slate-100 border border-slate-200/80 self-start sm:self-auto text-xs font-bold">
                  {(['minggu', 'bulan', 'semua'] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-3.5 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                        selectedPeriod === period
                          ? 'bg-white text-slate-900 shadow-xs font-black'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {period === 'minggu' ? 'Mingguan' : period === 'bulan' ? 'Bulanan' : 'Semua'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Visual Breakdown */}
              <div className="space-y-4 my-2">
                {conceptScores.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => onNavigate('siswa/materi')}
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                    className="group space-y-2 p-3.5 rounded-2xl border border-transparent hover:border-brand-500/20 hover:bg-slate-50/90 transition-all duration-200 cursor-pointer active:scale-[0.99]"
                    title={`Klik untuk buka materi ${item.title}`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[10.5px] font-black text-slate-500 bg-slate-100 border border-slate-200/70 px-2 py-0.5 rounded-md group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
                          {item.code}
                        </span>
                        <span className="font-extrabold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[11px] font-bold text-slate-400">
                          Standar KKM: <span className="text-slate-600">{item.kkm}%</span>
                        </span>
                        <span className="font-black text-sm text-slate-900 bg-slate-100 group-hover:bg-brand-50 group-hover:text-brand-700 px-2.5 py-0.5 rounded-lg border border-slate-200/60 transition-colors">
                          {item.score}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Track & Reference Marker */}
                    <div className="relative h-4.5 bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]">
                      {/* KKM 75 Reference Marker Line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10 opacity-70"
                        style={{ left: `${item.kkm}%` }}
                        title="Batas KKM (75%)"
                      />

                      {/* Bar Fill */}
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-slate-900 via-brand-600 to-[#00ffc6] transition-all duration-700 ease-out group-hover:brightness-110"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-400 pt-0.5">
                      <span>{item.desc}</span>
                      <div className="flex items-center gap-1 font-bold text-emerald-600 group-hover:text-brand-600 transition-colors">
                        <span>{item.score >= item.kkm ? `+${item.score - item.kkm}% Tuntas` : 'Perlu Review'}</span>
                        <ChevronRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 3-Column Footer Indicator */}
              <div className="pt-5 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rerata Nilai</div>
                  <div className="text-lg sm:text-xl font-black text-slate-900">88.8%</div>
                  <div className="text-[10px] font-bold text-emerald-600">+13.8 vs Standar</div>
                </div>

                <div className="space-y-1 border-x border-slate-100">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Jam Belajar</div>
                  <div className="text-lg sm:text-xl font-black text-slate-900">8.4 Jam</div>
                  <div className="text-[10px] font-bold text-slate-500">14 Sesi Tuntas</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Akurasi AI</div>
                  <div className="text-lg sm:text-xl font-black text-slate-900">96.2%</div>
                  <div className="text-[10px] font-bold text-emerald-600">Terverifikasi</div>
                </div>
              </div>

            </div>
          </DoubleBezelCard>
        </div>

        {/* Col 4: Spike Right Stacked Cards */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card A: Spike "Traffic Distribution" -> Distribusi Capaian Belajar */}
          <DoubleBezelCard className="bg-slate-100/80 border-slate-200/80">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Distribusi Capaian Belajar
                </h3>
                <span className="text-[10.5px] font-black text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  Target 100%
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <div className="text-3xl font-black text-slate-900 tracking-tight">
                    14 / 16
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                    <TrendingUp size={13} />
                    <span>+12% vs Pekan Lalu</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Modul & LKPD terselesaikan</p>
                </div>

                {/* Spike Concentric Radial Donut Chart */}
                <div className="relative w-22 h-22 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {/* Track */}
                    <path
                      className="text-slate-100 stroke-current"
                      strokeWidth="3.8"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Segment 1: LKPD AI (Electric Mint) */}
                    <path
                      className="text-[#00ffc6] stroke-current"
                      strokeDasharray="45, 100"
                      strokeWidth="3.8"
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Segment 2: Materi Pecahan (Dark Slate) */}
                    <path
                      className="text-slate-900 stroke-current"
                      strokeDasharray="30, 100"
                      strokeDashoffset="-45"
                      strokeWidth="3.8"
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Segment 3: Evaluasi HOTS (Indigo) */}
                    <path
                      className="text-indigo-500 stroke-current"
                      strokeDasharray="15, 100"
                      strokeDashoffset="-75"
                      strokeWidth="3.8"
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-xs font-black text-slate-900">
                    88%
                  </div>
                </div>
              </div>

              {/* Legends */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00ffc6]"></span>
                  <span>LKPD AI (45%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                  <span>Materi (35%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  <span>Evaluasi (15%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                  <span>Sisa (5%)</span>
                </div>
              </div>
            </div>
          </DoubleBezelCard>

          {/* Card B: Target Capaian & Asesmen Mandiri (Replaces Ranking/Top 3) */}
          <DoubleBezelCard className="bg-slate-100/80 border-slate-200/80">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Target Capaian & Asesmen Mandiri
                  </h3>
                  <div className="text-2xl font-black text-slate-900 mt-1.5">
                    Tuntas 95% <span className="text-xs font-bold text-slate-400">Kelas 7-A</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 mt-1">
                    <Target size={13} className="text-emerald-500" />
                    <span>Capaian Individual: Sangat Baik</span>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-emerald-600 flex items-center justify-center shadow-xs">
                  <Target size={24} />
                </div>
              </div>

              {/* Sparkline Growth Graphic */}
              <div className="h-9 my-1 flex items-end">
                <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <path
                    d="M 0,20 Q 15,10 30,14 T 60,6 T 85,9 T 100,2"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0,20 Q 15,10 30,14 T 60,6 T 85,9 T 100,2 L 100,24 L 0,24 Z"
                    fill="rgba(16, 185, 129, 0.08)"
                  />
                </svg>
              </div>

              {/* Target Detail Grid */}
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Modul Tuntas</div>
                  <div className="font-extrabold text-slate-900">4 dari 4 Sub-Bab</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Poin Keaktifan</div>
                  <div className="font-extrabold text-emerald-700">1,250 XP</div>
                </div>
              </div>

              {/* Readiness Status Badge */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-[11px] font-extrabold text-emerald-800">
                <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                <span>Siap Ujian Sumatif Bab 1 Pecahan</span>
              </div>

              <ArrowFillButton
                variant="mint"
                size="sm"
                fullWidth
                onClick={() => onNavigate('siswa/evaluasi')}
              >
                Mulai Ujian Evaluasi
              </ArrowFillButton>
            </div>
          </DoubleBezelCard>

        </div>

      </div>

      {/* Row 3: Spike Asymmetrical 4/8 Grid with Equal Height Containers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Col 4: Timeline Aktivitas Belajar (Stretched Container Height) */}
        <div className="lg:col-span-4 flex flex-col">
          <DoubleBezelCard className="h-full bg-slate-100/80 border-slate-200/80 flex-1" innerClassName="h-full flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Timeline Aktivitas Belajar
                </h3>
                <Clock size={16} className="text-slate-400" />
              </div>

              {/* Timeline Items with Clean Line terminating at 4th node */}
              <div className="space-y-0 pl-1">
                
                {/* Item 1 */}
                <div className="relative pl-6 pb-6 border-l-2 border-slate-200">
                  <span className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-brand-600 bg-white ring-2 ring-brand-100"></span>
                  <div className="text-[11px] font-black text-slate-400">10:30 WIB Hari Ini</div>
                  <div className="text-xs font-black text-slate-900 mt-0.5">
                    Unggah Lembar Jawaban LKPD 2
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Asisten Koreksi AI memberikan skor <b className="text-emerald-700">95/100</b> pada soal uraian nomor 3.
                  </p>
                </div>

                {/* Item 2 */}
                <div className="relative pl-6 pb-6 border-l-2 border-slate-200">
                  <span className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-emerald-500 bg-white ring-2 ring-emerald-100"></span>
                  <div className="text-[11px] font-black text-slate-400">08:15 WIB Hari Ini</div>
                  <div className="text-xs font-black text-slate-900 mt-0.5">
                    Menyelesaikan Video Pembelajaran
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Modul: Penjumlahan & Pengurangan Pecahan Berpenyebut Beda.
                  </p>
                </div>

                {/* Item 3 */}
                <div className="relative pl-6 pb-6 border-l-2 border-slate-200">
                  <span className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-amber-500 bg-white ring-2 ring-amber-100"></span>
                  <div className="text-[11px] font-black text-slate-400">Kemarin</div>
                  <div className="text-xs font-black text-slate-900 mt-0.5">
                    Membaca Pengumuman Guru
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Informasi jadwal evaluasi pemahaman pecahan bab 1 pekan depan.
                  </p>
                </div>

                {/* Item 4 */}
                <div className="relative pl-6 pb-0 border-l-2 border-transparent">
                  <span className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-cyan-500 bg-white ring-2 ring-cyan-100"></span>
                  <div className="text-[11px] font-black text-slate-400">3 September 2026</div>
                  <div className="text-xs font-black text-slate-900 mt-0.5">
                    Sesi 1 Akun 1 Device Terverifikasi
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Perangkat aktif berhasil dikunci demi integritas belajar siswa.
                  </p>
                </div>

              </div>
            </div>
          </DoubleBezelCard>
        </div>

        {/* Col 8: Status Lembar Kerja & Evaluasi Table */}
        <div className="lg:col-span-8 flex flex-col">
          <DoubleBezelCard className="h-full bg-slate-100/80 border-slate-200/80 flex-1" innerClassName="h-full flex flex-col">
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Status Lembar Kerja & Evaluasi
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Daftar progres pengerjaan LKPD digital dan asesmen sumatif siswa
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('siswa/lkpd')}
                  className="text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <span>Buka Semua LKPD</span>
                  <ExternalLink size={12} className="ml-1.5 text-slate-400" />
                </Button>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 uppercase text-[10px] font-black border-b border-slate-100">
                      <th className="pb-3 font-bold">Modul / Lembar Kerja</th>
                      <th className="pb-3 font-bold">Kategori</th>
                      <th className="pb-3 font-bold">Nilai AI / Guru</th>
                      <th className="pb-3 font-bold">Status</th>
                      <th className="pb-3 text-right font-bold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    
                    {/* Row 1 */}
                    <tr className="group hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pr-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/70 text-slate-800 flex items-center justify-center shadow-xs">
                            <PieChart size={16} className="text-brand-600" />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">
                              LKPD 01: Konsep Pecahan
                            </div>
                            <div className="text-[10px] text-slate-400">Modul Pizza & Cokelat</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-600 font-semibold">
                        LKPD Digital
                      </td>
                      <td className="py-3.5">
                        <span className="font-mono font-black text-emerald-800 bg-emerald-50/90 border border-emerald-300/80 px-3 py-1 rounded-2xl text-xs inline-flex items-center justify-center min-w-[84px] shadow-2xs">
                          95 / 100
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-300/80 whitespace-nowrap">
                          Tuntas
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => onNavigate('siswa/lkpd')}
                          className="px-3 py-1 rounded-lg text-slate-900 bg-slate-100 hover:bg-slate-200 font-bold transition-all text-xs cursor-pointer"
                        >
                          Lihat Hasil
                        </button>
                      </td>
                    </tr>

                    {/* Row 2 */}
                    <tr className="group hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pr-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/70 text-slate-800 flex items-center justify-center shadow-xs">
                            <Target size={16} className="text-emerald-600" />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">
                              LKPD 02: Pecahan Senilai
                            </div>
                            <div className="text-[10px] text-slate-400">Bentuk Sederhana</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-600 font-semibold">
                        LKPD Digital
                      </td>
                      <td className="py-3.5">
                        <span className="font-mono font-black text-emerald-800 bg-emerald-50/90 border border-emerald-300/80 px-3 py-1 rounded-2xl text-xs inline-flex items-center justify-center min-w-[84px] shadow-2xs">
                          90 / 100
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-300/80 whitespace-nowrap">
                          Tuntas
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => onNavigate('siswa/lkpd')}
                          className="px-3 py-1 rounded-lg text-slate-900 bg-slate-100 hover:bg-slate-200 font-bold transition-all text-xs cursor-pointer"
                        >
                          Lihat Hasil
                        </button>
                      </td>
                    </tr>

                    {/* Row 3 */}
                    <tr className="group hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pr-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/70 text-slate-800 flex items-center justify-center shadow-xs">
                            <PenTool size={16} className="text-amber-600" />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">
                              Evaluasi Bab 1: HOTS Essai
                            </div>
                            <div className="text-[10px] text-slate-400">Uraian Soal Cerita</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-600 font-semibold">
                        Evaluasi Uraian
                      </td>
                      <td className="py-3.5">
                        <span className="font-mono font-black text-amber-800 bg-amber-50/90 border border-amber-300/80 px-3 py-1 rounded-2xl text-xs inline-flex items-center justify-center min-w-[84px] shadow-2xs">
                          88 / 100
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-300/80 whitespace-nowrap">
                          Dinilai Guru & AI
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => onNavigate('siswa/evaluasi')}
                          className="px-3 py-1 rounded-lg text-slate-900 bg-slate-100 hover:bg-slate-200 font-bold transition-all text-xs cursor-pointer"
                        >
                          Kaji Ulang
                        </button>
                      </td>
                    </tr>

                    {/* Row 4 */}
                    <tr className="group hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pr-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/70 text-slate-800 flex items-center justify-center shadow-xs">
                            <Sparkles size={16} className="text-cyan-600" />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">
                              LKPD 03: Operasi Hitung
                            </div>
                            <div className="text-[10px] text-slate-400">Penjumlahan Campuran</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-600 font-semibold">
                        LKPD Digital
                      </td>
                      <td className="py-3.5">
                        <span className="font-mono font-bold text-slate-400 bg-slate-100 border border-slate-200/80 px-3 py-1 rounded-2xl text-xs inline-flex items-center justify-center min-w-[84px]">-</span>
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-300/80 whitespace-nowrap">
                          Sedang Dikerjakan
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => onNavigate('siswa/lkpd')}
                          className="px-3 py-1 rounded-lg text-brand-700 bg-brand-50 hover:bg-brand-100 font-bold transition-all text-xs cursor-pointer"
                        >
                          Lanjutkan
                        </button>
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>

              {/* Bottom Assistant Hardware Bar */}
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-slate-50 to-emerald-50/40 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 shadow-sm flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="3" r="1.75" fill="#00ffc6" />
                      <path d="M12 4.75V7.5" stroke="#00ffc6" strokeWidth="2" strokeLinecap="round" />
                      <rect x="3.5" y="7.5" width="17" height="13.5" rx="4.5" stroke="#00ffc6" strokeWidth="2.2" fill="rgba(0, 255, 198, 0.08)" />
                      <circle cx="8.8" cy="13" r="1.8" fill="#00ffc6" />
                      <circle cx="15.2" cy="13" r="1.8" fill="#00ffc6" />
                      <rect x="9.5" y="16.8" width="5" height="1.5" rx="0.75" fill="#00ffc6" />
                    </svg>
                  </div>
                  <span className="text-slate-600 font-medium">
                    Butuh bantuan visualisasi pecahan pizza atau cokelat? Gunakan <b>Studio Visual</b> atau <b>Kalkulator Pecahan Interaktif</b>.
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <ArrowFillButton
                    variant="secondary"
                    size="sm"
                    onClick={() => onNavigate('siswa/studio')}
                    className="w-full sm:w-auto"
                  >
                    Buka Studio
                  </ArrowFillButton>
                  <ArrowFillButton
                    variant="primary"
                    size="sm"
                    onClick={() => onNavigate('siswa/kalkulator')}
                    className="w-full sm:w-auto"
                  >
                    Kalkulator
                  </ArrowFillButton>
                </div>
              </div>

            </div>
          </DoubleBezelCard>
        </div>

      </div>

    </div>
  );
};

