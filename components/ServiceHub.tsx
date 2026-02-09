
import React from 'react';

interface ServiceHubProps {
  setView: (view: any) => void;
  zambianMarkets?: any[];
}

const ServiceHub: React.FC<ServiceHubProps> = ({ setView, zambianMarkets = [] }) => {
  const services = [
    { id: 'marketplace', name: 'Marketplace', icon: 'fa-store', color: 'bg-emerald-600', desc: 'Buy & Sell Tools in Zambia' },
    { id: 'logistics', name: 'Logistics', icon: 'fa-truck-ramp-box', color: 'bg-indigo-600', desc: 'Heavy Transport & Delivery' },
    { id: 'services', name: 'Local Help', icon: 'fa-toolbox', color: 'bg-orange-600', desc: 'Find Repairs & Support' },
    { id: 'dashboard', name: 'Business Hub', icon: 'fa-chart-line', color: 'bg-amber-600', desc: 'Manage Your Enterprise' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">How can we help today?</h1>
          <p className="text-gray-500 font-medium">Your gateway to Zambian commerce and logistics.</p>
        </div>
        <div className="flex gap-2">
          <div className="w-4 h-4 bg-emerald-600 rounded-sm"></div>
          <div className="w-4 h-4 bg-red-600 rounded-sm"></div>
          <div className="w-4 h-4 bg-black rounded-sm"></div>
          <div className="w-4 h-4 bg-orange-500 rounded-sm"></div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((s) => (
          <button 
            key={s.id}
            onClick={() => setView(s.id)}
            className="group relative bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-emerald-100 transition-all text-left overflow-hidden"
          >
            <div className={`w-14 h-14 ${s.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
              <i className={`fas ${s.icon} text-2xl`}></i>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">{s.name}</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">{s.desc}</p>
            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
              <i className="fas fa-arrow-right text-emerald-600"></i>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gradient-to-r from-emerald-900 to-emerald-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10 max-w-2xl">
            <span className="bg-emerald-400/30 text-emerald-200 text-[10px] font-black tracking-[0.2em] px-3 py-1 rounded-full uppercase mb-6 inline-block">Real-time Zambia Intelligence</span>
            <h2 className="text-3xl font-black mb-4">Zambia's Top Trading Hubs</h2>
            <p className="text-emerald-100/80 mb-8 leading-relaxed font-medium italic">Gemini AI has identified these major markets as trending for you today.</p>
            
            <div className="space-y-4">
              {zambianMarkets.length > 0 ? (
                zambianMarkets.slice(0, 3).map((market, i) => (
                  <div key={i} className="flex items-center p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/20 transition-all group cursor-pointer">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-4 group-hover:rotate-12 transition-transform">
                      <i className="fas fa-location-dot"></i>
                    </div>
                    <div>
                      <h4 className="font-black text-emerald-50">{market.web?.title || "Zambian Market Hub"}</h4>
                      <p className="text-xs text-emerald-200/70">{market.web?.uri ? new URL(market.web.uri).hostname : "Click to view location"}</p>
                    </div>
                    <a href={market.web?.uri} target="_blank" rel="noreferrer" className="ml-auto p-2 hover:bg-white/10 rounded-full transition">
                      <i className="fas fa-external-link-alt text-xs"></i>
                    </a>
                  </div>
                ))
              ) : (
                <div className="animate-pulse flex gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-lg"></div>
                  <div className="flex-grow space-y-2">
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="h-3 bg-white/10 rounded w-1/2"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xl font-black text-gray-900">Market Sentiment</h3>
            <p className="text-sm text-gray-500">Consumer electronics and heavy tools are in high demand in Lusaka today.</p>
            <div className="pt-4 border-t border-gray-50 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400">Copper Belt Tools</span>
                <span className="text-xs font-black text-emerald-600">+12%</span>
              </div>
              <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[70%]"></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400">Agri-Machinery</span>
                <span className="text-xs font-black text-emerald-600">+8%</span>
              </div>
              <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[45%]"></div>
              </div>
            </div>
          </div>
          <button onClick={() => setView('marketplace')} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-emerald-600 transition shadow-xl mt-6">
            Go To Marketplace
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceHub;
