import React, { useState } from 'react';
import { ZambianProvince } from '../types.ts';
import { marketSearch } from '../geminiService.ts';

const ZAMBIA_PROVINCES: ZambianProvince[] = [
  { name: 'Central', capital: 'Kabwe', districts: ['Kabwe', 'Chibombo', 'Kushi', 'Mkushi', 'Mumbwa', 'Serenje'], population: '1.5M', majorIndustries: ['Mining', 'Agriculture'] },
  { name: 'Copperbelt', capital: 'Ndola', districts: ['Ndola', 'Kitwe', 'Chingola', 'Mufulira', 'Luanshya', 'Kalulushi'], population: '2.5M', majorIndustries: ['Copper Mining', 'Manufacturing'] },
  { name: 'Eastern', capital: 'Chipata', districts: ['Chipata', 'Lundazi', 'Petauke', 'Nyimba', 'Katete'], population: '1.8M', majorIndustries: ['Agriculture', 'Tourism'] },
  { name: 'Luapula', capital: 'Mansa', districts: ['Mansa', 'Samfya', 'Kawambwa', 'Mwense', 'Nchelenge'], population: '1.2M', majorIndustries: ['Fishing', 'Agriculture'] },
  { name: 'Lusaka', capital: 'Lusaka', districts: ['Lusaka', 'Chilanga', 'Chongwe', 'Kafue', 'Luangwa'], population: '3.3M', majorIndustries: ['Commerce', 'Finance', 'Manufacturing'] },
  { name: 'Muchinga', capital: 'Chinsali', districts: ['Chinsali', 'Isoka', 'Mpika', 'Nakonde', 'Mafinga'], population: '1.0M', majorIndustries: ['Agriculture', 'Cross-border Trade'] },
  { name: 'Northern', capital: 'Kasama', districts: ['Kasama', 'Mbala', 'Mpulungu', 'Luwingu', 'Mungwi'], population: '1.4M', majorIndustries: ['Agriculture', 'Fishing'] },
  { name: 'North-Western', capital: 'Solwezi', districts: ['Solwezi', 'Kasempa', 'Mwinilunga', 'Zambezi', 'Kabompo'], population: '1.0M', majorIndustries: ['Mining', 'Honey Production'] },
  { name: 'Southern', capital: 'Choma', districts: ['Choma', 'Livingstone', 'Mazabuka', 'Monze', 'Namwala'], population: '1.9M', majorIndustries: ['Tourism', 'Agriculture', 'Energy'] },
  { name: 'Western', capital: 'Mongu', districts: ['Mongu', 'Senanga', 'Sesheke', 'Kaoma', 'Shangombo'], population: '1.1M', majorIndustries: ['Cattle', 'Rice Production'] },
];

const TerritoryExplorer: React.FC = () => {
  const [selectedProvince, setSelectedProvince] = useState<ZambianProvince | null>(null);
  const [intel, setIntel] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchMarketIntel = async (province: string) => {
    setLoading(true);
    setIntel('');
    try {
      const res = await marketSearch(`What are the trending business opportunities and market demands in ${province} Province, Zambia for 2024?`);
      setIntel(res.text);
    } catch (e) {
      setIntel("Intelligence currently unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {ZAMBIA_PROVINCES.map(p => (
          <button 
            key={p.name}
            onClick={() => {
              setSelectedProvince(p);
              fetchMarketIntel(p.name);
            }}
            className={`p-8 rounded-[2.5rem] border-2 transition-all text-left group overflow-hidden relative ${
              selectedProvince?.name === p.name ? 'bg-emerald-600 border-emerald-400 shadow-2xl scale-105' : 'bg-white border-gray-100 hover:border-emerald-200 shadow-sm'
            }`}
          >
            <div className={`absolute top-0 right-0 w-20 h-20 blur-2xl -translate-y-1/2 translate-x-1/2 transition-colors ${
              selectedProvince?.name === p.name ? 'bg-white/20' : 'bg-emerald-50'
            }`}></div>
            <h3 className={`text-xl font-black mb-1 transition-colors ${selectedProvince?.name === p.name ? 'text-white' : 'text-gray-900'}`}>
              {p.name}
            </h3>
            <p className={`text-[10px] font-black uppercase tracking-widest ${selectedProvince?.name === p.name ? 'text-emerald-100' : 'text-emerald-600'}`}>
              Capital: {p.capital}
            </p>
            <div className="mt-4 flex flex-wrap gap-1">
               {p.majorIndustries.map(ind => (
                 <span key={ind} className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${
                   selectedProvince?.name === p.name ? 'bg-white/10 text-white' : 'bg-gray-50 text-gray-400'
                 }`}>{ind}</span>
               ))}
            </div>
          </button>
        ))}
      </div>

      {selectedProvince && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in slide-in-from-bottom-10">
          <div className="lg:col-span-1 bg-white p-10 rounded-[3.5rem] shadow-2xl border border-gray-100">
            <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-4">
              <i className="fas fa-map-location-dot text-emerald-600"></i>
              {selectedProvince.name} Districts
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {selectedProvince.districts.map(d => (
                <div key={d} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-emerald-50 transition-colors">
                  <p className="font-black text-gray-900 text-sm group-hover:text-emerald-700">{d}</p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">District Area</p>
                </div>
              ))}
            </div>
            <div className="mt-10 pt-10 border-t border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Demographics</p>
              <div className="flex justify-between items-center bg-emerald-950 p-6 rounded-3xl text-white">
                 <div>
                   <p className="text-2xl font-black">{selectedProvince.population}</p>
                   <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Est. Population</p>
                 </div>
                 <i className="fas fa-users text-3xl opacity-20"></i>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-gray-900 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-[100px]"></div>
             <h3 className="text-2xl font-black mb-8 flex items-center gap-4">
               <i className="fas fa-brain text-emerald-500"></i>
               Territory Intelligence (Gemini)
             </h3>
             {loading ? (
               <div className="flex flex-col items-center justify-center py-20 gap-6">
                 <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-emerald-500 font-black uppercase tracking-[0.3em] text-xs">Scanning Zambian Markets...</p>
               </div>
             ) : (
               <div className="prose prose-invert max-w-none">
                 <p className="text-gray-300 leading-relaxed font-medium text-lg italic whitespace-pre-wrap">
                   {intel || "Select a province to view real-time market sentiment."}
                 </p>
               </div>
             )}
             <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Governance by Abel Mulenga Chinanda</p>
                <button className="px-6 py-2 bg-emerald-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition">Download Brief</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TerritoryExplorer;