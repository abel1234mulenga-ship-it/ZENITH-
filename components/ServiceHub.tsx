
import React, { useState, useEffect } from 'react';
import { fetchZambianNews, generateAppInvite } from '../geminiService';
import { NewsItem } from '../types';

interface ServiceHubProps {
  setView: (view: any) => void;
  zambianMarkets?: any[];
  user?: any;
}

const ServiceHub: React.FC<ServiceHubProps> = ({ setView, zambianMarkets = [], user }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    setNewsLoading(true);
    fetchZambianNews().then(setNews).finally(() => setNewsLoading(false));
  }, []);

  const handleViralInvite = async () => {
    setInviteLoading(true);
    try {
      const inviteMsg = await generateAppInvite(user?.name || 'A Merchant');
      const finalMsg = inviteMsg.replace('[LINK]', window.location.href);
      
      if (navigator.share) {
        await navigator.share({
          title: 'Join Zenith ZM',
          text: finalMsg,
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(finalMsg);
        alert('Viral invite copied! Blast it to your WhatsApp status.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInviteLoading(false);
    }
  };

  const services = [
    { id: 'marketplace', name: 'Trade Hub', icon: 'fa-store', color: 'bg-emerald-600', desc: 'Buy & Sell Assets Nationwide' },
    { id: 'navigator', name: 'City Explore', icon: 'fa-map-location-dot', color: 'bg-blue-600', desc: 'Explore Zambian Urban Centers' },
    { id: 'logistics', name: 'Transit Ops', icon: 'fa-truck-fast', color: 'bg-indigo-600', desc: 'Freight, Haulage & Delivery' },
    { id: 'dashboard', name: 'Merchant Console', icon: 'fa-user-tie', color: 'bg-orange-600', desc: 'Grow Your Trade Enterprise' }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* News Ticker */}
      <div className="bg-gray-950 text-white h-16 flex items-center overflow-hidden rounded-full shadow-2xl border border-white/10 group">
        <div className="px-8 bg-emerald-600 h-full flex items-center font-black text-[10px] uppercase tracking-[0.3em] whitespace-nowrap border-r border-white/20">
          <i className="fas fa-rss mr-3 animate-pulse"></i> Trade News
        </div>
        <div className="flex-grow flex items-center overflow-hidden">
          <div className="flex items-center gap-12 animate-[ticker_60s_linear_infinite] group-hover:[animation-play-state:paused] whitespace-nowrap px-8">
            {news.map((item, i) => (
              <a key={i} href={item.link} target="_blank" rel="noreferrer" className="flex items-center gap-4 hover:text-emerald-400 transition">
                <span className="text-[10px] font-black text-emerald-500 uppercase">[{item.source}]</span>
                <span className="text-sm font-bold tracking-tight">{item.title}</span>
              </a>
            ))}
            {newsLoading && <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Gathering Latest Trade Intel...</span>}
          </div>
        </div>
      </div>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-6xl font-black text-gray-900 tracking-tighter leading-none mb-3">Zenith Hub</h1>
          <p className="text-gray-500 font-bold text-xl">The master operating system for Zambian commerce.</p>
        </div>
        <div className="flex gap-4">
           {[...Array(4)].map((_, i) => (
             <div key={i} className={`w-5 h-5 rounded-lg ${['bg-emerald-600', 'bg-red-600', 'bg-black', 'bg-orange-500'][i]}`}></div>
           ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((s) => (
          <button 
            key={s.id}
            onClick={() => setView(s.id)}
            className="group relative bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl hover:shadow-[0_50px_100px_rgba(0,0,0,0.1)] hover:border-emerald-100 transition-all text-left overflow-hidden flex flex-col justify-between min-h-[280px]"
          >
            <div className={`w-16 h-16 ${s.color} text-white rounded-2xl flex items-center justify-center mb-10 shadow-xl group-hover:scale-110 transition-transform`}>
              <i className={`fas ${s.icon} text-3xl`}></i>
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">{s.name}</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-bold tracking-tight">{s.desc}</p>
            </div>
            <div className="absolute bottom-10 right-10 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-emerald-600">
                 <i className="fas fa-arrow-right"></i>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-gradient-to-tr from-emerald-950 to-gray-900 rounded-[4rem] p-16 text-white relative overflow-hidden shadow-2xl border border-white/5">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center opacity-10"></div>
          <div className="relative z-10">
            <span className="bg-emerald-600/30 text-emerald-400 text-[10px] font-black tracking-[0.4em] px-6 py-2 rounded-full uppercase mb-10 inline-block border border-emerald-500/20 shadow-2xl">Zambian Trade Radar</span>
            <h2 className="text-5xl font-black tracking-tighter mb-6 leading-tight">Trending Commercial Hubs</h2>
            <p className="text-emerald-100/60 text-lg mb-12 font-medium italic leading-relaxed max-w-xl">
              "AI identifies high-activity markets based on current trade volume and localized demand across Zambia's provinces."
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {zambianMarkets.length > 0 ? (
                zambianMarkets.slice(0, 4).map((market, i) => (
                  <a key={i} href={market.web?.uri} target="_blank" rel="noreferrer" className="flex items-center p-6 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all group shadow-xl">
                    <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mr-5 shadow-lg group-hover:rotate-12 transition-transform">
                      <i className="fas fa-location-arrow"></i>
                    </div>
                    <div>
                      <h4 className="font-black text-emerald-50 text-sm">{market.web?.title}</h4>
                      <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1">High Activity</p>
                    </div>
                  </a>
                ))
              ) : (
                <div className="flex gap-6 items-center p-6 bg-white/5 rounded-[2.5rem] animate-pulse">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl"></div>
                  <div className="flex-grow space-y-2">
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="h-3 bg-white/10 rounded w-1/2"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-[4rem] p-12 border border-gray-100 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-150 transition-transform duration-1000">
              <i className="fas fa-bullseye-arrow text-[180px]"></i>
            </div>
            <div className="space-y-10 relative z-10">
              <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Market Vitality</h3>
              <p className="text-gray-400 font-bold leading-relaxed italic">"Commercial sector performance across Lusaka and the Copperbelt today."</p>
              <div className="space-y-8">
                {[
                  { label: 'Mining Logistics', val: 78, color: 'bg-indigo-600' },
                  { label: 'Retail Trade', val: 92, color: 'bg-emerald-600' },
                  { label: 'Real Estate', val: 64, color: 'bg-orange-500' }
                ].map((s, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      <span>{s.label}</span>
                      <span className="text-gray-900">{s.val}% Active</span>
                    </div>
                    <div className="h-3 bg-gray-50 rounded-full border border-gray-100 p-0.5">
                      <div className={`h-full ${s.color} rounded-full transition-all duration-[2000ms] shadow-sm`} style={{ width: `${s.val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setView('marketplace')} className="w-full py-6 bg-gray-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition shadow-2xl relative z-10 group mt-10">
              <span>Marketplace Entry</span>
              <i className="fas fa-chevron-right ml-3 group-hover:translate-x-2 transition-transform"></i>
            </button>
          </div>

          <div className="bg-emerald-600 rounded-[4rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black tracking-tight mb-4 flex items-center gap-3">
                <i className="fas fa-rocket"></i> Viral Growth
              </h4>
              <p className="text-emerald-50 text-xs font-bold leading-relaxed mb-8 opacity-80">"Blast Zenith to your network. AI creates the perfect invite to grow our commerce community."</p>
              <button 
                onClick={handleViralInvite}
                disabled={inviteLoading}
                className="w-full py-5 bg-white text-emerald-600 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-50 transition flex items-center justify-center gap-3"
              >
                {inviteLoading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-share-nodes"></i>}
                {inviteLoading ? 'Generating...' : 'Invite Network'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default ServiceHub;
