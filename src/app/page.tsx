"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, X, Star } from 'lucide-react';
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

// Classifier logic has been extracted to /analisis/page.tsx

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);

  // Demo state removed, now in /analisis

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

  // Pencarian hanya mencari nama kafe atau alamatnya
  const searchLower = searchTerm.toLowerCase().trim();
  
  const filteredCafes = (cafeData as Cafe[]).filter((cafe) => {
    if (!searchTerm.trim()) return true;
    const nameMatch = cafe.name.toLowerCase().includes(searchLower);
    const addressMatch = (cafe.address || '').toLowerCase().includes(searchLower);
    return nameMatch || addressMatch;
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

  // Category rows are always visible
  const showSuasana = true;
  const showHarga = true;
  const showPelayanan = true;
  const showOthers = true;

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
        
        <div className="flex items-center w-full md:w-auto justify-end gap-4">
          <Link href="/analisis" className="text-zinc-300 hover:text-white text-sm font-bold transition">
            Analisis
          </Link>
          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="Cari nama atau alamat kafe..." 
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
