"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { FlaskConical, ChevronRight, X, ArrowLeft } from 'lucide-react';

function classifyReview(text: string): { suasana: boolean; harga: boolean; pelayanan: boolean; others: boolean } {
  const t = text.toLowerCase();

  const suasanaKeywords = ['suasana', 'atmosfer', 'nyaman', 'cozy', 'tempat', 'dekorasi', 'interior', 'estetik', 'unik', 'ambiance', 'tenang', 'ramai', 'instagramable', 'konsep', 'design'];
  const hargaKeywords = ['harga', 'murah', 'mahal', 'terjangkau', 'worth', 'bayar', 'biaya', 'porsi', 'promo', 'hemat', 'overpriced', 'harganya', 'dompet', 'budget'];
  const pelayananKeywords = ['pelayanan', 'pelayan', 'staff', 'karyawan', 'barista', 'ramah', 'cepat', 'lambat', 'order', 'pelayan', 'waitstaff', 'kasir', 'antri', 'responsif', 'friendly'];
  const othersKeywords = ['parkir', 'wifi', 'toilet', 'ac', 'kebersihan', 'bersih', 'kotor', 'lokasi', 'akses', 'jalan', 'musik', 'playlist', 'colokan', 'sinyal', 'stopkontak'];

  return {
    suasana: suasanaKeywords.some(k => t.includes(k)),
    harga: hargaKeywords.some(k => t.includes(k)),
    pelayanan: pelayananKeywords.some(k => t.includes(k)),
    others: othersKeywords.some(k => t.includes(k)),
  };
}

interface ClassificationResult {
  suasana: boolean;
  harga: boolean;
  pelayanan: boolean;
  others: boolean;
  text: string;
}

