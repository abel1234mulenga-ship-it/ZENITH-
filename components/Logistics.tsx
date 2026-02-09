
import React, { useState, useEffect } from 'react';

const Logistics: React.FC = () => {
  const [vehicle, setVehicle] = useState('van');
  const [activeTab, setActiveTab] = useState<'request' | 'live'>('request');
  const [livePos, setLivePos] = useState({ lat: -15.4167, lng: 28.2833 }); // Lusaka center

  useEffect(() => {
    if (activeTab === 'live') {
      const interval = setInterval(() => {
        setLivePos(prev => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001
        }));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const vehicles = [
    { id: 'courier', name: 'Zambia Courier', icon: 'fa-motorcycle', price: '45.00', time: '12 min' },
    { id: 'van', name: 'Zambia Cargo', icon: 'fa-truck-front', price: '185.00', time: '25 min' },
    { id: 'truck', name: 'Heavy Haul (ZM)', icon: 'fa-truck-moving', price: '450.00', time: '40 min' }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)] animate-in fade-in duration-500">
      {/* Zambian Integrated Map */}
      <div className="flex-grow bg-emerald-50 rounded-[2.5rem] overflow-hidden relative border-4 border-white shadow-2xl">
        <img 
          src="https://picsum.photos/seed/zambia-map/1400/1000" 
          className="w-full h-full object-cover opacity-60 grayscale-[0.5]" 
          alt="Zambia Logistics Map"
        />
        <div className="absolute inset-0 bg-emerald-900/10 backdrop-soft-blur"></div>
        
        {/* Real-time Ticker */}
        <div className="absolute top-6 left-6 right-6">
           <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white flex flex-col md:flex-row items-center gap-6">
              <div className="flex-grow w-full md:w-auto">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Ops: Lusaka - Hub 1</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="text-xs font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">LAT: {livePos.lat.toFixed(4)}</div>
                    <div className="text-xs font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">LNG: {livePos.lng.toFixed(4)}</div>
                 </div>
              </div>
              <div className="h-px md:h-8 w-full md:w-px bg-gray-200"></div>
              <div className="flex gap-2">
                 <button 
                  onClick={() => setActiveTab('request')}
                  className={`px-6 py-2 rounded-xl text-xs font-black transition ${activeTab === 'request' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}
                 >
                   Request
                 </button>
                 <button 
                  onClick={() => setActiveTab('live')}
                  className={`px-6 py-2 rounded-xl text-xs font-black transition ${activeTab === 'live' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}
                 >
                   Live Radar
                 </button>
              </div>
           </div>
        </div>

        {/* Live Tracking Marker */}
        <div className="absolute transition-all duration-1000" style={{ top: '55%', left: '48%' }}>
           <div className="flex flex-col items-center group">
              <div className="bg-white p-2 rounded-xl shadow-2xl border border-emerald-100 mb-2 scale-0 group-hover:scale-100 transition-transform origin-bottom">
                 <p className="text-[8px] font-black text-emerald-900">VAN-ZM-482</p>
              </div>
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-2xl animate-pulse ring-4 ring-white">
                <i className="fas fa-truck-front"></i>
              </div>
           </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="w-full lg:w-[400px] bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 flex flex-col gap-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Logistics ZM</h2>
          <p className="text-sm text-gray-500 font-medium">Official Logistics Hub for Zenith Zambia.</p>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto scrollbar-hide flex-grow">
          {vehicles.map((v) => (
            <button 
              key={v.id}
              onClick={() => setVehicle(v.id)}
              className={`flex items-center p-5 rounded-[1.5rem] border-2 transition-all ${
                vehicle === v.id ? 'bg-emerald-600 border-emerald-600 shadow-2xl scale-[1.02]' : 'bg-gray-50 border-transparent hover:border-emerald-100'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-4 shadow-sm transition-colors ${
                vehicle === v.id ? 'bg-white/10 text-white' : 'bg-white text-emerald-600'
              }`}>
                <i className={`fas ${v.icon} text-2xl`}></i>
              </div>
              <div className="flex-grow text-left">
                <p className={`font-black text-sm uppercase tracking-wider ${vehicle === v.id ? 'text-white' : 'text-gray-900'}`}>{v.name}</p>
                <p className={`text-[10px] font-bold ${vehicle === v.id ? 'text-emerald-100' : 'text-gray-400'}`}>{v.time} arrival</p>
              </div>
              <div className="text-right">
                <p className={`text-[10px] font-black uppercase ${vehicle === v.id ? 'text-emerald-100' : 'text-gray-400'}`}>Est.</p>
                <p className={`font-black text-xl ${vehicle === v.id ? 'text-white' : 'text-emerald-900'}`}>ZMW {v.price}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-auto space-y-4">
          <div className="p-4 bg-emerald-50 rounded-2xl flex items-center gap-3">
             <i className="fas fa-tag text-emerald-600"></i>
             <p className="text-[10px] font-black text-emerald-900 uppercase">Vendor Discount Applied (-5%)</p>
          </div>
          <button 
            className="group w-full py-6 bg-gray-900 text-white rounded-[2rem] font-black text-xl hover:bg-emerald-600 transition shadow-2xl flex items-center justify-center gap-4"
          >
            <span>Confirm Request</span>
            <i className="fas fa-arrow-right text-sm group-hover:translate-x-2 transition-transform"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logistics;
