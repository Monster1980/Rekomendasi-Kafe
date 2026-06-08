"use client";

import React, { useState } from 'react';
import { Search, X, Star } from 'lucide-react';
import cafeData from '../../public/cafe_data.json';
import DetailModal from '../components/DetailModal';

interface Review {
  text: string;
  suasana: number;
  harga: number;
  pelayanan: number;
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
  totalUlasan?: number;
  rankSuasana?: number;
  rankHarga?: number;
  rankPelayanan?: number;
  reviews: Review[];
}

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);

  // Spotlight / Hero Cafe is "Fifteenth Café"
  const spotlightCafe = (cafeData.find(c => c.name === "Fifteenth Café") || {
    id: "fifteenth",
    name: "Fifteenth Café",
    address: "Jl. Raya Kupang Indah No. 15, Dukuh Kupang, Kec. Dukuhpakis, Surabaya Barat",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200",
    overallRating: 4.6,
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
  const isAspectSearch = ['suasana', 'harga', 'pelayanan'].some(a => searchLower.includes(a));
  
  const filteredCafes = (cafeData as Cafe[]).filter((cafe) => {
    if (!searchTerm.trim()) return true;
    
    // Cari berdasarkan nama kafe
    const nameMatch = cafe.name.toLowerCase().includes(searchLower);
    
    // Cari berdasarkan aspek
    const aspectMatch = isAspectSearch;
    
    // Cari berdasarkan alamat juga
    const addressMatch = (cafe.address || '').toLowerCase().includes(searchLower);
    
    return nameMatch || aspectMatch || addressMatch;
  });

  // Sort/split into rows — diurutkan berdasarkan ranking Naive Bayes (Bab 4)
  // Rank lebih kecil = lebih baik (rank 1 = terbaik)
  // Row A: Suasana (Atmosphere)
  const suasanaCafes = [...filteredCafes].sort((a, b) => (a.rankSuasana || 99) - (b.rankSuasana || 99));
  
  // Row B: Harga (Price)
  const hargaCafes = [...filteredCafes].sort((a, b) => (a.rankHarga || 99) - (b.rankHarga || 99));
  
  // Row C: Pelayanan (Service)
  const pelayananCafes = [...filteredCafes].sort((a, b) => (a.rankPelayanan || 99) - (b.rankPelayanan || 99));

  // Helper: render star rating inline
  const renderStarsSmall = (rating: number) => {
    const stars = [];
    const floorRating = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floorRating) {
        stars.push(<Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />);
      } else if (i - 0.5 <= rating) {
        stars.push(
          <div key={i} className="relative inline-block">
            <Star className="w-2.5 h-2.5 text-zinc-600" />
            <div className="absolute top-0 left-0 overflow-hidden w-[50%]">
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

  return (
    <div className="bg-zinc-950 text-white min-h-screen font-sans overflow-x-hidden pb-16">
      
      {/* Navbar Section */}
      <nav className="fixed top-0 w-full bg-gradient-to-b from-black/90 to-transparent p-6 z-40 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex justify-between items-center w-full md:w-auto">
          <div 
            onClick={() => setSearchTerm('')} 
            className="text-red-600 font-black text-3xl tracking-wider cursor-pointer hover:scale-102 transition duration-200"
          >
            KAFE SURABAYA
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto justify-end">
          {/* Search Input (Cari nama kafe atau aspek) */}
          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Cari kafe atau aspek (suasana, harga, pelayanan)" 
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
        className="relative h-[80vh] w-full flex items-center pl-6 md:pl-16 bg-cover bg-center transition-all duration-500" 
        style={{ backgroundImage: `url('${spotlightCafe.imageUrl || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200"}')` }}
      >
        {/* Netflix Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="text-red-500 font-extrabold tracking-widest text-xs uppercase bg-red-950/40 border border-red-800 px-3 py-1 rounded-full">
            Rekomendasi Utama
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            {spotlightCafe.name}
          </h1>
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <span className="flex items-center text-yellow-400 font-bold">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
              {spotlightCafe.overallRating}
            </span>
            <span>•</span>
            <span className="text-zinc-400 font-semibold">{spotlightCafe.address || 'Surabaya'}</span>
          </div>
          <p className="text-zinc-300 text-sm md:text-base leading-relaxed max-w-lg">
            Tempat nongkrong dengan konsep jaman jadul yang sangat unik di Surabaya. Mebel vintage, kusen pintu klasik, dan atmosfer nostalgia berpadu menyajikan pengalaman santai terbaik.
          </p>
          <div className="pt-2">
            <button 
              onClick={() => setSelectedCafe(spotlightCafe)}
              className="bg-white hover:bg-zinc-200 text-black px-6 py-3 rounded-md font-bold transition flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
            >
              Lihat Detail Kafe
            </button>
          </div>
        </div>
      </div>

      {/* Rows Container */}
      <div className="px-6 md:px-16 space-y-12 relative z-20 -mt-16">
        
        {/* Row 1: Suasana */}
        {showSuasana && (
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl md:text-2xl font-bold tracking-wide text-white">Suasana</h2>
              <span className="text-zinc-500 text-xs font-semibold">Berdasarkan analisis sentimen ulasan</span>
            </div>
            <div className="flex gap-4 overflow-x-scroll pb-4 scrollbar-hide">
              {suasanaCafes.length === 0 ? (
                <div className="text-zinc-500 text-sm py-8 italic w-full">Tidak ada kafe ditemukan.</div>
              ) : (
                suasanaCafes.map((kafe) => (
                  <div 
                    key={`suasana-${kafe.id}`} 
                    className="min-w-[260px] max-w-[260px] h-[150px] bg-zinc-900 rounded-lg overflow-hidden relative group cursor-pointer border border-zinc-800/40 shadow-md transition-all duration-300 hover:scale-105"
                    onClick={() => setSelectedCafe(kafe)}
                  >
                    <img src={kafe.imageUrl} alt={kafe.name} className="w-full h-full object-cover group-hover:opacity-40 transition duration-300" />
                    
                    {/* Hover Information overlay */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-between bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <div className="flex justify-between items-start">
                        <span className="bg-emerald-950/70 border border-emerald-800 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold">
                          ★ Suasana
                        </span>
                        <div className="flex items-center gap-0.5 text-yellow-400 text-xs font-bold bg-black/60 px-2 py-0.5 rounded">
                          <div className="flex items-center gap-0.5">{renderStarsSmall(kafe.suasanaRating || 0)}</div>
                          <span className="ml-1">{kafe.suasanaRating}</span>
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
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl md:text-2xl font-bold tracking-wide text-white">Harga</h2>
              <span className="text-zinc-500 text-xs font-semibold">Berdasarkan analisis sentimen ulasan</span>
            </div>
            <div className="flex gap-4 overflow-x-scroll pb-4 scrollbar-hide">
              {hargaCafes.length === 0 ? (
                <div className="text-zinc-500 text-sm py-8 italic w-full">Tidak ada kafe ditemukan.</div>
              ) : (
                hargaCafes.map((kafe) => (
                  <div 
                    key={`harga-${kafe.id}`} 
                    className="min-w-[260px] max-w-[260px] h-[150px] bg-zinc-900 rounded-lg overflow-hidden relative group cursor-pointer border border-zinc-800/40 shadow-md transition-all duration-300 hover:scale-105"
                    onClick={() => setSelectedCafe(kafe)}
                  >
                    <img src={kafe.imageUrl} alt={kafe.name} className="w-full h-full object-cover group-hover:opacity-40 transition duration-300" />
                    
                    {/* Hover Information overlay */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-between bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <div className="flex justify-between items-start">
                        <span className="bg-blue-950/70 border border-blue-800 text-blue-400 text-[10px] px-2 py-0.5 rounded font-bold">
                          ★ Harga
                        </span>
                        <div className="flex items-center gap-0.5 text-yellow-400 text-xs font-bold bg-black/60 px-2 py-0.5 rounded">
                          <div className="flex items-center gap-0.5">{renderStarsSmall(kafe.hargaRating || 0)}</div>
                          <span className="ml-1">{kafe.hargaRating}</span>
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
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl md:text-2xl font-bold tracking-wide text-white">Pelayanan</h2>
              <span className="text-zinc-500 text-xs font-semibold">Berdasarkan analisis sentimen ulasan</span>
            </div>
            <div className="flex gap-4 overflow-x-scroll pb-4 scrollbar-hide">
              {pelayananCafes.length === 0 ? (
                <div className="text-zinc-500 text-sm py-8 italic w-full">Tidak ada kafe ditemukan.</div>
              ) : (
                pelayananCafes.map((kafe) => (
                  <div 
                    key={`pelayanan-${kafe.id}`} 
                    className="min-w-[260px] max-w-[260px] h-[150px] bg-zinc-900 rounded-lg overflow-hidden relative group cursor-pointer border border-zinc-800/40 shadow-md transition-all duration-300 hover:scale-105"
                    onClick={() => setSelectedCafe(kafe)}
                  >
                    <img src={kafe.imageUrl} alt={kafe.name} className="w-full h-full object-cover group-hover:opacity-40 transition duration-300" />
                    
                    {/* Hover Information overlay */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-between bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <div className="flex justify-between items-start">
                        <span className="bg-purple-950/70 border border-purple-800 text-purple-400 text-[10px] px-2 py-0.5 rounded font-bold">
                          ★ Pelayanan
                        </span>
                        <div className="flex items-center gap-0.5 text-yellow-400 text-xs font-bold bg-black/60 px-2 py-0.5 rounded">
                          <div className="flex items-center gap-0.5">{renderStarsSmall(kafe.pelayananRating || 0)}</div>
                          <span className="ml-1">{kafe.pelayananRating}</span>
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
