import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

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

interface DetailModalProps {
  cafe: Cafe;
  onClose: () => void;
}

type AspectTab = 'semua' | 'suasana' | 'harga' | 'pelayanan' | 'others';

export default function DetailModal({ cafe, onClose }: DetailModalProps) {
  const [activeTab, setActiveTab] = useState<AspectTab>('semua');
  
  const dummyAddress = "Jl. Raya Gubeng No. 12, Gubeng, Kec. Gubeng, Surabaya, Jawa Timur 60281";
  const address = cafe.address && cafe.address.trim() !== "" ? cafe.address : dummyAddress;
  
  // Filter reviews by aspect tab
  const getFilteredReviews = (): Review[] => {
    if (!cafe.reviews || cafe.reviews.length === 0) return [];
    
    switch (activeTab) {
      case 'suasana':
        return cafe.reviews.filter(r => r.suasana === 1);
      case 'harga':
        return cafe.reviews.filter(r => r.harga === 1);
      case 'pelayanan':
        return cafe.reviews.filter(r => r.pelayanan === 1);
      case 'others':
        return cafe.reviews.filter(r => r.others === 1);
      default:
        return cafe.reviews;
    }
  };
  
  const displayedReviews = getFilteredReviews().slice(0, 10);

  // Count reviews per aspect
  const reviewCounts = {
    semua: cafe.reviews ? cafe.reviews.length : 0,
    suasana: cafe.reviews ? cafe.reviews.filter(r => r.suasana === 1).length : 0,
    harga: cafe.reviews ? cafe.reviews.filter(r => r.harga === 1).length : 0,
    pelayanan: cafe.reviews ? cafe.reviews.filter(r => r.pelayanan === 1).length : 0,
    others: cafe.reviews ? cafe.reviews.filter(r => r.others === 1).length : 0,
  };

  // Get aspect badges for a review
  const getAspectBadges = (review: Review) => {
    const badges = [];
    if (review.suasana === 1) badges.push({ label: 'Suasana', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' });
    if (review.harga === 1) badges.push({ label: 'Harga', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' });
    if (review.pelayanan === 1) badges.push({ label: 'Pelayanan', color: 'bg-purple-500/10 border-purple-500/20 text-purple-400' });
    if (review.others === 1) badges.push({ label: 'Others', color: 'bg-orange-500/10 border-orange-500/20 text-orange-400' });
    return badges;
  };

  // Function to render stars
  const renderStars = (rating: number) => {
    const stars = [];
    const floorRating = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floorRating) {
        stars.push(<Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />);
      } else if (i - 0.5 <= rating) {
        stars.push(
          <div key={i} className="relative inline-block">
            <Star className="w-5 h-5 text-zinc-655" />
            <div className="absolute top-0 left-0 overflow-hidden w-[50%]">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-5 h-5 text-zinc-600" />);
      }
    }
    return stars;
  };

  // Render small stars for aspect ratings
  const renderStarsSmall = (rating: number) => {
    const stars = [];
    const floorRating = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floorRating) {
        stars.push(<Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />);
      } else if (i - 0.5 <= rating) {
        stars.push(
          <div key={i} className="relative inline-block">
            <Star className="w-3.5 h-3.5 text-zinc-600" />
            <div className="absolute top-0 left-0 overflow-hidden w-[50%]">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-3.5 h-3.5 text-zinc-600" />);
      }
    }
    return stars;
  };

  const tabs: { key: AspectTab; label: string; color: string; activeColor: string }[] = [
    { key: 'semua', label: 'Semua', color: 'text-zinc-400 hover:text-white', activeColor: 'text-white bg-zinc-800 border-zinc-600' },
    { key: 'suasana', label: 'Suasana', color: 'text-emerald-400/70 hover:text-emerald-400', activeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-700' },
    { key: 'harga', label: 'Harga', color: 'text-blue-400/70 hover:text-blue-400', activeColor: 'text-blue-400 bg-blue-950/40 border-blue-700' },
    { key: 'pelayanan', label: 'Pelayanan', color: 'text-purple-400/70 hover:text-purple-400', activeColor: 'text-purple-400 bg-purple-950/40 border-purple-700' },
    { key: 'others', label: 'Others', color: 'text-orange-400/70 hover:text-orange-400', activeColor: 'text-orange-400 bg-orange-950/40 border-orange-700' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-all duration-300">
      <style>{`
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-modalSlideUp {
          animation: modalSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Backdrop Close Click */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose}></div>

      {/* Modal Content Box */}
      <div className="bg-[#181818] text-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-modalSlideUp shadow-2xl border border-zinc-800 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
        
        {/* Header Banner */}
        <div className="relative h-64 md:h-80 w-full bg-zinc-900">
          <img 
            src={cafe.imageUrl || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800"} 
            alt={cafe.name} 
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-black/50"></div>
          
          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 bg-black/60 hover:bg-zinc-800/80 text-white rounded-full p-2 border border-zinc-700 transition cursor-pointer hover:scale-105 z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title on Banner */}
          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-md text-white">
              {cafe.name}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6">
          
          {/* Rating and Info Details */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-300">
            {/* Stars */}
            <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800 px-3 py-1.5 rounded-full">
              <span className="text-yellow-400 font-bold">{cafe.overallRating}</span>
              <div className="flex items-center gap-0.5">{renderStars(cafe.overallRating)}</div>
            </div>
          </div>

          {/* Aspect Ratings with Stars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {cafe.suasanaRating !== undefined && (
              <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Suasana</span>
                  <span className="text-emerald-400 text-sm font-bold">{cafe.suasanaRating}/5</span>
                </div>
                <div className="flex items-center gap-0.5">{renderStarsSmall(cafe.suasanaRating)}</div>
              </div>
            )}
            {cafe.hargaRating !== undefined && (
              <div className="bg-blue-500/5 border border-blue-500/15 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Harga</span>
                  <span className="text-blue-400 text-sm font-bold">{cafe.hargaRating}/5</span>
                </div>
                <div className="flex items-center gap-0.5">{renderStarsSmall(cafe.hargaRating)}</div>
              </div>
            )}
            {cafe.pelayananRating !== undefined && (
              <div className="bg-purple-500/5 border border-purple-500/15 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-purple-400 text-xs font-semibold uppercase tracking-wider">Pelayanan</span>
                  <span className="text-purple-400 text-sm font-bold">{cafe.pelayananRating}/5</span>
                </div>
                <div className="flex items-center gap-0.5">{renderStarsSmall(cafe.pelayananRating)}</div>
              </div>
            )}
            {cafe.othersRating !== undefined && (
              <div className="bg-orange-500/5 border border-orange-500/15 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-orange-400 text-xs font-semibold uppercase tracking-wider">Others</span>
                  <span className="text-orange-400 text-sm font-bold">{cafe.othersRating}/5</span>
                </div>
                <div className="flex items-center gap-0.5">{renderStarsSmall(cafe.othersRating)}</div>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Alamat Lengkap</h3>
            <p className="text-zinc-200 text-sm leading-relaxed bg-zinc-900/40 p-4 rounded-lg border border-zinc-800">
              {address}
            </p>
          </div>

          {/* Reviews Section with Aspect Tabs */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Ulasan Customer</h3>
            
            {/* Aspect Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                    activeTab === tab.key 
                      ? tab.activeColor 
                      : `${tab.color} border-zinc-800 bg-zinc-900/40`
                  }`}
                >
                  {tab.label} ({reviewCounts[tab.key]})
                </button>
              ))}
            </div>

            <div className="space-y-3.5">
              {displayedReviews.length > 0 ? (
                displayedReviews.map((rev, idx) => {
                  const badges = getAspectBadges(rev);
                  return (
                    <div key={idx} className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 transition space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-red-500 font-semibold">Reviewer #{idx + 1}</span>
                          {badges.map((badge, bIdx) => (
                            <span key={bIdx} className={`${badge.color} border px-2 py-0.5 rounded-full text-[10px] font-semibold`}>
                              {badge.label}
                            </span>
                          ))}
                        </div>
                        <span className="text-zinc-550">Verified Visit</span>
                      </div>
                      <p className="text-zinc-300 text-sm leading-relaxed italic">
                        &ldquo;{rev.text}&rdquo;
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-zinc-500 text-sm italic">
                  {activeTab === 'semua' 
                    ? 'Belum ada ulasan untuk kafe ini.' 
                    : `Belum ada ulasan tentang ${activeTab} untuk kafe ini.`}
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