export default function AnalisisPage() {
  const [demoText, setDemoText] = useState('');
  const [demoResult, setDemoResult] = useState<ClassificationResult | null>(null);
  const demoRef = useRef<HTMLTextAreaElement>(null);

  const handleClassify = () => {
    if (!demoText.trim()) return;
    const result = classifyReview(demoText);
    setDemoResult({ ...result, text: demoText });
  };

  const handleDemoClear = () => {
    setDemoText('');
    setDemoResult(null);
    demoRef.current?.focus();
  };

  const aspectConfig = [
    { key: 'suasana', label: 'Suasana', desc: 'Atmosfer & kenyamanan tempat', icon: '🌿', color: 'emerald', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/40' },
    { key: 'harga', label: 'Harga', desc: 'Keterjangkauan & value for money', icon: '💰', color: 'blue', border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400', ring: 'ring-blue-500/40' },
    { key: 'pelayanan', label: 'Pelayanan', desc: 'Kualitas layanan & staff', icon: '🤝', color: 'purple', border: 'border-purple-500/30', bg: 'bg-purple-500/10', text: 'text-purple-400', ring: 'ring-purple-500/40' },
    { key: 'others', label: 'Lainnya', desc: 'Parkir, WiFi, kebersihan, dll', icon: '✨', color: 'orange', border: 'border-orange-500/30', bg: 'bg-orange-500/10', text: 'text-orange-400', ring: 'ring-orange-500/40' },
  ] as const;

  return (
    <div className="bg-zinc-950 text-white min-h-screen font-sans overflow-x-hidden pb-16">
      
      {/* Navbar Section */}
      <nav className="fixed top-0 w-full bg-black/90 p-4 sm:p-6 z-40 flex justify-between items-center border-b border-zinc-800">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-sm">Kembali</span>
        </Link>
        <div className="text-red-600 font-black text-xl tracking-wider">
          ANALISIS KAFE
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 px-4 sm:px-6 md:px-16 max-w-4xl mx-auto">
        <div className="mb-8 bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Section Header */}
          <div className="px-4 sm:px-8 py-5 sm:py-6 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-600/30 flex items-center justify-center flex-shrink-0">
                <FlaskConical className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">Uji Coba Klasifikasi Aspek</h2>
                <p className="text-zinc-500 text-xs sm:text-sm mt-0.5">Masukkan ulasan kafe, sistem akan mengklasifikasi aspek yang dibahas</p>
              </div>
            </div>
            <span className="hidden sm:inline ml-auto text-[10px] font-semibold uppercase tracking-widest text-red-500 border border-red-800/50 bg-red-950/30 px-3 py-1 rounded-full">
              Demo Penelitian
            </span>
          </div>

          <div className="p-4 sm:p-8 space-y-5">
            {/* Textarea */}
            <div className="relative">
              <textarea
                ref={demoRef}
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
                placeholder="Contoh: Tempatnya nyaman dan cozy, harganya terjangkau, pelayanan ramah..."
                rows={4}
                className="w-full bg-zinc-950/80 border border-zinc-700 hover:border-zinc-600 focus:border-red-600 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none transition resize-none leading-relaxed"
              />
              {demoText && (
                <button
                  onClick={handleDemoClear}
                  className="absolute top-3 right-3 text-zinc-500 hover:text-white transition"
                  aria-label="Hapus teks"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={handleClassify}
              disabled={!demoText.trim()}
              className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 text-sm shadow-lg shadow-red-900/20"
            >
              <FlaskConical className="w-4 h-4" />
              Klasifikasikan Ulasan
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Result Grid */}
            {demoResult && (
              <div className="animate-[fadeIn_0.3s_ease-out]">
                <style>{`
                  @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                `}</style>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-3">Hasil Klasifikasi Aspek</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {aspectConfig.map((aspect) => {
                    const detected = demoResult[aspect.key as keyof ClassificationResult] as boolean;
                    return (
                      <div
                        key={aspect.key}
                        className={`rounded-xl border p-3 sm:p-4 flex flex-col gap-2 transition-all duration-300 ${
                          detected
                            ? `${aspect.bg} ${aspect.border} ring-2 ${aspect.ring}`
                            : 'bg-zinc-900/30 border-zinc-800/60 opacity-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xl">{aspect.icon}</span>
                          <span className={`text-[10px] font-black uppercase tracking-wider rounded-full px-2 py-0.5 ${
                            detected
                              ? `${aspect.text} ${aspect.bg} ${aspect.border} border`
                              : 'text-zinc-600 bg-zinc-800/50 border border-zinc-700/50'
                          }`}>
                            {detected ? 'Terdeteksi' : 'Tidak'}
                          </span>
                        </div>
                        <div>
                          <p className={`font-extrabold text-sm ${detected ? aspect.text : 'text-zinc-600'}`}>
                            {aspect.label}
                          </p>
                          <p className={`text-[10px] leading-snug mt-0.5 ${detected ? 'text-zinc-400' : 'text-zinc-700'}`}>
                            {aspect.desc}
                          </p>
                        </div>
                        {/* Indicator dot */}
                        <div className="flex items-center gap-1.5 mt-auto">
                          <div className={`w-2 h-2 rounded-full ${detected ? 'bg-current animate-pulse' : 'bg-zinc-700'} ${detected ? aspect.text : ''}`}></div>
                          <span className={`text-[10px] ${detected ? 'text-zinc-400' : 'text-zinc-700'}`}>
                            {detected ? 'Aspek ditemukan dalam ulasan' : 'Aspek tidak ditemukan'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary bar */}
                <div className="mt-4 p-3 sm:p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-zinc-500 font-semibold">Aspek teridentifikasi:</span>
                  {aspectConfig.filter(a => demoResult[a.key as keyof ClassificationResult]).map(a => (
                    <span key={a.key} className={`text-xs font-bold px-2.5 py-1 rounded-full border ${a.bg} ${a.border} ${a.text}`}>
                      {a.label}
                    </span>
                  ))}
                  {!aspectConfig.some(a => demoResult[a.key as keyof ClassificationResult]) && (
                    <span className="text-xs text-zinc-600 italic">Tidak ada aspek yang terdeteksi. Coba tambahkan kata kunci seperti "suasana", "harga", "pelayanan".</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* METRIKS EVALUASI MODEL */}
        <div className="mb-12">
          <h3 className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-4">
            Metriks Evaluasi Model
          </h3>
          <div className="bg-[#141414] border border-zinc-800/80 rounded-xl overflow-hidden shadow-xl overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-900/50 border-b border-zinc-800 text-[10px] sm:text-xs font-medium text-zinc-400 tracking-widest sm:tracking-wider uppercase">
                <tr>
                  <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 font-medium">Aspek</th>
                  <th className="py-2.5 px-1 sm:py-3.5 sm:px-4 font-medium text-center">Akurasi</th>
                  <th className="py-2.5 px-1 sm:py-3.5 sm:px-4 font-medium text-center">Presisi</th>
                  <th className="py-2.5 px-1 sm:py-3.5 sm:px-4 font-medium text-center">Recall</th>
                  <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 font-medium text-center">F1-Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                <tr className="hover:bg-zinc-900/30 transition-colors duration-150">
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-zinc-300 flex items-center gap-1.5 sm:gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-zinc-500 shrink-0"></div>
                    <span className="truncate">Suasana</span>
                  </td>
                  <td className="py-2.5 px-1 sm:py-3.5 sm:px-4 text-[11px] sm:text-sm text-center text-zinc-100 font-medium">88.5%</td>
                  <td className="py-2.5 px-1 sm:py-3.5 sm:px-4 text-[11px] sm:text-sm text-center text-zinc-100 font-medium">89.2%</td>
                  <td className="py-2.5 px-1 sm:py-3.5 sm:px-4 text-[11px] sm:text-sm text-center text-zinc-100 font-medium">87.8%</td>
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-[11px] sm:text-sm text-center">
                    <span className="bg-zinc-800/40 text-zinc-200 text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md font-mono">0.88</span>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-900/30 transition-colors duration-150">
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-blue-400 flex items-center gap-1.5 sm:gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 shrink-0"></div>
                    <span className="truncate">Harga</span>
                  </td>
                  <td className="py-2.5 px-1 sm:py-3.5 sm:px-4 text-[11px] sm:text-sm text-center text-zinc-100 font-medium">92.1%</td>
                  <td className="py-2.5 px-1 sm:py-3.5 sm:px-4 text-[11px] sm:text-sm text-center text-zinc-100 font-medium">91.5%</td>
                  <td className="py-2.5 px-1 sm:py-3.5 sm:px-4 text-[11px] sm:text-sm text-center text-zinc-100 font-medium">93.0%</td>
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-[11px] sm:text-sm text-center">
                    <span className="bg-zinc-800/40 text-zinc-200 text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md font-mono">0.92</span>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-900/30 transition-colors duration-150">
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-purple-400 flex items-center gap-1.5 sm:gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500 shrink-0"></div>
                    <span className="truncate">Pelayanan</span>
                  </td>
                  <td className="py-2.5 px-1 sm:py-3.5 sm:px-4 text-[11px] sm:text-sm text-center text-zinc-100 font-medium">90.4%</td>
                  <td className="py-2.5 px-1 sm:py-3.5 sm:px-4 text-[11px] sm:text-sm text-center text-zinc-100 font-medium">88.9%</td>
                  <td className="py-2.5 px-1 sm:py-3.5 sm:px-4 text-[11px] sm:text-sm text-center text-zinc-100 font-medium">92.1%</td>
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-[11px] sm:text-sm text-center">
                    <span className="bg-zinc-800/40 text-zinc-200 text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md font-mono">0.90</span>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-900/30 transition-colors duration-150">
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-zinc-300 flex items-center gap-1.5 sm:gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-zinc-500 shrink-0"></div>
                    <span className="truncate">Lainnya</span>
                  </td>
                  <td className="py-2.5 px-1 sm:py-3.5 sm:px-4 text-[11px] sm:text-sm text-center text-zinc-100 font-medium">85.3%</td>
                  <td className="py-2.5 px-1 sm:py-3.5 sm:px-4 text-[11px] sm:text-sm text-center text-zinc-100 font-medium">86.1%</td>
                  <td className="py-2.5 px-1 sm:py-3.5 sm:px-4 text-[11px] sm:text-sm text-center text-zinc-100 font-medium">84.5%</td>
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-[11px] sm:text-sm text-center">
                    <span className="bg-zinc-800/40 text-zinc-200 text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md font-mono">0.85</span>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-900/30 transition-colors duration-150 bg-zinc-900/20">
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-[11px] sm:text-sm text-white font-bold flex items-center gap-1.5 sm:gap-2">
                    <span className="hidden sm:inline">Rata-rata / Macro Avg</span>
                    <span className="sm:hidden">Rata-rata</span>
                  </td>
                  <td className="py-2.5 px-1 sm:py-3.5 sm:px-4 text-[11px] sm:text-sm text-center text-white font-bold">89.1%</td>
                  <td className="py-2.5 px-1 sm:py-3.5 sm:px-4 text-[11px] sm:text-sm text-center text-white font-bold">88.9%</td>
                  <td className="py-2.5 px-1 sm:py-3.5 sm:px-4 text-[11px] sm:text-sm text-center text-white font-bold">89.3%</td>
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-[11px] sm:text-sm text-center">
                    <span className="bg-zinc-700/50 text-white font-bold text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md font-mono border border-zinc-600/50">0.89</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
