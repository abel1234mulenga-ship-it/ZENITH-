
import React, { useState, useEffect } from 'react';
import { backendService } from '../backendService';
import { Place } from '../types';

const CityNavigator: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePlace, setActivePlace] = useState<Place | null>(null);
  const [results, setResults] = useState<Place[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'info' | 'directory' | 'rental'>('info');

  const handleSearch = async (customQuery?: string, category?: string) => {
    const q = customQuery || query;
    if (!q && !category) return;
    
    setLoading(true);
    setResults([]);
    setActivePlace(null);
    setError(null);

    const response = await backendService.fetchPlaces(q, category);

    if (response.status === 'success' && response.data) {
      setResults(response.data);
    } else {
      setError(response.message || 'Failed to locate places.');
    }
    setLoading(false);
  };

  const quickCategories = [
    { label: 'Restaurants', icon: 'fa-utensils', cat: 'Restaurant' },
    { label: 'Shopping', icon: 'fa-bag-shopping', cat: 'Mall' },
    { label: 'Hotels', icon: 'fa-hotel', cat: 'Hotel' },
    { label: 'Banks', icon: 'fa-building-columns', cat: 'Bank' },
    { label: 'Events', icon: 'fa-calendar-star', cat: 'Event' }
  ];

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 md:gap-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
               <i className="fas fa-map-location-dot text-xl md:text-2xl"></i>
             </div>
             <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none">City Navigator</h1>
          </div>
          <p className="text-gray-500 font-bold text-sm md:text-lg leading-relaxed">Spatial intelligence for every street, building, and plaza in urban Zambia.</p>
        </div>
        <div className="w-full lg:w-[550px] space-y-4">
          <div className="flex bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-gray-100 px-6 py-4 md:px-8 md:py-5 focus-within:ring-4 md:focus-within:ring-8 focus-within:ring-emerald-50 transition-all group">
            <i className="fas fa-search-location text-emerald-500 self-center mr-4 md:mr-6 text-xl"></i>
            <input 
              type="text" 
              placeholder="Search Cairo Road, Manda Hill..."
              className="bg-transparent outline-none w-full text-base md:text-lg font-bold placeholder:text-gray-300"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={() => handleSearch()} className="ml-2 md:ml-4 bg-emerald-600 text-white px-4 py-2 md:px-6 md:py-2 rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition">Scan</button>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {quickCategories.map(cat => (
              <button 
                key={cat.label}
                onClick={() => { setQuery(''); handleSearch('', cat.cat); }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition shadow-sm whitespace-nowrap"
              >
                <i className={`fas ${cat.icon}`}></i> {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
        {/* List of found assets */}
        <div className="lg:col-span-4 space-y-4 md:space-y-6 order-2 lg:order-1">
          <div className="flex items-center justify-between px-2 md:px-4">
             <h3 className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Zambian Real Estate Map</h3>
             {loading && <i className="fas fa-satellite fa-spin text-emerald-600"></i>}
          </div>
          
          <div className="space-y-4 max-h-[50vh] lg:max-h-[75vh] overflow-y-auto pr-2 md:pr-4 no-scrollbar">
            {results.map((place, idx) => (
              <button 
                key={place.id || idx}
                onClick={() => setActivePlace(place)}
                className={`w-full text-left p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border-2 transition-all relative overflow-hidden group ${
                  activePlace?.id === place.id ? 'bg-emerald-600 border-emerald-400 shadow-2xl scale-[1.02]' : 'bg-white border-gray-100 hover:border-emerald-100 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4 md:gap-5">
                   <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-colors ${
                     activePlace?.id === place.id ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                   }`}>
                     <i className={`fas ${place.category.toLowerCase().includes('mall') ? 'fa-bag-shopping' : 'fa-building'} text-lg md:text-xl`}></i>
                   </div>
                   <div className="flex-grow">
                      <p className={`font-black text-xs md:text-sm leading-tight mb-1 ${activePlace?.id === place.id ? 'text-white' : 'text-gray-900'}`}>{place.title}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${activePlace?.id === place.id ? 'text-emerald-100' : 'text-gray-400'}`}>{place.category}</span>
                        {place.verified && (
                          <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${activePlace?.id === place.id ? 'text-emerald-100' : 'text-blue-500'}`}>Verified</span>
                        )}
                        <div className="flex text-[8px] text-yellow-400">
                           <i className="fas fa-star"></i><span className="ml-1 font-bold text-white">{place.rating.toFixed(1)}</span>
                        </div>
                      </div>
                   </div>
                </div>
              </button>
            ))}
            
            {results.length === 0 && !loading && !error && (
              <div className="text-center py-16 md:py-20 bg-gray-50 rounded-[2.5rem] md:rounded-[3rem] border-2 border-dashed border-gray-100 opacity-40">
                 <i className="fas fa-radar text-3xl md:text-4xl mb-4 text-emerald-600"></i>
                 <p className="text-[10px] md:text-xs font-black uppercase tracking-widest">Awaiting spatial scan</p>
              </div>
            )}

            {error && (
              <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100 text-center">
                <p className="text-red-500 font-bold text-xs">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Building Profile */}
        <div className="lg:col-span-8 space-y-6 md:space-y-10 order-1 lg:order-2">
           {activePlace ? (
             <div className="space-y-6 md:space-y-8 animate-in slide-in-from-right-10 duration-500">
                {/* Visual Header */}
                <div className="bg-emerald-950 rounded-[3rem] md:rounded-[4rem] h-[250px] md:h-[350px] relative overflow-hidden shadow-2xl group border-4 md:border-8 border-white">
                   <img src={activePlace.image} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[4000ms]" />
                   <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 to-transparent"></div>
                   <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 flex items-center gap-6 md:gap-8">
                      <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-2xl md:rounded-[2rem] flex items-center justify-center text-emerald-600 text-3xl md:text-4xl shadow-2xl">
                        <i className="fas fa-location-dot"></i>
                      </div>
                      <div className="text-white">
                         <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-none">{activePlace.title}</h2>
                         <div className="flex items-center gap-3 mt-2">
                            {activePlace.isOpen && <p className="text-emerald-400 font-black uppercase tracking-[0.3em] text-[8px] md:text-[10px]">Open Now</p>}
                            <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                            <div className="flex text-yellow-400 text-xs">
                               <i className="fas fa-star"></i><span className="ml-1">{activePlace.rating.toFixed(1)}</span>
                            </div>
                            <span className="text-white/60 text-[9px] font-bold">({activePlace.reviews} Reviews)</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Sub-navigation */}
                <div className="flex bg-white p-2 rounded-3xl shadow-xl border border-gray-100 overflow-x-auto no-scrollbar">
                   {[
                     { id: 'info', label: 'Building Intel', icon: 'fa-info-circle' },
                     { id: 'directory', label: 'Tenants', icon: 'fa-list-check' },
                     { id: 'rental', label: 'Availability', icon: 'fa-door-open' }
                   ].map(tab => (
                     <button 
                       key={tab.id}
                       onClick={() => setViewMode(tab.id as any)}
                       className={`flex-grow px-4 md:px-8 py-3 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 md:gap-3 whitespace-nowrap ${
                         viewMode === tab.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'
                       }`}
                     >
                       <i className={`fas ${tab.icon}`}></i> {tab.label}
                     </button>
                   ))}
                </div>

                {/* Content Area */}
                <div className="bg-white p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] shadow-2xl border border-gray-100 min-h-[300px] md:min-h-[400px]">
                   <div className="animate-in fade-in duration-700">
                      {viewMode === 'info' && (
                        <div className="space-y-6 md:space-y-8">
                           <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                             <i className="fas fa-microscope text-emerald-600"></i> Physical Profile
                           </h3>
                           <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed font-medium italic text-sm md:text-base">
                              <p className="whitespace-pre-wrap">{activePlace.description || `AI Intelligence: ${activePlace.title} is a key ${activePlace.category} destination in ${activePlace.location.city}. It serves as a major commercial hub.`}</p>
                           </div>
                           <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Coordinates</p>
                              <p className="font-mono font-bold text-gray-800">{activePlace.location.lat}, {activePlace.location.lng}</p>
                           </div>
                        </div>
                      )}
                      {viewMode === 'directory' && (
                        <div className="space-y-6 md:space-y-8">
                           <h3 className="text-2xl md:text-3xl font-black text-emerald-700 tracking-tight flex items-center gap-4">
                             <i className="fas fa-users-viewfinder"></i> Directory
                           </h3>
                           <div className="p-10 text-center text-gray-400 bg-gray-50 rounded-[2rem]">
                              <i className="fas fa-layer-group text-3xl mb-4"></i>
                              <p className="text-xs font-bold uppercase tracking-widest">Fetch Directory data from Admin Panel.</p>
                           </div>
                        </div>
                      )}
                      {viewMode === 'rental' && (
                        <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center space-y-6">
                           <div className="w-20 h-20 md:w-24 md:h-24 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 text-3xl md:text-4xl border border-orange-100">
                              <i className="fas fa-key"></i>
                           </div>
                           <div>
                              <h3 className="text-xl md:text-2xl font-black text-gray-900">Rental Market Inquiry</h3>
                              <p className="text-gray-500 font-bold mt-2 text-sm">Connect with a Zambian commercial realtor for this building.</p>
                           </div>
                           <button className="px-8 py-4 md:px-10 md:py-5 bg-orange-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-orange-600 transition">Contact Property Manager</button>
                        </div>
                      )}
                   </div>
                </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-full min-h-[400px] md:min-h-[600px] bg-white rounded-[3rem] md:rounded-[5rem] border-2 border-dashed border-gray-100 text-center p-12 md:p-20 opacity-30">
                <i className="fas fa-city text-6xl md:text-8xl mb-6 md:mb-8 text-emerald-600"></i>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900">Zambian Skyline Intelligence</h2>
                <p className="text-gray-500 font-bold max-w-md mx-auto mt-4 text-sm md:text-base">Select a building from the scanner results to unlock deep urban analytics and tenant directories.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CityNavigator;
