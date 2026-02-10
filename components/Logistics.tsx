
import React, { useState, useEffect } from 'react';
import { fetchLogisticsIntel } from '../geminiService';

const Logistics: React.FC = () => {
  const [vehicle, setVehicle] = useState('cargo');
  const [step, setStep] = useState<'selection' | 'analysis' | 'tracking'>('selection');
  const [eta, setEta] = useState(12);
  const [origin, setOrigin] = useState('Lusaka Hub');
  const [destination, setDestination] = useState('');
  const [cargoType, setCargoType] = useState('General Goods');
  const [aiIntel, setAiIntel] = useState('');
  const [isLoadingIntel, setIsLoadingIntel] = useState(false);

  const vehicles = [
    { id: 'courier', name: 'Rapid Courier', icon: 'fa-motorcycle', price: '45.00', desc: 'Documents & Small Packs', capacity: 85 },
    { id: 'cargo', name: 'Zambia Cargo Van', icon: 'fa-truck-front', price: '185.00', desc: 'Furniture & Multi-box delivery', capacity: 42 },
    { id: 'heavy', name: 'Heavy Haul 30T', icon: 'fa-truck-moving', price: '2,450.00', desc: 'Mining gear & Machinery', capacity: 18 }
  ];

  const runAnalysis = async () => {
    if (!destination) return alert("Please specify a destination.");
    setStep('analysis');
    setIsLoadingIntel(true);
    try {
      const intel = await fetchLogisticsIntel(origin, destination, cargoType);
      setAiIntel(intel);
    } catch (e) {
      setAiIntel("Standard routing applied. Weather: Clear. Traffic: Moderate.");
    } finally {
      setIsLoadingIntel(false);
    }
  };

  useEffect(() => {
    if (step === 'tracking') {
      const interval = setInterval(() => {
        setEta(prev => Math.max(0, prev - 1));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 md:gap-10 h-full min-h-[calc(100vh-8rem)] animate-in fade-in duration-700">
      {/* Smart Map visualization */}
      <div className="flex-grow bg-[#002B19] rounded-[2.5rem] md:rounded-[4rem] border-4 md:border-8 border-white shadow-2xl overflow-hidden relative group min-h-[50vh] lg:min-h-auto">
        <img 
          src={`https://picsum.photos/seed/${destination || 'zambia'}/1400/1000`} 
          className="w-full h-full object-cover opacity-30 grayscale-[0.8] group-hover:scale-105 transition-transform duration-[6000ms]" 
          alt="Map" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#004D2D]/60 via-transparent to-transparent"></div>
        
        {/* Dynamic Telemetry HUD */}
        <div className="absolute top-6 md:top-10 left-6 md:left-10 right-6 md:right-10 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
           <div className="bg-black/40 backdrop-blur-2xl p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 flex items-center gap-4 md:gap-6 text-white shadow-2xl">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                <i className="fas fa-satellite-dish"></i>
              </div>
              <div className="hidden sm:block">
                <p className="text-[9px] md:text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">Live Ops</p>
                <p className="text-xs md:text-sm font-black">42 Units</p>
              </div>
           </div>

           <div className="bg-black/40 backdrop-blur-2xl p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 flex items-center gap-4 md:gap-6 text-white shadow-2xl">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="fas fa-cloud-bolt"></i>
              </div>
              <div className="hidden sm:block">
                <p className="text-[9px] md:text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Weather</p>
                <p className="text-xs md:text-sm font-black">Storm Alert</p>
              </div>
           </div>

           <div className="hidden md:flex bg-black/40 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/10 items-center gap-6 text-white shadow-2xl">
              <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="fas fa-road"></i>
              </div>
              <div>
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest leading-none mb-1">Road Intel</p>
                <p className="text-sm font-black">Normal</p>
              </div>
           </div>
        </div>

        {/* Tactical Overlay */}
        <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10">
           <div className="bg-black/60 backdrop-blur-3xl p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/5 text-white flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex gap-6 md:gap-10 w-full justify-between md:justify-start">
                 <div>
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2">Origin</p>
                    <p className="text-lg md:text-xl font-black">{origin}</p>
                 </div>
                 <div className="flex items-center text-white/20">
                    <i className="fas fa-chevron-right text-2xl md:text-3xl"></i>
                    <i className="fas fa-chevron-right text-2xl md:text-3xl -ml-4"></i>
                 </div>
                 <div className="text-right md:text-left">
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2">Target</p>
                    <p className="text-lg md:text-xl font-black">{destination || '---'}</p>
                 </div>
              </div>
              <div className="flex gap-4 w-full md:w-auto overflow-x-auto no-scrollbar">
                 <button className="px-6 py-3 bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/20 transition whitespace-nowrap">Satellite</button>
                 <button className="px-6 py-3 bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/20 transition whitespace-nowrap">Traffic</button>
              </div>
           </div>
        </div>

        {/* Pulse Pins */}
        {step === 'tracking' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000">
             <div className="relative">
                <div className="absolute -inset-10 bg-emerald-500/20 rounded-full animate-ping"></div>
                <div className="relative bg-white p-4 rounded-3xl shadow-[0_40px_80px_rgba(0,0,0,0.4)] border border-emerald-100 flex items-center gap-4 md:gap-6 z-10 animate-in zoom-in duration-500">
                   <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xl">
                      <i className="fas fa-truck-moving text-xl md:text-2xl"></i>
                   </div>
                   <div>
                      <p className="text-[8px] font-black text-emerald-900 uppercase tracking-widest">ZM-VEO-991</p>
                      <p className="text-xs md:text-sm font-black text-gray-900">In Transit: {eta} mins remaining</p>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Controller Interface */}
      <div className="w-full lg:w-[480px] bg-white rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-12 shadow-2xl border border-gray-50 flex flex-col gap-8 md:gap-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <i className="fas fa-microscope text-[150px]"></i>
        </div>

        <header>
          <div className="flex items-center gap-4 mb-3">
             <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <i className="fas fa-robot"></i>
             </div>
             <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter">Smart Logistics</h2>
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">AI-Driven Freight Controller</p>
        </header>

        {step === 'selection' && (
          <div className="flex-grow flex flex-col gap-6 md:gap-8 animate-in slide-in-from-right-10 duration-500">
             <div className="space-y-6">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Destination Sector</label>
                   <input 
                    type="text" 
                    placeholder="Enter Town or Hub (e.g., Ndola)" 
                    className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 font-black text-gray-900 outline-none focus:ring-4 focus:ring-emerald-100 transition shadow-inner"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                   />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cargo Classification</label>
                   <select 
                    className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 font-black text-gray-900 outline-none focus:ring-4 focus:ring-emerald-100 transition appearance-none cursor-pointer"
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value)}
                   >
                     <option>General Goods</option>
                     <option>Industrial Machinery</option>
                     <option>Agricultural Produce</option>
                     <option>Perishables (Cold Chain)</option>
                     <option>Hazardous Mining Material</option>
                   </select>
                </div>
             </div>

             <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fleet Selection</p>
                {vehicles.map(v => (
                  <button 
                    key={v.id}
                    onClick={() => setVehicle(v.id)}
                    className={`w-full flex items-center p-4 md:p-6 rounded-[2.5rem] border-2 transition-all group ${
                      vehicle === v.id ? 'bg-emerald-600 border-emerald-400 shadow-2xl scale-[1.02]' : 'bg-white border-gray-50 hover:border-emerald-100'
                    }`}
                  >
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mr-4 md:mr-6 shadow-sm transition-colors ${
                      vehicle === v.id ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      <i className={`fas ${v.icon} text-xl md:text-2xl`}></i>
                    </div>
                    <div className="flex-grow text-left">
                      <p className={`font-black uppercase tracking-wider text-xs ${vehicle === v.id ? 'text-white' : 'text-gray-900'}`}>{v.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                         <div className={`h-1.5 w-16 md:w-20 rounded-full ${vehicle === v.id ? 'bg-white/20' : 'bg-gray-100'} overflow-hidden`}>
                            <div className={`h-full ${vehicle === v.id ? 'bg-white' : 'bg-emerald-500'} transition-all`} style={{ width: `${v.capacity}%` }}></div>
                         </div>
                         <p className={`text-[8px] font-black ${vehicle === v.id ? 'text-emerald-100' : 'text-gray-400'}`}>{v.capacity}% LOAD</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg md:text-xl font-black leading-none ${vehicle === v.id ? 'text-white' : 'text-emerald-900'}`}>ZMW {v.price}</p>
                    </div>
                  </button>
                ))}
             </div>

             <button 
              onClick={runAnalysis}
              className="mt-auto w-full py-6 bg-gray-950 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition shadow-2xl flex items-center justify-center gap-4 group"
             >
               <i className="fas fa-brain-circuit text-emerald-500"></i>
               Analyze Route Intelligence
             </button>
          </div>
        )}

        {step === 'analysis' && (
          <div className="flex-grow flex flex-col gap-8 animate-in slide-in-from-right-10 duration-500">
             <div className="bg-emerald-950 rounded-[3rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl min-h-[300px] md:min-h-[350px]">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <i className="fas fa-robot text-8xl"></i>
                </div>
                {isLoadingIntel ? (
                  <div className="flex flex-col items-center justify-center h-full gap-6">
                     <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 animate-pulse">Scanning Satellite Intel...</p>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in duration-700">
                     <h3 className="text-2xl font-black text-emerald-400 flex items-center gap-4">
                        <i className="fas fa-shield-check"></i> Analysis Complete
                     </h3>
                     <div className="prose prose-invert prose-sm">
                        <p className="text-emerald-50/80 font-medium leading-relaxed italic whitespace-pre-wrap">{aiIntel}</p>
                     </div>
                  </div>
                )}
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Estimated Delay</p>
                   <p className="text-xl md:text-2xl font-black text-gray-900">+14 Mins</p>
                </div>
                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                   <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest mb-1">Route Safety</p>
                   <p className="text-xl md:text-2xl font-black text-emerald-600">98% Score</p>
                </div>
             </div>

             <div className="mt-auto space-y-4">
                <button 
                  onClick={() => setStep('tracking')}
                  className="w-full py-6 md:py-8 bg-emerald-600 text-white rounded-[2.5rem] font-black text-lg md:text-xl shadow-2xl hover:bg-emerald-700 transition"
                >
                  Deploy Transit Unit
                </button>
                <button 
                  onClick={() => setStep('selection')}
                  className="w-full py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition"
                >
                  Return to Fleet Selection
                </button>
             </div>
          </div>
        )}

        {step === 'tracking' && (
          <div className="flex-grow flex flex-col justify-between py-6 animate-in slide-in-from-right-10 duration-500">
             <div className="text-center space-y-8">
                <div className="relative inline-block">
                   <div className="absolute inset-[-20px] bg-emerald-100 rounded-full animate-pulse"></div>
                   <div className="relative w-32 h-32 md:w-36 md:h-36 bg-white rounded-full flex items-center justify-center mx-auto border-8 border-emerald-600 shadow-2xl">
                     <p className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">{eta}</p>
                   </div>
                   <p className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl">MINS TO HUB</p>
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl md:text-3xl font-black text-gray-900">Vehicle Intercept</h3>
                   <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">Merchant Protocol: ACTIVE</p>
                </div>
             </div>
             
             <div className="bg-gray-900 p-8 md:p-10 rounded-[3rem] text-white space-y-8 shadow-2xl">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-xl border border-white/10"><i className="fas fa-id-card text-2xl"></i></div>
                   <div>
                     <p className="font-black text-lg">Mutale Phiri</p>
                     <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Operator Code: AMC-882</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <button className="flex-grow py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition">Communicate</button>
                   <button className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 text-white hover:bg-white/20 transition"><i className="fas fa-phone"></i></button>
                </div>
             </div>

             <button 
              onClick={() => setStep('selection')}
              className="w-full py-6 text-red-500 font-black text-xs uppercase tracking-[0.4em] hover:bg-red-50 rounded-full transition mt-6"
             >
               Abort Deployment
             </button>
          </div>
        )}

        <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">System Health: Nominal</p>
           </div>
           <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">© 2025 Zenith Systems</p>
        </div>
      </div>
    </div>
  );
};

export default Logistics;
