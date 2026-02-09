
import React, { useState, useEffect } from 'react';
import { mapsQuery, fetchNearbyBusinesses } from '../geminiService';

const CityNavigator: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePlace, setActivePlace] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [brief, setBrief] = useState<string>('');
  const [nearby, setNearby] = useState<string>('');
  const [isBriefing, setIsBriefing] = useState(false);
  const [viewMode, setViewMode] = useState<'info' | 'directory' | 'rental'>('info');

  const handleSearch = async (customQuery?: string) => {
    const q = customQuery || query;
    if (!q) return;
    setLoading(true);
    setResults([]);
    setActivePlace(null);
    try {
      const coords = { lat: -15.4167, lng: 28.2833 };
      const res = await mapsQuery(`Find specific commercial buildings, plazas, and office towers like ${q} in Zambia.`, coords);
      setResults(res.sources);
      setBrief(res.text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const explorePlace = async (place: any) => {
    setActivePlace(place);
    setIsBriefing(true);
    setNearby('');
    setViewMode('info');
    try {
      const res = await mapsQuery(`Identify the exact building type, number of floors, and primary use for ${place.maps?.title}.`, { lat: -15.4167, lng: 28.2833 });
      setBrief(res.text);
      
      const nearbyRes = await fetchNearbyBusinesses(place.maps?.title);
      setNearby(nearbyRes);
    } catch (e) {
      console.error(e);
    } finally {
      setIsBriefing(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row justify-between items-end gap-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
               <i className="fas fa-map-location-dot"></i>
             </div>
             <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">City Navigator</h1>
          </div>
          <p className="text-gray-500 font-bold text-lg leading-relaxed">Spatial intelligence for every street, building, and plaza in urban Zambia.</p>
        </div>
        <div className="flex bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 px-8 py-5 w-full md:w-[550px] focus-within:ring-8 focus-within:ring-emerald-50 transition-all group">
          <i className="fas fa-search-location text-emerald-500 self-center mr-6 text-xl"></i>
          <input 
            type="text" 
            placeholder="Search Cairo Road, FINDECO, Manda Hill..."
            className="bg-transparent outline-none w-full text-lg font-bold placeholder:text-gray-300"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={() => handleSearch()} className="ml-4 bg-emerald-600 text-white px-6 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition">Scan</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: List of found assets */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between px-4">
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Zambian Real Estate Map</h3>
             {loading && <i className="fas fa-satellite fa-spin text-emerald-600"></i>}
          </div>
          
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-4 no-scrollbar">
            {results.map((item, idx) => (
              <button 
                key={idx}
                onClick={() => explorePlace(item)}
                className={`w-full text-left p-6 rounded-[2.5rem] border-2 transition-all relative overflow-hidden group ${
                  activePlace === item ? 'bg-emerald-600 border-emerald-400 shadow-2xl scale-[1.02]' : 'bg-white border-gray-100 hover:border-emerald-100 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-5">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                     activePlace === item ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                   }`}>
                     <i className={`fas ${item.maps?.title?.toLowerCase().includes('mall') ? 'fa-bag-shopping' : 'fa-building'} text-xl`}></i>
                   </div>
                   <div className="flex-grow">
                      <p className={`font-black text-sm leading-tight mb-1 ${activePlace === item ? 'text-white' : 'text-gray-900'}`}>{item.maps?.title}</p>
                      <p className={`text-[9px] font-black uppercase tracking-widest ${activePlace === item ? 'text-emerald-100' : 'text-gray-400'}`}>Verified Registry Asset</p>
                   </div>
                </div>
              </button>
            ))}
            
            {results.length === 0 && !loading && (
              <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 opacity-40">
                 <i className="fas fa-radar text-4xl mb-4 text-emerald-600"></i>
                 <p className="text-xs font-black uppercase tracking-widest">Awaiting spatial scan</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Building Profile */}
        <div className="lg:col-span-8 space-y-10">
           {activePlace ? (
             <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
                {/* Visual Header */}
                <div className="bg-emerald-950 rounded-[4rem] h-[350px] relative overflow-hidden shadow-2xl group border-8 border-white">
                   <img src={`https://picsum.photos/seed/${activePlace.maps?.title}/1200/600`} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[4000ms]" />
                   <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 to-transparent"></div>
                   <div className="absolute bottom-10 left-10 flex items-center gap-8">
                      <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-emerald-600 text-4xl shadow-2xl">
                        <i className="fas fa-location-dot"></i>
                      </div>
                      <div className="text-white">
                         <h2 className="text-4xl font-black tracking-tight">{activePlace.maps?.title}</h2>
                         <p className="text-emerald-400 font-black uppercase tracking-[0.3em] text-[10px] mt-1">Zambian Urban Sector</p>
                      </div>
                   </div>
                   <div className="absolute top-10 right-10">
                      <a href={activePlace.maps?.uri} target="_blank" rel="noreferrer" className="bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition flex items-center gap-3">
                        <i className="fas fa-satellite"></i> Satellite Grid View
                      </a>
                   </div>
                </div>

                {/* Sub-navigation */}
                <div className="flex bg-white p-2 rounded-3xl shadow-xl border border-gray-100 overflow-x-auto scrollbar-hide">
                   {[
                     { id: 'info', label: 'Building Intel', icon: 'fa-info-circle' },
                     { id: 'directory', label: 'Tenant Directory', icon: 'fa-list-check' },
                     { id: 'rental', label: 'Rental Availability', icon: 'fa-door-open' }
                   ].map(tab => (
                     <button 
                       key={tab.id}
                       onClick={() => setViewMode(tab.id as any)}
                       className={`flex-grow px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 whitespace-nowrap ${
                         viewMode === tab.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'
                       }`}
                     >
                       <i className={`fas ${tab.icon}`}></i> {tab.label}
                     </button>
                   ))}
                </div>

                {/* Content Area */}
                <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-100 min-h-[400px]">
                   {isBriefing ? (
                     <div className="flex flex-col items-center justify-center py-24 space-y-6">
                        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-emerald-600 font-black uppercase tracking-[0.4em] text-[10px]">Processing Spatial Intelligence...</p>
                     </div>
                   ) : (
                     <div className="animate-in fade-in duration-700">
                        {viewMode === 'info' && (
                          <div className="space-y-8">
                             <h3 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                               <i className="fas fa-microscope text-emerald-600"></i> Physical Profile
                             </h3>
                             <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed font-medium italic">
                                <p className="whitespace-pre-wrap">{brief}</p>
                             </div>
                          </div>
                        )}
                        {viewMode === 'directory' && (
                          <div className="space-y-8">
                             <h3 className="text-3xl font-black text-emerald-700 tracking-tight flex items-center gap-4">
                               <i className="fas fa-users-viewfinder"></i> Verified Tenants
                             </h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {nearby ? (
                                  nearby.split('\n').filter(l => l.trim()).map((tenant, i) => (
                                    <div key={i} className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-center gap-4">
                                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><i className="fas fa-store"></i></div>
                                       <p className="font-black text-gray-800 text-sm">{tenant.replace(/^[0-9.-]+\s*/, '')}</p>
                                    </div>
                                  ))
                                ) : <p className="text-gray-400 font-bold italic">No tenant data available for this sector.</p>}
                             </div>
                          </div>
                        )}
                        {viewMode === 'rental' && (
                          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                             <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 text-4xl border border-orange-100">
                                <i className="fas fa-key"></i>
                             </div>
                             <div>
                                <h3 className="text-2xl font-black text-gray-900">Rental Market Inquiry</h3>
                                <p className="text-gray-500 font-bold mt-2">Connect with a Zambian commercial realtor for this building.</p>
                             </div>
                             <button className="px-10 py-5 bg-orange-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-orange-600 transition">Contact Property Manager</button>
                          </div>
                        )}
                     </div>
                   )}
                </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-full min-h-[600px] bg-white rounded-[5rem] border-2 border-dashed border-gray-100 text-center p-20 opacity-30">
                <i className="fas fa-city text-8xl mb-8 text-emerald-600"></i>
                <h2 className="text-4xl font-black tracking-tighter text-gray-900">Zambian Skyline Intelligence</h2>
                <p className="text-gray-500 font-bold max-w-md mx-auto mt-4">Select a building from the scanner results to unlock deep urban analytics and tenant directories.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CityNavigator;
