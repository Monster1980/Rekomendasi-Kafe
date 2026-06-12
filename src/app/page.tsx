"use client";

import React, { useState, useRef } from 'react';
import { Search, X, Star, FlaskConical, ChevronRight } from 'lucide-react';
import cafeData from '../../public/cafe_data.json';
import DetailModal from '../components/DetailModal';

interface Review {
  text: string;
  suasana: number;
  harga: number;
  pelayanan: number;
  others?: number;
}

interface Cafe {
  id: string;
  name: string;
  address?: string;
  imageUrl?: string;
  overallRating: number;
  suasanaRating?: number;
  hargaRating?: number;
  pelayananRating?: number;
  othersRating?: number;
  totalUlasan?: number;
  rankSuasana?: number;
  rankHarga?: number;
  rankPelayanan?: number;
  rankOthers?: number;
  reviews: Review[];
}

// ─── Simple keyword-based aspect classifier for demo ────────────────────────
// In a real setting this would call your Naive Bayes / ML backend.
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

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);

  // Demo classifier state
  const [demoText, setDemoText] = useState('');
  const [demoResult, setDemoResult] = useState<ClassificationResult | null>(null);
  const demoRef = useRef<HTMLTextAreaElement>(null);

  // Spotlight / Hero Cafe is "Fifteenth Café"
  const spotlightCafe = (cafeData.find(c => c.name === "Fifteenth Café") || {
    id: "fifteenth",
    name: "Fifteenth Café",
    address: "Jl. Raya Kupang Indah No. 15, Dukuh Kupang, Kec. Dukuhpakis, Surabaya Barat",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200",
    overallRating: 4.9,
    suasanaRating: 4.8,
    hargaRating: 4.4,
    pelayananRating: 4.7,
    rankSuasana: 3,
    rankHarga: 10,
    rankPelayanan: 8,
    reviews: []
  }) as Cafe;

  // Pencarian bisa mencari nama kafe atau aspeknya
  const searchLower = searchTerm.toLowerCase().trim();
  const isAspectSearch = ['suasana', 'harga', 'pelayanan', 'others', 'lainnya'].some(a => searchLower.includes(a));
  
  const filteredCafes = (cafeData as Cafe[]).filter((cafe) => {
    if (!searchTerm.trim()) return true;
    const nameMatch = cafe.name.toLowerCase().includes(searchLower);
    const aspectMatch = isAspectSearch;
    const addressMatch = (cafe.address || '').toLowerCase().includes(searchLower);
    return nameMatch || aspectMatch || addressMatch;
  });

  // Sort/split into rows — diurutkan berdasarkan ranking Naive Bayes (Bab 4)
  const suasanaCafes = [...filteredCafes].sort((a, b) => (a.rankSuasana || 99) - (b.rankSuasana || 99));
  const hargaCafes = [...filteredCafes].sort((a, b) => (a.rankHarga || 99) - (b.rankHarga || 99));
  const pelayananCafes = [...filteredCafes].sort((a, b) => (a.rankPelayanan || 99) - (b.rankPelayanan || 99));
  const othersCafes = [...filteredCafes].sort((a, b) => (a.rankOthers || 99) - (b.rankOthers || 99));

  // Helper: render star rating — precise partial fill (like Google Maps)
  const renderStarsSmall = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const diff = rating - (i - 1);
      if (diff >= 1) {
        stars.push(<Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />);
      } else if (diff > 0) {
        const pct = Math.round(diff * 100);
        stars.push(
          <div key={i} className="relative inline-block">
            <Star className="w-2.5 h-2.5 text-zinc-600" />
            <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>
              <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-2.5 h-2.5 text-zinc-600" />);
      }
    }
    return stars;
  };

  // Determine which rows to highlight when searching by aspect
  const showSuasana = !isAspectSearch || searchLower.includes('suasana');
  const showHarga = !isAspectSearch || searchLower.includes('harga');
  const showPelayanan = !isAspectSearch || searchLower.includes('pelayanan');
  const showOthers = !isAspectSearch || searchLower.includes('others') || searchLower.includes('lainnya');

  // Handle demo classification
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
      <nav className="fixed top-0 w-full bg-gradient-to-b from-black/90 to-transparent p-4 sm:p-6 z-40 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
        <div className="flex justify-between items-center w-full md:w-auto">
          <div 
            onClick={() => setSearchTerm('')} 
            className="text-red-600 font-black text-2xl sm:text-3xl tracking-wider cursor-pointer hover:scale-102 transition duration-200"
          >
            KAFE SURABAYA
          </div>
        </div>
        
        <div className="flex items-center w-full md:w-auto justify-end">
          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="Cari kafe atau aspek..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/75 border border-zinc-800 rounded px-4 py-2 text-sm text-white focus:outline-none focus:border-red-600 transition pl-10 shadow-inner"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              <Search className="w-4 h-4" />
            </span>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer transition"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Spotlight (Fifteenth Café) */}
      <div 
        className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] w-full flex items-center pl-5 sm:pl-8 md:pl-16 bg-cover bg-center transition-all duration-500" 
        style={{ backgroundImage: `url('${spotlightCafe.imageUrl || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200"}')` }}
      >
        {/* Netflix Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
        
        <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4 pr-4">
          <span className="text-red-500 font-extrabold tracking-widest text-xs uppercase bg-red-950/40 border border-red-800 px-3 py-1 rounded-full">
            Rekomendasi Utama
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            {spotlightCafe.name}
          </h1>
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <span className="flex items-center text-yellow-400 font-bold">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
              {spotlightCafe.overallRating}
            </span>
            <span>•</span>
            <span className="text-zinc-400 font-semibold text-xs sm:text-sm line-clamp-1">{spotlightCafe.address || 'Surabaya'}</span>
          </div>
          <p className="text-zinc-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-lg hidden sm:block">
            Tempat nongkrong dengan konsep jaman jadul yang sangat unik di Surabaya. Mebel vintage, kusen pintu klasik, dan atmosfer nostalgia berpadu menyajikan pengalaman santai terbaik.
          </p>
          <div className="pt-1 sm:pt-2">
            <button 
              onClick={() => setSelectedCafe(spotlightCafe)}
              className="bg-white hover:bg-zinc-200 text-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-md font-bold transition flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
              Lihat Detail Kafe
            </button>
          </div>
        </div>
      </div>

      {/* Rows Container */}
      <div className="px-4 sm:px-6 md:px-16 space-y-10 sm:space-y-12 relative z-20 -mt-12 sm:-mt-16">
        
        {/* Row 1: Suasana */}
        {showSuasana && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-white">Suasana</h2>
              <span className="text-zinc-500 text-xs font-semibold hidden sm:inline">Berdasarkan ulasan klasifikasi aspek</span>
            </div>
            <div className="flex gap-3 sm:gap-4 overflow-x-scroll pb-4 scrollbar-hide">
              {suasanaCafes.length === 0 ? (
                <div className="text-zinc-500 text-sm py-8 italic w-full">Tidak ada kafe ditemukan.</div>
              ) : (
                suasanaCafes.map((kafe) => (
                  <div 
                    key={`suasana-${kafe.id}`} 
                    className="min-w-[200px] sm:min-w-[240px] md:min-w-[260px] max-w-[200px] sm:max-w-[240px] md:max-w-[260px] h-[130px] sm:h-[145px] md:h-[150px] bg-zinc-900 rounded-lg overflow-hidden relative group cursor-pointer border border-zinc-800/40 shadow-md transition-all duration-300 hover:scale-105"
                    onClick={() => setSelectedCafe(kafe)}
                  >
                    <img src={kafe.imageUrl} alt={kafe.name} className="w-full h-full object-cover group-hover:opacity-40 transition duration-300" />
                    {/* Always visible name at bottom */}
                    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <h3 className="font-bold text-xs text-white truncate">{kafe.name}</h3>
                    </div>
                    {/* Hover Information overlay */}
                    <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-between bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <div className="flex justify-between items-start">
                        <span className="bg-emerald-950/70 border border-emerald-800 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold">
                          ★ Suasana
                        </span>
                        <div className="flex items-center gap-0.5 text-yellow-400 text-xs font-bold bg-black/60 px-1.5 py-0.5 rounded">
                          <div className="flex items-center gap-0.5">{renderStarsSmall(kafe.overallRating || 0)}</div>
                          <span className="ml-1">{kafe.overallRating}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <h3 className="font-extrabold text-sm text-white truncate">{kafe.name}</h3>
                        <p className="text-[10px] text-zinc-300 truncate">{kafe.address || 'Surabaya'}</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCafe(kafe);
                          }}
                          className="w-full bg-white hover:bg-zinc-200 text-black text-[10px] font-bold py-1.5 rounded text-center transition cursor-pointer"
                        >
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Row 2: Harga */}
        {showHarga && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-white">Harga</h2>
              <span className="text-zinc-500 text-xs font-semibold hidden sm:inline">Berdasarkan ulasan klasifikasi aspek</span>
            </div>
            <div className="flex gap-3 sm:gap-4 overflow-x-scroll pb-4 scrollbar-hide">
              {hargaCafes.length === 0 ? (
                <div className="text-zinc-500 text-sm py-8 italic w-full">Tidak ada kafe ditemukan.</div>
              ) : (
                hargaCafes.map((kafe) => (
                  <div 
                    key={`harga-${kafe.id}`} 
                    className="min-w-[200px] sm:min-w-[240px] md:min-w-[260px] max-w-[200px] sm:max-w-[240px] md:max-w-[260px] h-[130px] sm:h-[145px] md:h-[150px] bg-zinc-900 rounded-lg overflow-hidden relative group cursor-pointer border border-zinc-800/40 shadow-md transition-all duration-300 hover:scale-105"
                    onClick={() => setSelectedCafe(kafe)}
                  >
                    <img src={kafe.imageUrl} alt={kafe.name} className="w-full h-full object-cover group-hover:opacity-40 transition duration-300" />
                    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <h3 className="font-bold text-xs text-white truncate">{kafe.name}</h3>
                    </div>
                    {/* Hover Information overlay */}
                    <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-between bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <div className="flex justify-between items-start">
                        <span className="bg-blue-950/70 border border-blue-800 text-blue-400 text-[10px] px-2 py-0.5 rounded font-bold">
                          ★ Harga
                        </span>
                        <div className="flex items-center gap-0.5 text-yellow-400 text-xs font-bold bg-black/60 px-1.5 py-0.5 rounded">
                          <div className="flex items-center gap-0.5">{renderStarsSmall(kafe.overallRating || 0)}</div>
                          <span className="ml-1">{kafe.overallRating}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <h3 className="font-extrabold text-sm text-white truncate">{kafe.name}</h3>
                        <p className="text-[10px] text-zinc-300 truncate">{kafe.address || 'Surabaya'}</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCafe(kafe);
                          }}
                          className="w-full bg-white hover:bg-zinc-200 text-black text-[10px] font-bold py-1.5 rounded text-center transition cursor-pointer"
                        >
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Row 3: Pelayanan */}
        {showPelayanan && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-white">Pelayanan</h2>
              <span className="text-zinc-500 text-xs font-semibold hidden sm:inline">Berdasarkan ulasan klasifikasi aspek</span>
            </div>
            <div className="flex gap-3 sm:gap-4 overflow-x-scroll pb-4 scrollbar-hide">
              {pelayananCafes.length === 0 ? (
                <div className="text-zinc-500 text-sm py-8 italic w-full">Tidak ada kafe ditemukan.</div>
              ) : (
                pelayananCafes.map((kafe) => (
                  <div 
                    key={`pelayanan-${kafe.id}`} 
                    className="min-w-[200px] sm:min-w-[240px] md:min-w-[260px] max-w-[200px] sm:max-w-[240px] md:max-w-[260px] h-[130px] sm:h-[145px] md:h-[150px] bg-zinc-900 rounded-lg overflow-hidden relative group cursor-pointer border border-zinc-800/40 shadow-md transition-all duration-300 hover:scale-105"
                    onClick={() => setSelectedCafe(kafe)}
                  >
                    <img src={kafe.imageUrl} alt={kafe.name} className="w-full h-full object-cover group-hover:opacity-40 transition duration-300" />
                    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <h3 className="font-bold text-xs text-white truncate">{kafe.name}</h3>
                    </div>
                    {/* Hover Information overlay */}
                    <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-between bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <div className="flex justify-between items-start">
                        <span className="bg-purple-950/70 border border-purple-800 text-purple-400 text-[10px] px-2 py-0.5 rounded font-bold">
                          ★ Pelayanan
                        </span>
                        <div className="flex items-center gap-0.5 text-yellow-400 text-xs font-bold bg-black/60 px-1.5 py-0.5 rounded">
                          <div className="flex items-center gap-0.5">{renderStarsSmall(kafe.overallRating || 0)}</div>
                          <span className="ml-1">{kafe.overallRating}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <h3 className="font-extrabold text-sm text-white truncate">{kafe.name}</h3>
                        <p className="text-[10px] text-zinc-300 truncate">{kafe.address || 'Surabaya'}</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCafe(kafe);
                          }}
                          className="w-full bg-white hover:bg-zinc-200 text-black text-[10px] font-bold py-1.5 rounded text-center transition cursor-pointer"
                        >
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Row 4: Others */}
        {showOthers && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-white">Others</h2>
              <span className="text-zinc-500 text-xs font-semibold hidden sm:inline">Aspek tambahan (kebersihan, lokasi, dll)</span>
            </div>
            <div className="flex gap-3 sm:gap-4 overflow-x-scroll pb-4 scrollbar-hide">
              {othersCafes.length === 0 ? (
                <div className="text-zinc-500 text-sm py-8 italic w-full">Tidak ada kafe ditemukan.</div>
              ) : (
                othersCafes.map((kafe) => (
                  <div 
                    key={`others-${kafe.id}`} 
                    className="min-w-[200px] sm:min-w-[240px] md:min-w-[260px] max-w-[200px] sm:max-w-[240px] md:max-w-[260px] h-[130px] sm:h-[145px] md:h-[150px] bg-zinc-900 rounded-lg overflow-hidden relative group cursor-pointer border border-zinc-800/40 shadow-md transition-all duration-300 hover:scale-105"
                    onClick={() => setSelectedCafe(kafe)}
                  >
                    <img src={kafe.imageUrl} alt={kafe.name} className="w-full h-full object-cover group-hover:opacity-40 transition duration-300" />
                    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <h3 className="font-bold text-xs text-white truncate">{kafe.name}</h3>
                    </div>
                    {/* Hover Information overlay */}
                    <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-between bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <div className="flex justify-between items-start">
                        <span className="bg-orange-950/70 border border-orange-800 text-orange-400 text-[10px] px-2 py-0.5 rounded font-bold">
                          ★ Others
                        </span>
                        <div className="flex items-center gap-0.5 text-yellow-400 text-xs font-bold bg-black/60 px-1.5 py-0.5 rounded">
                          <div className="flex items-center gap-0.5">{renderStarsSmall(kafe.overallRating || 0)}</div>
                          <span className="ml-1">{kafe.overallRating}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <h3 className="font-extrabold text-sm text-white truncate">{kafe.name}</h3>
                        <p className="text-[10px] text-zinc-300 truncate">{kafe.address || 'Surabaya'}</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCafe(kafe);
                          }}
                          className="w-full bg-white hover:bg-zinc-200 text-black text-[10px] font-bold py-1.5 rounded text-center transition cursor-pointer"
                        >
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── Demo Klasifikasi Aspek ────────────────────────────────────────── */}
        <div className="mt-8 sm:mt-12 mb-8 bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
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
        {/* ─── End Demo Section ─────────────────────────────────────────────── */}

      </div>

      {/* Detail Modal Component rendering */}
      {selectedCafe && (
        <DetailModal 
          cafe={selectedCafe} 
          onClose={() => setSelectedCafe(null)} 
        />
      )}

    </div>
  );
}
