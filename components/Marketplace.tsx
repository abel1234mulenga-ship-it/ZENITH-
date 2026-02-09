
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
  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState<City | 'current' | 'all'>('all');
  const [userCoords, setUserCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(500); 
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Utility Features State
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [compareResult, setCompareResult] = useState('');
  const [showTools, setShowTools] = useState(false);

  const categories = ['All', 'Agriculture', 'Mining', 'Electronics', 'Fashion', 'Machinery', 'Real Estate', 'Logistics'];

  // Persistence
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

  const promoted = filteredAndSortedProducts.filter(p => p.isPromoted).slice(0, 4);
  const standard = filteredAndSortedProducts.filter(p => !p.isPromoted);

  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      {/* Dynamic Header & Search Hub */}
      <div className="space-y-8">
        <div className="flex flex-col 2xl:flex-row justify-between items-start 2xl:items-end gap-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
               <span className="w-12 h-1 bg-emerald-600 rounded-full"></span>
               <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.5em]">Commercial Terminal v2.5</p>
            </div>
            <h1 className="text-8xl font-black text-gray-900 tracking-tighter leading-none mb-6">Zenith <span className="text-emerald-600">Market</span></h1>
            <p className="text-gray-400 font-bold text-2xl leading-relaxed max-w-xl">Advanced spatial-trade terminal with strategic AI analysis tools.</p>
          </div>
          
          <div className="flex flex-wrap gap-6 w-full 2xl:w-auto items-center">
             {/* Unified Search Bar */}
             <div className="flex bg-white rounded-[3rem] shadow-2xl border border-gray-100 px-10 py-6 flex-grow min-w-[320px] focus-within:ring-8 focus-within:ring-emerald-50 transition-all group">
                <i className="fas fa-search text-emerald-500 self-center mr-8 text-2xl group-focus-within:scale-125 transition-transform"></i>
                <input 
                  type="text" 
                  placeholder="Asset search (e.g. Tractor, Land, Warehouse)..."
                  className="bg-transparent outline-none w-full text-xl font-bold placeholder:text-gray-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>

             {/* View Toggle */}
             <div className="flex bg-white p-2 rounded-[2rem] border border-gray-100 shadow-xl">
                <button onClick={() => setViewMode('grid')} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}><i className="fas fa-grid-2"></i></button>
                <button onClick={() => setViewMode('list')} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}><i className="fas fa-list-ul"></i></button>
             </div>

             {/* Toolbox Toggle */}
             <button 
                onClick={() => setShowTools(!showTools)}
                className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center transition-all shadow-2xl border ${showTools ? 'bg-gray-900 text-white border-gray-800' : 'bg-white text-gray-900 border-gray-100'}`}
             >
                <i className={`fas ${showTools ? 'fa-times' : 'fa-sliders-h'} text-2xl`}></i>
             </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex overflow-x-auto space-x-6 pb-8 no-scrollbar">
          {categories.map(cat => {
            const isActive = category === cat;
            return (
              <button 
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-14 py-6 rounded-[2.5rem] whitespace-nowrap font-black text-[11px] uppercase tracking-[0.4em] transition-all shadow-xl group relative overflow-hidden ${
                  isActive ? 'bg-emerald-600 text-white shadow-emerald-200 scale-105' : 'bg-white text-gray-400 border border-gray-100 hover:border-emerald-200'
                }`}
              >
                {cat}
                {isActive && <span className="absolute bottom-0 left-0 right-0 h-1 bg-white/20"></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Filter Toolbox */}
      {showTools && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 bg-white p-16 rounded-[4.5rem] shadow-2xl border border-gray-100 animate-in slide-in-from-top-10 duration-700">
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
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex justify-between">Radius: <span>{maxDistance} km</span></p>
                       <input type="range" min="10" max="1000" step="10" className="w-full accent-emerald-600" value={maxDistance} onChange={e => setMaxDistance(parseInt(e.target.value))} />
                    </div>
                 )}
              </div>
           </div>

           <div className="space-y-6">
              <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Pricing Threshold</p>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Min ZMW</label>
                    <input type="number" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-black text-sm" value={minPrice} onChange={e => setMinPrice(parseInt(e.target.value) || 0)} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Max ZMW</label>
                    <input type="number" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-black text-sm" value={maxPrice} onChange={e => setMaxPrice(parseInt(e.target.value) || 1000000)} />
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Market Intelligence Sort</p>
              <div className="grid grid-cols-2 gap-2">
                 {[
                   { id: 'newest', label: 'Newest', icon: 'fa-calendar' },
                   { id: 'price-asc', label: 'Price ↑', icon: 'fa-arrow-up-wide-short' },
                   { id: 'price-desc', label: 'Price ↓', icon: 'fa-arrow-down-wide-short' },
                   { id: 'popular', label: 'Hot', icon: 'fa-fire' }
                 ].map(s => (
                   <button 
                     key={s.id}
                     onClick={() => setSortBy(s.id as any)}
                     className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${
                       sortBy === s.id ? 'bg-gray-900 text-white border-gray-900 shadow-xl' : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-200'
                     }`}
                   >
                     <i className={`fas ${s.icon}`}></i> {s.label}
                   </button>
                 ))}
              </div>
           </div>

           <div className="space-y-6">
              <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Utility Quick-Access</p>
              <div className="flex gap-4">
                 <button className="flex-grow bg-white border border-gray-100 p-4 rounded-[2rem] flex flex-col items-center justify-center hover:border-emerald-200 transition group shadow-sm">
                    <i className="fas fa-calculator text-gray-300 group-hover:text-emerald-600 mb-2"></i>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Trade Calc</span>
                 </button>
                 <button className="flex-grow bg-white border border-gray-100 p-4 rounded-[2rem] flex flex-col items-center justify-center hover:border-emerald-200 transition group shadow-sm">
                    <i className="fas fa-heart text-gray-300 group-hover:text-red-500 mb-2"></i>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">The Vault</span>
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* AI Comparison Workspace */}
      {compareList.length > 0 && (
        <div className="bg-gray-900 rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-10">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><i className="fas fa-brain-circuit text-[200px]"></i></div>
           <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
              <div className="space-y-4 max-w-xl">
                 <h3 className="text-4xl font-black tracking-tighter">AI Trade Analyst</h3>
                 <p className="text-emerald-400 font-black text-xs uppercase tracking-widest">Pro-tier comparison engine active</p>
                 <p className="text-gray-400 font-medium leading-relaxed italic">"Compare technical specs, localized value, and market potential for your selected assets."</p>
              </div>
              
              <div className="flex items-center gap-6">
                 {compareList.map(p => (
                    <div key={p.id} className="relative group">
                       <img src={p.imageUrl} className="w-24 h-24 rounded-3xl object-cover border-4 border-white/10 group-hover:scale-110 transition-transform" />
                       <button onClick={() => setCompareList(prev => prev.filter(x => x.id !== p.id))} className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-4 border-gray-900 hover:bg-red-600 transition shadow-xl"><i className="fas fa-times text-[10px]"></i></button>
                    </div>
                 ))}
                 {compareList.length < 3 && <div className="w-24 h-24 rounded-3xl border-4 border-dashed border-white/10 flex items-center justify-center text-white/20"><i className="fas fa-plus"></i></div>}
              </div>

              <div className="flex flex-col gap-4">
                 <button 
                  onClick={handleRunComparison}
                  disabled={isComparing || compareList.length < 2}
                  className="px-14 py-8 bg-emerald-600 text-white rounded-[2.5rem] font-black text-xl hover:bg-emerald-500 transition shadow-2xl disabled:opacity-30"
                 >
                   {isComparing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-bolt-lightning mr-3"></i>}
                   Run Analysis
                 </button>
                 <button onClick={() => setCompareList([])} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition text-center">Clear Selection</button>
              </div>
           </div>

           {compareResult && (
              <div className="mt-12 p-10 bg-white/5 rounded-[3.5rem] border border-white/10 animate-in fade-in zoom-in duration-1000">
                 <div className="prose prose-invert max-w-none text-gray-300 font-medium whitespace-pre-wrap leading-relaxed">
                    {compareResult}
                 </div>
              </div>
           )}
        </div>
      )}

      {/* Promoted Spotlight */}
      {promoted.length > 0 && category === 'All' && searchTerm === '' && (
        <section className="space-y-12">
          <div className="flex items-center gap-8">
            <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.8em] whitespace-nowrap">Tier 1 Spotlights</h2>
            <div className="h-px bg-emerald-100 flex-grow"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12">
            {promoted.map(p => (
              <ProductCard 
                key={p.id} 
                product={p} 
                isPromoted 
                isWishlisted={wishlist.includes(p.id)} 
                onWishlist={() => toggleWishlist(p.id)} 
                onCompare={() => addToCompare(p)}
                viewMode={viewMode}
              />
            ))}
          </div>
        </section>
      )}

      {/* Standard Listings Hub */}
      <section className="space-y-12">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-8 flex-grow">
            <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.8em] whitespace-nowrap">Global Asset Index</h2>
            <div className="h-px bg-gray-100 flex-grow"></div>
          </div>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{filteredAndSortedProducts.length} Results Identified</p>
        </div>
        
        {standard.length > 0 ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12" : "flex flex-col gap-8"}>
                {standard.map(p => (
                    <ProductCard 
                      key={p.id} 
                      product={p} 
                      isWishlisted={wishlist.includes(p.id)} 
                      onWishlist={() => toggleWishlist(p.id)} 
                      onCompare={() => addToCompare(p)}
                      viewMode={viewMode}
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-40 bg-gray-50 rounded-[5rem] border-4 border-dashed border-gray-100">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <i className="fas fa-search-minus text-gray-200 text-4xl"></i>
                </div>
                <p className="text-gray-400 font-black text-2xl tracking-tighter uppercase mb-4">No assets match your current parameters</p>
                <button onClick={() => { setSearchTerm(''); setCategory('All'); setMinPrice(0); setMaxPrice(1000000); setSelectedCity('all'); }} className="text-emerald-600 font-black text-xs uppercase tracking-widest hover:underline">Reset Platform Terminal</button>
            </div>
        )}
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
  viewMode: 'grid' | 'list'
}> = ({ product, isPromoted, isWishlisted, onWishlist, onCompare, viewMode }) => {
  const [showContact, setShowContact] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const mockRating = useMemo(() => (Math.random() * (5 - 4) + 4).toFixed(1), []);
  const mockDeals = useMemo(() => Math.floor(Math.random() * 50) + 5, []);

  const handleNativeShare = async () => {
     if (navigator.share) {
        try {
           await navigator.share({
              title: product.name,
              text: `Check out ${product.name} on Zenith ZM! Price: ZMW ${product.price}.`,
              url: window.location.href,
           });
        } catch (e) {
           console.error("Share failed", e);
        }
     } else setShowShare(true);
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row items-center gap-10 hover:shadow-2xl transition group animate-in slide-in-from-left-10">
         <div className="w-full md:w-60 h-60 rounded-[2.5rem] overflow-hidden relative shrink-0">
            <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" />
            {isPromoted && <span className="absolute top-4 left-4 bg-blue-600 text-white text-[7px] font-black px-4 py-1.5 rounded-full uppercase">PROMOTED</span>}
         </div>
         <div className="flex-grow space-y-4">
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="text-3xl font-black text-gray-900 leading-none mb-2">{product.name}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{product.category} • {product.location.address}</p>
               </div>
               <p className="text-3xl font-black text-emerald-700">ZMW {product.price.toLocaleString()}</p>
            </div>
            <p className="text-gray-400 text-sm font-medium line-clamp-2 max-w-2xl italic leading-relaxed">"{product.description}"</p>
            <div className="flex gap-4 pt-4">
               <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  <i className="fas fa-star text-orange-500 text-xs"></i>
                  <span className="text-xs font-black text-gray-900">{mockRating}</span>
                  <span className="text-[10px] text-gray-300 font-bold">({mockDeals} Sold)</span>
               </div>
               <button onClick={onCompare} className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition">Compare</button>
               <button onClick={onWishlist} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${isWishlisted ? 'bg-red-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
                  <i className={`fas fa-heart ${isWishlisted ? 'mr-2' : ''}`}></i> {isWishlisted ? 'Saved' : 'Save'}
               </button>
            </div>
         </div>
         <div className="flex flex-col gap-3">
            <button onClick={() => setShowContact(true)} className="px-12 py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition whitespace-nowrap">Acquire Asset</button>
            <button onClick={handleNativeShare} className="py-5 bg-gray-50 text-gray-400 rounded-[2rem] font-black text-xs uppercase tracking-widest border border-gray-100 hover:bg-gray-100 transition">Broadcast</button>
         </div>
         {showContact && <ContactOverlay product={product} onClose={() => setShowContact(false)} />}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[4.5rem] overflow-hidden shadow-2xl border border-gray-100 hover:shadow-[0_60px_100px_rgba(0,0,0,0.1)] transition-all group relative flex flex-col h-full border-b-[10px] border-b-transparent hover:border-b-emerald-600">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" alt={product.name} />
        <div className="absolute top-8 left-8 flex flex-col gap-4">
          {isPromoted && <span className="bg-blue-600 text-white text-[8px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-2xl border border-white/20 backdrop-blur-md">Promoted</span>}
          {product.isFeatured && <span className="bg-emerald-600 text-white text-[8px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-2xl border border-white/20 backdrop-blur-md">Featured</span>}
        </div>
        <div className="absolute top-8 right-8 flex flex-col gap-3">
           <button 
             onClick={handleNativeShare}
             className="w-12 h-12 bg-white/90 backdrop-blur-xl text-gray-900 rounded-2xl flex items-center justify-center shadow-xl hover:bg-emerald-600 hover:text-white transition"
           >
             <i className="fas fa-share-nodes"></i>
           </button>
           <button 
             onClick={onWishlist}
             className={`w-12 h-12 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-xl transition-all ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-500'}`}
           >
             <i className="fas fa-heart"></i>
           </button>
           <button 
             onClick={onCompare}
             className="w-12 h-12 bg-white/90 backdrop-blur-xl text-gray-400 rounded-2xl flex items-center justify-center shadow-xl hover:bg-emerald-600 hover:text-white transition"
           >
             <i className="fas fa-plus"></i>
           </button>
        </div>
        <div className="absolute bottom-8 right-8">
           <div className="bg-white/90 backdrop-blur-xl px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-xl border border-white">
              <i className="fas fa-star text-orange-500 text-xs"></i>
              <span className="text-xs font-black text-gray-900">{mockRating}</span>
              <span className="text-[10px] text-gray-300 font-bold">({mockDeals} Sold)</span>
           </div>
        </div>
      </div>
      <div className="p-12 flex flex-col flex-grow relative">
        <div className="mb-8">
           <h3 className="font-black text-gray-900 group-hover:text-emerald-600 transition text-3xl line-clamp-1 mb-2 tracking-tight">{product.name}</h3>
           <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">{product.category}</p>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
           </div>
           <p className="font-black text-emerald-700 text-4xl leading-none">ZMW {product.price.toLocaleString()}</p>
        </div>
        <p className="text-gray-400 text-sm font-medium line-clamp-2 mb-10 h-10 leading-relaxed italic">"{product.description}"</p>
        
        {showContact && <ContactOverlay product={product} onClose={() => setShowContact(false)} />}

        <div className="mt-auto pt-10 border-t border-gray-50 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 text-gray-900 text-[10px] font-black uppercase tracking-widest">
              <i className="fas fa-location-dot text-emerald-500"></i>
              {product.location.address}
            </div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-6">Verified Trader</p>
          </div>
          <button 
            onClick={() => setShowContact(true)}
            className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-700 transition shadow-xl group/btn"
          >
            <i className="fas fa-paper-plane group-hover:rotate-12 transition-transform"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

const ContactOverlay: React.FC<{ product: Product, onClose: () => void }> = ({ product, onClose }) => (
  <div className="absolute inset-0 bg-gray-950/95 backdrop-blur-xl z-[150] flex flex-col items-center justify-center p-12 animate-in fade-in duration-300 rounded-[4.5rem] text-white">
     <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl">
       <i className="fas fa-shield-halved text-3xl"></i>
     </div>
     <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-10 text-center">Secured Merchant Line</h4>
     <div className="grid grid-cols-2 gap-6 w-full">
        {product.contactInfo.phone && (
          <a href={`tel:${product.contactInfo.phone}`} className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-emerald-600 transition group/icon">
            <i className="fas fa-phone text-2xl"></i>
            <span className="text-[9px] font-black uppercase tracking-widest">Call</span>
          </a>
        )}
        {product.contactInfo.whatsapp && (
          <a href={`https://wa.me/${product.contactInfo.whatsapp.replace(/\D/g, '')}?text=Hi, I am interested in ${product.name}`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-green-600 transition group/icon">
            <i className="fab fa-whatsapp text-3xl"></i>
            <span className="text-[9px] font-black uppercase tracking-widest">WhatsApp</span>
          </a>
        )}
     </div>
     <button onClick={onClose} className="mt-12 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition">Dismiss Interface</button>
  </div>
);

export default Marketplace;
