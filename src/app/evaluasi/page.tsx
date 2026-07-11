"use client";

import React from 'react';
import { ArrowLeft, FlaskConical } from 'lucide-react';
import Link from 'next/link';

export default function EvaluasiPage() {
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
                Evaluasi Model Naive Bayes
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
