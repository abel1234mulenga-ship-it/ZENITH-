
import React, { useState, useEffect, useMemo } from 'react';
import { Product, ZAMBIAN_CITIES, City } from '../types';
import { compareProductsAI } from '../geminiService';

interface MarketplaceProps {
  products: Product[];
  config: any;
}

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const Marketplace: React.FC<MarketplaceProps> = ({ products, config }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState<City | 'current' | 'all'>('all');
  const [userCoords, setUserCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(500); 
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [compareResult, setCompareResult] = useState('');
  const [showTools, setShowTools] = useState(false);

  const categories = ['All', 'Agriculture', 'Mining', 'Electronics', 'Fashion', 'Machinery', 'Real Estate', 'Logistics'];

  useEffect(() => {
    const saved = localStorage.getItem('zenith_wishlist');
    if (saved) setWishlist(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('zenith_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (selectedCity === 'current') {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          console.error("Geolocation failed:", err);
          setSelectedCity('all');
        }
      );
    }
  }, [selectedCity]);

  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const addToCompare = (product: Product) => {
    if (compareList.find(p => p.id === product.id)) return;
    if (compareList.length >= 3) return alert("Maximum 3 assets for comparison.");
    setCompareList(prev => [...prev, product]);
  };

  const handleRunComparison = async () => {
    if (compareList.length < 2) return alert("Select at least 2 assets.");
    setIsComparing(true);
    setCompareResult('');
    try {
      const res = await compareProductsAI(compareList);
      setCompareResult(res);
    } catch (e) {
      setCompareResult("Comparison analysis failed. Please retry.");
    } finally {
      setIsComparing(false);
    }
  };

  const filterByDistance = (product: Product) => {
    if (selectedCity === 'all') return true;
    let targetLat, targetLng;
    if (selectedCity === 'current' && userCoords) {
      targetLat = userCoords.lat;
      targetLng = userCoords.lng;
    } else if (typeof selectedCity === 'object') {
      targetLat = selectedCity.lat;
      targetLng = selectedCity.lng;
    } else return true;
    const dist = getDistance(targetLat, targetLng, product.location.lat, product.location.lng);
    return dist <= maxDistance;
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(p => 
      (category === 'All' || p.category === category) &&
      (p.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (p.price >= minPrice && p.price <= maxPrice) &&
      filterByDistance(p)
    );

    result.sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'popular') return b.clicks - a.clicks;
      return b.createdAt - a.createdAt;
    });

    return result;
  }, [products, category, searchTerm, minPrice, maxPrice, selectedCity, userCoords, maxDistance, sortBy]);

  // Separate promoted items that match the filters
  const promotedList = filteredAndSortedProducts.filter(p => p.isPromoted);
  
  return (
    <div className="space-y-8 md:space-y-16 animate-in fade-in duration-1000">
      <div className="space-y-8">
        <div className="flex flex-col 2xl:flex-row justify-between items-start 2xl:items-end gap-8 md:gap-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
               <span className="w-12 h-1 bg-emerald-600 rounded-full"></span>
               <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.5em]">Zambian Trade Terminal v3.0</p>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-gray-900 tracking-tighter leading-none mb-4 md:mb-6">Zenith <span className="text-emerald-600">Market</span></h1>
            <p className="text-gray-400 font-bold text-lg md:text-2xl leading-relaxed max-w-xl">Intelligent spatial-trade terminal with localized AI analysis tools.</p>
          </div>
          
          <div className="flex flex-col md:flex-row flex-wrap gap-4 md:gap-6 w-full 2xl:w-auto items-stretch md:items-center">
             <div className="flex bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-gray-100 px-6 py-4 md:px-10 md:py-6 flex-grow min-w-[280px] focus-within:ring-4 md:focus-within:ring-8 focus-within:ring-emerald-50 transition-all group">
                <i className="fas fa-search text-emerald-500 self-center mr-4 md:mr-8 text-xl md:text-2xl transition-transform"></i>
                <input 
                  type="text" 
                  placeholder="Asset search..."
                  className="bg-transparent outline-none w-full text-lg md:text-xl font-bold placeholder:text-gray-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>

             <div className="flex gap-4">
               <div className="flex bg-white p-2 rounded-[2rem] border border-gray-100 shadow-xl">
                  <button onClick={() => setViewMode('grid')} className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}><i className="fas fa-th-large"></i></button>
                  <button onClick={() => setViewMode('list')} className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}><i className="fas fa-list"></i></button>
               </div>

               <button 
                  onClick={() => setShowTools(!showTools)}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center transition-all shadow-2xl border ${showTools ? 'bg-gray-900 text-white border-gray-800' : 'bg-white text-gray-900 border-gray-100'}`}
               >
                  <i className={`fas ${showTools ? 'fa-times' : 'fa-sliders-h'} text-xl md:text-2xl`}></i>
               </button>
             </div>
          </div>
        </div>

        <div className="flex overflow-x-auto space-x-4 md:space-x-6 pb-4 md:pb-8 no-scrollbar">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-8 md:px-14 py-4 md:py-6 rounded-[2rem] md:rounded-[2.5rem] whitespace-nowrap font-black text-[10px] md:text-[11px] uppercase tracking-[0.4em] transition-all shadow-xl ${
                category === cat ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-white text-gray-400 border border-gray-100 hover:border-emerald-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {showTools && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 bg-white p-8 md:p-16 rounded-[3rem] md:rounded-[4.5rem] shadow-2xl border border-gray-100 animate-in slide-in-from-top-10 duration-700">
           <div className="space-y-6">
              <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Market Proximity</p>
              <div className="space-y-4">
                 <select 
                   className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 font-black text-xs uppercase tracking-widest appearance-none cursor-pointer"
                   onChange={(e) => {
                     if (e.target.value === 'all') setSelectedCity('all');
                     else if (e.target.value === 'current') setSelectedCity('current');
                     else setSelectedCity(ZAMBIAN_CITIES.find(c => c.name === e.target.value) || 'all');
                   }}
                 >
                    <option value="all">Whole Zambia</option>
                    <option value="current">Near Me (GPS)</option>
                    {ZAMBIAN_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                 </select>
                 {selectedCity !== 'all' && (
                    <input type="range" min="10" max="1000" step="10" className="w-full accent-emerald-600" value={maxDistance} onChange={e => setMaxDistance(parseInt(e.target.value))} />
                 )}
              </div>
           </div>

           <div className="space-y-6">
              <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Price Range (ZMW)</p>
              <div className="space-y-4">
                 <div className="space-y-3">
                    <div>
                       <div className="flex justify-between mb-1">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Min Limit</span>
                          <span className="text-[9px] font-black text-gray-900">{minPrice.toLocaleString()}</span>
                       </div>
                       <input 
                          type="range" 
                          min="0" 
                          max="1000000" 
                          step="500" 
                          value={minPrice} 
                          onChange={(e) => {
                             const val = parseInt(e.target.value);
                             if (val < maxPrice) setMinPrice(val);
                          }}
                          className="w-full accent-emerald-600 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer" 
                       />
                    </div>
                    
                    <div>
                       <div className="flex justify-between mb-1">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Max Limit</span>
                          <span className="text-[9px] font-black text-gray-900">{maxPrice.toLocaleString()}</span>
                       </div>
                       <input 
                          type="range" 
                          min="0" 
                          max="1000000" 
                          step="500" 
                          value={maxPrice} 
                          onChange={(e) => {
                             const val = parseInt(e.target.value);
                             if (val > minPrice) setMaxPrice(val);
                          }}
                          className="w-full accent-emerald-600 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer" 
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400">MIN</span>
                       <input type="number" className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3 font-black text-xs outline-none focus:ring-2 focus:ring-emerald-100" value={minPrice} onChange={e => setMinPrice(parseInt(e.target.value) || 0)} />
                    </div>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400">MAX</span>
                       <input type="number" className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3 font-black text-xs outline-none focus:ring-2 focus:ring-emerald-100" value={maxPrice} onChange={e => setMaxPrice(parseInt(e.target.value) || 1000000)} />
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Sort Intelligence</p>
              <div className="grid grid-cols-2 gap-2">
                 {[
                   { id: 'newest', label: 'Newest' },
                   { id: 'price-asc', label: 'Price ↑' },
                   { id: 'price-desc', label: 'Price ↓' },
                   { id: 'popular', label: 'Hot Deals' }
                 ].map(s => (
                   <button 
                     key={s.id}
                     onClick={() => setSortBy(s.id as any)}
                     className={`flex items-center justify-center p-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${
                       sortBy === s.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-200'
                     }`}
                   >
                     {s.label}
                   </button>
                 ))}
              </div>
           </div>

           <div className="space-y-6">
              <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Market Sentiment</p>
              <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-[9px] font-black uppercase text-emerald-800">Trade Volume</span>
                   <span className="text-[9px] font-black uppercase text-emerald-800">+14.2%</span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 w-[78%]"></div>
                </div>
                <p className="text-[8px] font-black text-emerald-600 uppercase mt-3">Sentiment: Bullish</p>
              </div>
           </div>
        </div>
      )}

      {compareList.length > 0 && (
        <div className="bg-gray-900 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-10">
           <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8 md:gap-12">
              <div className="space-y-4 max-w-xl text-center lg:text-left">
                 <h3 className="text-3xl md:text-4xl font-black tracking-tighter">AI Trade Analyst</h3>
                 <p className="text-emerald-400 font-black text-xs uppercase tracking-widest">Pro-tier comparison engine active</p>
              </div>
              <div className="flex items-center gap-4 md:gap-6">
                 {compareList.map(p => (
                    <div key={p.id} className="relative group">
                       <img src={p.imageUrl} className="w-16 h-16 md:w-24 md:h-24 rounded-3xl object-cover border-4 border-white/10 group-hover:scale-110 transition-transform" />
                       <button onClick={() => setCompareList(prev => prev.filter(x => x.id !== p.id))} className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white"><i className="fas fa-times text-[10px]"></i></button>
                    </div>
                 ))}
              </div>
              <button 
                onClick={handleRunComparison}
                disabled={isComparing || compareList.length < 2}
                className="px-10 md:px-14 py-6 md:py-8 bg-emerald-600 text-white rounded-[2.5rem] font-black text-lg md:text-xl hover:bg-emerald-500 transition shadow-2xl disabled:opacity-30 w-full lg:w-auto"
              >
                {isComparing ? 'Analyzing...' : 'Run Analysis'}
              </button>
           </div>
           {compareResult && (
              <div className="mt-8 md:mt-12 p-6 md:p-10 bg-white/5 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/10 animate-in fade-in zoom-in duration-1000 whitespace-pre-wrap leading-relaxed text-gray-300 text-sm md:text-base">
                {compareResult}
              </div>
           )}
        </div>
      )}

      {/* Sponsored/Featured Carousel */}
      {promotedList.length > 0 && (
        <section className="space-y-6">
           <div className="flex items-center gap-4">
              <span className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg"><i className="fas fa-fire"></i></span>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Sponsored Showcase</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {promotedList.map(p => (
                <ProductCard 
                  key={`promo-${p.id}`}
                  product={p}
                  isPromoted={true}
                  isWishlisted={wishlist.includes(p.id)}
                  onWishlist={() => toggleWishlist(p.id)}
                  onCompare={() => addToCompare(p)}
                  viewMode="grid" // Force grid for sponsored
                  showBadge={true}
                />
             ))}
           </div>
           <div className="h-px bg-gray-200 my-8"></div>
        </section>
      )}

      <section className="space-y-8 md:space-y-12">
        <div className="flex items-center gap-4 md:gap-8">
          <h2 className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.8em] whitespace-nowrap">Global Asset Index</h2>
          <div className="h-px bg-gray-100 flex-grow"></div>
        </div>
        
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-12" : "flex flex-col gap-6 md:gap-8"}>
            {filteredAndSortedProducts.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  isPromoted={p.isPromoted}
                  isWishlisted={wishlist.includes(p.id)} 
                  onWishlist={() => toggleWishlist(p.id)} 
                  onCompare={() => addToCompare(p)}
                  viewMode={viewMode}
                  showBadge={p.isPromoted}
                />
            ))}
        </div>
      </section>
    </div>
  );
};

const ProductCard: React.FC<{ 
  product: Product, 
  isPromoted?: boolean, 
  isWishlisted: boolean, 
  onWishlist: () => void, 
  onCompare: () => void,
  viewMode: 'grid' | 'list',
  showBadge?: boolean
}> = ({ product, isPromoted, isWishlisted, onWishlist, onCompare, viewMode, showBadge }) => {
  const [showContact, setShowContact] = useState(false);

  return (
    <div className={`bg-white rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-xl border border-gray-100 hover:shadow-2xl transition-all group ${viewMode === 'list' ? 'flex flex-col md:flex-row items-center gap-0 md:gap-8 p-0 md:p-6' : 'flex flex-col'} ${isPromoted ? 'ring-2 ring-orange-100' : ''}`}>
      <div className={`relative overflow-hidden shrink-0 ${viewMode === 'list' ? 'w-full md:w-48 h-48 md:rounded-[2rem]' : 'aspect-square'}`}>
        <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" />
        {showBadge && isPromoted && <span className="absolute top-4 left-4 bg-orange-500 text-white text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Featured</span>}
      </div>
      <div className={`flex-grow ${viewMode === 'list' ? 'p-6 md:p-0' : 'p-6 md:p-10'} space-y-4 md:space-y-6 relative w-full`}>
        <div>
           <h3 className="font-black text-gray-900 text-xl md:text-2xl line-clamp-1 mb-1">{product.name}</h3>
           <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{product.category}</p>
        </div>
        <p className="font-black text-emerald-700 text-2xl md:text-3xl">ZMW {product.price.toLocaleString()}</p>
        
        <div className="flex gap-2 md:gap-4">
           <button onClick={() => setShowContact(true)} className="flex-grow py-3 md:py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition">Acquire</button>
           <button onClick={onWishlist} className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition ${isWishlisted ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:text-red-500'}`}>
              <i className="fas fa-heart"></i>
           </button>
           <button onClick={onCompare} className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-emerald-600 transition">
              <i className="fas fa-plus"></i>
           </button>
        </div>

        {showContact && (
          <div className="absolute inset-0 bg-gray-950/95 backdrop-blur-xl z-20 flex flex-col items-center justify-center p-6 md:p-8 rounded-[2.5rem] md:rounded-[3.5rem] text-white animate-in fade-in duration-300">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-6">Merchant Line</h4>
             <div className="flex gap-4 w-full">
                {product.contactInfo.phone && <a href={`tel:${product.contactInfo.phone}`} className="flex-grow py-4 bg-white/10 rounded-2xl text-center"><i className="fas fa-phone"></i></a>}
                {product.contactInfo.whatsapp && <a href={`https://wa.me/${product.contactInfo.whatsapp}`} className="flex-grow py-4 bg-green-600 rounded-2xl text-center"><i className="fab fa-whatsapp"></i></a>}
             </div>
             <button onClick={() => setShowContact(false)} className="mt-8 text-[9px] font-black uppercase text-gray-500">Dismiss</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
