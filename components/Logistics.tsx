
import React, { useState, useEffect } from 'react';

const Logistics: React.FC = () => {
  const [vehicle, setVehicle] = useState('cargo');
  const [step, setStep] = useState<'selection' | 'tracking'>('selection');
  const [eta, setEta] = useState(12);

  const hubs = [
    { name: 'Lusaka Soweto Hub', city: 'Lusaka' },
    { name: 'Copperbelt Industrial Park', city: 'Ndola' },
    { name: 'Livingstone Logistics Point', city: 'Livingstone' }
  ];

  const vehicles = [
    { id: 'courier', name: 'Rapid Courier', icon: 'fa-motorcycle', price: '45.00', desc: 'Documents & Small Packs' },
    { id: 'cargo', name: 'Zambia Cargo Van', icon: 'fa-truck-front', price: '185.00', desc: 'Furniture & Multi-box delivery' },
    { id: 'heavy', name: 'Heavy Haul 30T', icon: 'fa-truck-moving', price: '2,450.00', desc: 'Mining gear & Machinery' }
  ];

  useEffect(() => {
    if (step === 'tracking') {
      const interval = setInterval(() => {
        setEta(prev => Math.max(0, prev - 1));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <div className="flex flex-col lg:flex-row gap-10 h-[calc(100vh-12rem)] animate-in fade-in duration-700">
      {/* Map visualization - Zambian Themed */}
      <div className="flex-grow bg-emerald-50 rounded-[4rem] border-8 border-white shadow-2xl overflow-hidden relative group">
        <img 
          src="https://picsum.photos/seed/zambia-map/1400/1000" 
          className="w-full h-full object-cover opacity-60 grayscale-[0.2] group-hover:scale-105 transition-transform duration-[4000ms]" 
          alt="Map" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent"></div>
        
        {/* Floating Ticker */}
        <div className="absolute top-10 left-10 right-10 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border border-white flex items-center gap-6">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse">
                <i className="fas fa-satellite-dish"></i>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Live Ops Zambia</p>
                <p className="text-sm font-black text-gray-900">42 Vehicles active in Central Province</p>
              </div>
           </div>
           
           <div className="flex bg-white/90 backdrop-blur-xl p-2 rounded-full shadow-2xl border border-white">
              {['Lusaka', 'Ndola', 'Kitwe'].map(city => (
                <button key={city} className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-emerald-600 transition">{city}</button>
              ))}
           </div>
        </div>

        {/* Dynamic Tracking Pin */}
        <div className="absolute transition-all duration-1000" style={{ top: '60%', left: '50%' }}>
           <div className="flex flex-col items-center">
              <div className="bg-white p-3 rounded-2xl shadow-2xl border border-emerald-100 mb-2 whitespace-nowrap animate-bounce">
                <p className="text-[8px] font-black text-emerald-900 uppercase">ZM-TRUCK-882</p>
                <p className="text-[10px] font-bold text-gray-500">In Transit (12km/h)</p>
              </div>
              <div className="w-16 h-16 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl border-4 border-white ring-8 ring-emerald-500/10">
                <i className="fas fa-truck-moving text-2xl"></i>
              </div>
           </div>
        </div>
      </div>

      {/* Control Module */}
      <div className="w-full lg:w-[450px] bg-white rounded-[4rem] p-10 shadow-2xl border border-gray-100 flex flex-col gap-10">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none">Logistics ZM</h2>
          <p className="text-gray-500 font-bold mt-4 flex items-center gap-3">
            Official partner for Zambian commercial transport.
          </p>
        </div>

        {step === 'selection' ? (
          <>
            <div className="flex-grow space-y-4 overflow-y-auto scrollbar-hide">
              {vehicles.map(v => (
                <button 
                  key={v.id}
                  onClick={() => setVehicle(v.id)}
                  className={`w-full flex items-center p-6 rounded-[2rem] border-4 transition-all ${
                    vehicle === v.id ? 'bg-emerald-600 border-emerald-600 shadow-2xl scale-[1.02]' : 'bg-gray-50 border-transparent hover:border-emerald-100'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-6 shadow-sm transition-colors ${
                    vehicle === v.id ? 'bg-white/20 text-white' : 'bg-white text-emerald-600'
                  }`}>
                    <i className={`fas ${v.icon} text-2xl`}></i>
                  </div>
                  <div className="flex-grow text-left">
                    <p className={`font-black uppercase tracking-wider text-xs ${vehicle === v.id ? 'text-white' : 'text-gray-900'}`}>{v.name}</p>
                    <p className={`text-[10px] font-bold mt-1 ${vehicle === v.id ? 'text-emerald-100' : 'text-gray-400'}`}>{v.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-black leading-none ${vehicle === v.id ? 'text-white' : 'text-emerald-900'}`}>ZMW {v.price}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-6">
               <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <i className="fas fa-shield-check"></i> Transit Insurance
                  </p>
                  <p className="text-xs text-emerald-600/80 font-bold italic leading-relaxed">Coverage up to ZMW 25,000 included for all intra-province hauls.</p>
               </div>
               <button 
                onClick={() => setStep('tracking')}
                className="w-full py-6 bg-gray-900 text-white rounded-[2.5rem] font-black text-xl hover:bg-emerald-600 transition shadow-2xl flex items-center justify-center gap-4 group"
               >
                 <span>Confirm Route</span>
                 <i className="fas fa-arrow-right text-sm group-hover:translate-x-2 transition-transform"></i>
               </button>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col justify-between py-10 animate-in slide-in-from-right-10">
             <div className="text-center space-y-6">
                <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-10 border-4 border-emerald-100">
                  <p className="text-4xl font-black text-emerald-600">{eta}</p>
                </div>
                <h3 className="text-3xl font-black text-gray-900">Vehicle Approaching</h3>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Merchant Pickup in Lusaka Hub</p>
             </div>
             
             <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600"><i className="fas fa-user-shield text-2xl"></i></div>
                <div>
                  <p className="font-black text-gray-900">Mutale Phiri</p>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Verified 5-Star Driver</p>
                </div>
                <button className="ml-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-emerald-600"><i className="fas fa-phone"></i></button>
             </div>

             <button 
              onClick={() => setStep('selection')}
              className="w-full py-6 bg-red-50 text-red-600 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white transition"
             >
               Cancel Request
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logistics;
