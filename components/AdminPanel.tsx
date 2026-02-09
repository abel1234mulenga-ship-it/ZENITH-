
import React, { useState } from 'react';
import { PlatformStats, User, AdPlacement } from '../types';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'revenue' | 'users' | 'ads'>('revenue');
  const [settings, setSettings] = useState({
    commission: 5.5,
    listingFee: 15,
    proSubscriptionFee: 250,
    enterpriseFee: 1200
  });

  const [stats] = useState<PlatformStats>({
    totalRevenue: 1245800,
    adRevenue: 340000,
    subscriptionRevenue: 480000,
    activeAds: 142,
    totalUsers: 8430,
    commissionRate: 5.5
  });

  const [mockUsers] = useState<User[]>([
    { id: '1', name: 'Lungu Copper Works', email: 'lungu@copper.zm', role: 'vendor', tier: 'enterprise', walletBalance: 45000 },
    { id: '2', name: 'Zambia Tech Hub', email: 'admin@zenith.zm', role: 'admin', tier: 'enterprise', walletBalance: 0 },
    { id: '3', name: 'Mary Agri-Service', email: 'mary@agri.zm', role: 'vendor', tier: 'pro', walletBalance: 1200 },
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Executive Control</h1>
          <p className="text-gray-500 font-bold text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Real-time Platform Economics: Zenith ZM
          </p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
          {(['revenue', 'users', 'ads'] as const).map(t => (
            <button 
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === t ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'revenue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Net Platform Yield', val: `ZMW ${stats.totalRevenue.toLocaleString()}`, icon: 'fa-vault', color: 'text-emerald-600' },
                { label: 'Ad Spend Captured', val: `ZMW ${stats.adRevenue.toLocaleString()}`, icon: 'fa-rectangle-ad', color: 'text-blue-600' },
              ].map((s, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
                  <div className={`w-12 h-12 bg-gray-50 ${s.color} rounded-xl flex items-center justify-center mb-6`}>
                    <i className={`fas ${s.icon} text-xl`}></i>
                  </div>
                  <p className="text-3xl font-black text-gray-900">{s.val}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-950 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="text-2xl font-black mb-10 flex items-center gap-3">
                <i className="fas fa-sliders text-emerald-500"></i>
                Monetization Engine
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <span>Transaction Commission</span>
                      <span className="text-emerald-400">{settings.commission}%</span>
                    </div>
                    <input 
                      type="range" min="1" max="20" step="0.5"
                      className="w-full h-2 bg-white/10 rounded-full appearance-none accent-emerald-500 cursor-pointer"
                      value={settings.commission}
                      onChange={(e) => setSettings({...settings, commission: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <span>Listing Entry Fee</span>
                      <span className="text-emerald-400">ZMW {settings.listingFee}</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" step="5"
                      className="w-full h-2 bg-white/10 rounded-full appearance-none accent-emerald-500 cursor-pointer"
                      value={settings.listingFee}
                      onChange={(e) => setSettings({...settings, listingFee: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10">
                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-6 italic">Owner Impact Analysis</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Adjusting your commission to <span className="text-white font-black">{settings.commission}%</span> will increase projected monthly revenue by <span className="text-emerald-400 font-black">ZMW 12,400</span> based on current volume.
                  </p>
                  <button className="w-full mt-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition">
                    Push Changes Live
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl">
            <h3 className="text-xl font-black text-gray-900 mb-8">System Health</h3>
            <div className="space-y-6">
              {[
                { label: 'Active Users', current: 8430, target: 10000, color: 'bg-blue-500' },
                { label: 'Vendor Conversion', current: 12, target: 20, color: 'bg-emerald-500' },
                { label: 'Ad Fill Rate', current: 94, target: 100, color: 'bg-orange-500' },
              ].map((h, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span>{h.label}</span>
                    <span className="text-gray-900">{h.current}%</span>
                  </div>
                  <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                    <div className={`h-full ${h.color} rounded-full`} style={{ width: `${(h.current / h.target) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <i className="fas fa-brain text-blue-600"></i>
                <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Admin AI Tip</h4>
              </div>
              <p className="text-xs text-blue-700 leading-relaxed font-medium italic">
                "Increasing subscription costs for the 'Pro' tier by 10% next month is unlikely to cause churn as 85% of Pro users are profitable."
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-black text-xl">Merchant & User Registry</h3>
            <div className="flex gap-2">
               <input type="text" placeholder="Search accounts..." className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Identity</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Role/Tier</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Wallet</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-8 py-5 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                    <div>
                      <p className="font-bold text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-emerald-600 uppercase">{u.role}</span>
                      <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase self-start">{u.tier}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-black text-gray-900">ZMW {u.walletBalance.toLocaleString()}</td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-[10px] font-black text-red-500 uppercase hover:underline">Suspend</button>
                    <button className="ml-4 text-[10px] font-black text-blue-600 uppercase hover:underline">Payout</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'ads' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-emerald-600 rounded-[3rem] p-10 text-white shadow-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-black mb-4">Ad Inventory</h3>
              <p className="text-emerald-100 font-medium leading-relaxed">Promote high-value placements to your enterprise vendors.</p>
            </div>
            <button className="w-full mt-10 py-5 bg-white text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition shadow-xl">
              Add Global Banner
            </button>
          </div>
          
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden p-8 flex flex-col gap-6">
               <div className="aspect-video bg-gray-100 rounded-2xl relative overflow-hidden">
                  <img src={`https://picsum.photos/seed/ad${i}/600/400`} className="w-full h-full object-cover opacity-80" alt="ad" />
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-lg">ACTIVE</div>
               </div>
               <div>
                  <h4 className="font-black text-gray-900">Enterprise Promo Slot {i}</h4>
                  <p className="text-xs text-gray-500 mt-1">Daily Yield: ZMW 850.00</p>
               </div>
               <div className="flex gap-2 mt-auto">
                  <button className="flex-grow py-3 bg-gray-100 text-gray-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition">Pause</button>
                  <button className="flex-grow py-3 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition">Stats</button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
