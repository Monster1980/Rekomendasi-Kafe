"use client";

import React, { useState, useRef } from 'react';
import { ArrowLeft, FlaskConical, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';

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

export default function EvaluasiPage() {
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
    <div className="bg-zinc-950 text-white min-h-screen font-sans overflow-x-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-md border-b border-zinc-800/60 px-4 sm:px-6 md:px-16 py-4 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold hidden sm:inline">Kembali</span>
          </Link>
          <div className="w-px h-6 bg-zinc-800 hidden sm:block"></div>
          <div 
            className="text-red-600 font-black text-xl sm:text-2xl tracking-wider cursor-pointer"
          >
            KAFE SURABAYA
          </div>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-500 border border-amber-800/50 bg-amber-950/30 px-3 py-1 rounded-full">
          Hasil Penelitian
        </span>
      </nav>

      {/* Main Content */}
      <div className="pt-24 sm:pt-28 px-4 sm:px-6 md:px-16 pb-16 max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-600/30 flex items-center justify-center">
              <span className="text-amber-400 text-2xl">📊</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
                Evaluasi & Analisis Model Naive Bayes
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                Performa klasifikasi Binary Relevance — Multinomial Naive Bayes per aspek
              </p>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-amber-600/40 via-zinc-800 to-transparent mt-4"></div>
        </div>

        {/* ── Info Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Algoritma', value: 'Multinomial NB', icon: '🧠', border: 'border-purple-500/20', bg: 'bg-purple-500/5' },
            { label: 'Pendekatan', value: 'Binary Relevance', icon: '🔀', border: 'border-blue-500/20', bg: 'bg-blue-500/5' },
            { label: 'Smoothing', value: 'Laplace (α=1.0)', icon: '⚙️', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
            { label: 'Jumlah Model', value: '4 (per aspek)', icon: '📦', border: 'border-orange-500/20', bg: 'bg-orange-500/5' },
          ].map((card, idx) => (
            <div key={idx} className={`${card.bg} ${card.border} border rounded-xl p-3 sm:p-4`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">{card.icon}</span>
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">{card.label}</span>
              </div>
              <p className="text-white font-bold text-sm">{card.value}</p>
            </div>
          ))}
        </div>

        {/* ── Tabel Evaluasi ── */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl mb-8">
          <div className="px-4 sm:px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
            <span className="text-sm">📋</span>
            <h2 className="text-sm font-bold text-white">Tabel Evaluasi Per Aspek</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-800/60">
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-bold text-zinc-300 uppercase tracking-wider">Aspek</th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs font-bold text-green-400 uppercase tracking-wider">TP</th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs font-bold text-blue-400 uppercase tracking-wider">TN</th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs font-bold text-orange-400 uppercase tracking-wider">FP</th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs font-bold text-red-400 uppercase tracking-wider">FN</th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs font-bold text-cyan-400 uppercase tracking-wider">Akurasi</th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs font-bold text-purple-400 uppercase tracking-wider">Presisi</th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs font-bold text-pink-400 uppercase tracking-wider">Recall</th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs font-bold text-yellow-400 uppercase tracking-wider">F1-Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {[
                  { aspek: 'Pelayanan', tp: 303, tn: 688, fp: 34, fn: 125, acc: 0.8617, prec: 0.8991, rec: 0.7079, f1: 0.7922, colorClass: 'text-purple-400' },
                  { aspek: 'Suasana',   tp: 358, tn: 513, fp: 102, fn: 177, acc: 0.7574, prec: 0.7783, rec: 0.6692, f1: 0.7196, colorClass: 'text-emerald-400' },
                  { aspek: 'Harga',     tp: 115, tn: 832, fp: 14, fn: 189, acc: 0.8235, prec: 0.8915, rec: 0.3783, f1: 0.5312, colorClass: 'text-blue-400' },
                  { aspek: 'Others',    tp: 0,   tn: 1086, fp: 0, fn: 64, acc: 0.9443, prec: 0.0000, rec: 0.0000, f1: 0.0000, colorClass: 'text-orange-400' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-3 sm:px-4 py-3">
                      <span className={`font-bold ${row.colorClass}`}>{row.aspek}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-center text-green-300 font-mono">{row.tp}</td>
                    <td className="px-3 sm:px-4 py-3 text-center text-blue-300 font-mono">{row.tn}</td>
                    <td className="px-3 sm:px-4 py-3 text-center text-orange-300 font-mono">{row.fp}</td>
                    <td className="px-3 sm:px-4 py-3 text-center text-red-300 font-mono">{row.fn}</td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      <span className="text-cyan-300 font-bold">{(row.acc * 100).toFixed(2)}%</span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      <span className="text-purple-300 font-bold">{(row.prec * 100).toFixed(2)}%</span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      <span className="text-pink-300 font-bold">{(row.rec * 100).toFixed(2)}%</span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      <span className="text-yellow-300 font-bold">{(row.f1 * 100).toFixed(2)}%</span>
                    </td>
                  </tr>
                ))}
                {/* Rata-rata Macro */}
                <tr className="bg-zinc-800/40 border-t-2 border-zinc-700">
                  <td className="px-3 sm:px-4 py-3">
                    <span className="font-extrabold text-white">Rata-rata (Macro)</span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-center text-zinc-500">—</td>
                  <td className="px-3 sm:px-4 py-3 text-center text-zinc-500">—</td>
                  <td className="px-3 sm:px-4 py-3 text-center text-zinc-500">—</td>
                  <td className="px-3 sm:px-4 py-3 text-center text-zinc-500">—</td>
                  <td className="px-3 sm:px-4 py-3 text-center">
                    <span className="text-cyan-400 font-extrabold">84.67%</span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-center">
                    <span className="text-purple-400 font-extrabold">64.22%</span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-center">
                    <span className="text-pink-400 font-extrabold">43.88%</span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-center">
                    <span className="text-yellow-400 font-extrabold">51.08%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Visual Bar Chart Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Akurasi', macro: 84.67, icon: '🎯', labelClass: 'text-cyan-400', badgeClass: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40', barClass: 'bg-cyan-500', values: [
              { name: 'Pelayanan', val: 86.17 }, { name: 'Suasana', val: 75.74 }, { name: 'Harga', val: 82.35 }, { name: 'Others', val: 94.43 }
            ]},
            { label: 'Presisi', macro: 64.22, icon: '🔬', labelClass: 'text-purple-400', badgeClass: 'text-purple-400 bg-purple-950/40 border-purple-800/40', barClass: 'bg-purple-500', values: [
              { name: 'Pelayanan', val: 89.91 }, { name: 'Suasana', val: 77.83 }, { name: 'Harga', val: 89.15 }, { name: 'Others', val: 0.00 }
            ]},
            { label: 'Recall', macro: 43.88, icon: '📡', labelClass: 'text-pink-400', badgeClass: 'text-pink-400 bg-pink-950/40 border-pink-800/40', barClass: 'bg-pink-500', values: [
              { name: 'Pelayanan', val: 70.79 }, { name: 'Suasana', val: 66.92 }, { name: 'Harga', val: 37.83 }, { name: 'Others', val: 0.00 }
            ]},
            { label: 'F1-Score', macro: 51.08, icon: '⚖️', labelClass: 'text-yellow-400', badgeClass: 'text-yellow-400 bg-yellow-950/40 border-yellow-800/40', barClass: 'bg-yellow-500', values: [
              { name: 'Pelayanan', val: 79.22 }, { name: 'Suasana', val: 71.96 }, { name: 'Harga', val: 53.12 }, { name: 'Others', val: 0.00 }
            ]},
          ].map((metric, mIdx) => (
            <div key={mIdx} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{metric.icon}</span>
                  <span className={`font-bold text-sm ${metric.labelClass}`}>{metric.label}</span>
                </div>
                <span className={`text-xs font-extrabold ${metric.badgeClass} border px-2 py-0.5 rounded-full`}>
                  {metric.macro.toFixed(2)}%
                </span>
              </div>
              <div className="space-y-2">
                {metric.values.map((v, vIdx) => (
                  <div key={vIdx} className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-500">{v.name}</span>
                      <span className="text-zinc-400 font-mono">{v.val.toFixed(2)}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${metric.barClass}`}
                        style={{ width: `${Math.max(v.val, 1)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Confusion Matrix Explanation ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-8">
          {[
            { label: 'TP', full: 'True Positive', desc: 'Label 1, prediksi 1 — model benar mengenali aspek yang memang ada dalam ulasan', color: 'text-green-400', bg: 'bg-green-500/5 border-green-500/15', icon: '✅' },
            { label: 'TN', full: 'True Negative', desc: 'Label 0, prediksi 0 — model benar mengenali aspek yang memang tidak ada dalam ulasan', color: 'text-blue-400', bg: 'bg-blue-500/5 border-blue-500/15', icon: '✅' },
            { label: 'FP', full: 'False Positive', desc: 'Label 0, prediksi 1 — model salah menganggap aspek ada padahal tidak ada', color: 'text-orange-400', bg: 'bg-orange-500/5 border-orange-500/15', icon: '❌' },
            { label: 'FN', full: 'False Negative', desc: 'Label 1, prediksi 0 — model gagal mengenali aspek yang sebenarnya ada', color: 'text-red-400', bg: 'bg-red-500/5 border-red-500/15', icon: '❌' },
          ].map((item, idx) => (
            <div key={idx} className={`${item.bg} border rounded-xl p-3 sm:p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{item.icon}</span>
                <span className={`${item.color} font-extrabold text-base`}>{item.label}</span>
              </div>
              <p className="text-zinc-400 text-[10px] font-semibold mb-1">{item.full}</p>
              <p className="text-zinc-500 text-[10px] leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Formula Section ── */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl mb-8">
          <div className="px-4 sm:px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
            <span className="text-sm">📐</span>
            <h2 className="text-sm font-bold text-white">Formula Metrik Evaluasi</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: 'Akurasi', formula: '(TP + TN) / Total', desc: 'Proporsi prediksi benar dari seluruh data', color: 'text-cyan-400' },
                { name: 'Presisi', formula: 'TP / (TP + FP)', desc: 'Dari semua yang diprediksi positif, berapa yang benar', color: 'text-purple-400' },
                { name: 'Recall', formula: 'TP / (TP + FN)', desc: 'Dari semua yang benar positif, berapa yang berhasil ditemukan', color: 'text-pink-400' },
                { name: 'F1-Score', formula: '2 × (P × R) / (P + R)', desc: 'Harmonic mean presisi & recall', color: 'text-yellow-400' },
              ].map((f, idx) => (
                <div key={idx} className="text-center space-y-2">
                  <p className={`${f.color} font-bold text-sm`}>{f.name}</p>
                  <p className="text-zinc-300 text-xs font-mono bg-zinc-950/60 px-3 py-2 rounded-lg border border-zinc-800">{f.formula}</p>
                  <p className="text-zinc-600 text-[10px] leading-snug">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Uji Coba Klasifikasi Aspek (Combined from Analisis) ─── */}
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

        {/* ── Back Button ── */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>

      </div>
    </div>
  );
}
