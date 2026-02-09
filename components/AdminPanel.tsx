import React, { useState } from 'react';
import { Product, User, AppConfig, Transaction, SocialChannel } from '../types.ts';
import TerritoryExplorer from './TerritoryExplorer.tsx';
import { marketSearch, generateViralSocialBlast } from '../geminiService.ts';

interface AdminPanelProps {
  config: AppConfig;
  onUpdateConfig: (config: AppConfig) => void;
  products: Product[];
  users: User[];
  transactions: Transaction[];
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  config, onUpdateConfig, products, users, transactions, 
  onUpdateProduct, onDeleteProduct, onUpdateUser, onDeleteUser 
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'approvals' | 'territory' | 'social' | 'payouts' | 'settings'>('stats');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Social Blast State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [blastCopy, setBlastCopy] = useState('');
  const [isBlasting, setIsBlasting] = useState(false);
  const [activePlatform, setActivePlatform] = useState('WhatsApp');

  // Social Search State
  const [socialSearch, setSocialSearch] = useState('');
  const [isSearchingSocial, setIsSearchingSocial] = useState(false);
  const [socialResults, setSocialResults] = useState<any[]>([]);

  const pending = products.filter(p => p.status === 'pending');
  const totalRev = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  const handleWithdraw = () => {
    if (!config.ownerMobileNumber) return alert("Please connect a mobile wallet first.");
    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }, 3000);
  };

  const handleSaveConfig = () => {
    setSaveStatus('Saving changes...');
    setTimeout(() => {
      setSaveStatus('Config Updated Successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    }, 1000);
  };

  const handleSocialSearch = async () => {
    if (!socialSearch) return;
    setIsSearchingSocial(true);
    try {
      const res = await marketSearch(`Find top ${socialSearch} business platforms or marketing tools popular for advertising in Africa.`);
      setSocialResults(res.sources);
    } catch (e) {
      alert("Social search failed.");
    } finally {
      setIsSearchingSocial(false);
    }
  };

  const generateBlast = async (platform: string) => {
    if (!selectedProduct) return;
    setIsBlasting(true);
    setActivePlatform(platform);
    try {
      const copy = await generateViralSocialBlast(selectedProduct.name, selectedProduct.description, selectedProduct.price, platform);
      setBlastCopy(copy);
    } catch (e) {
      alert("AI Blast failed. Retrying...");
    } finally {
      setIsBlasting(false);
    }
  };

  const shareToPlatform = (platform: string) => {
    const text = encodeURIComponent(blastCopy || `Check out ${selectedProduct?.name} on Zenith ZM! ZMW ${selectedProduct?.price}`);
    const url = window.location.href; // Simulation
    
    const platforms: Record<string, string> = {
      'WhatsApp': `https://wa.me/?text=${text}`,
      'Facebook': `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
      'Messenger': `fb-messenger://share/?link=${url}&app_id=123456789`,
      'Instagram': `https://www.instagram.com/`,
      'Twitter': `https://twitter.com/intent/tweet?text=${text}`,
    };

    window.open(platforms[platform], '_blank');
  };

  const addSocialChannel = (source: any) => {
    const newChannel: SocialChannel = {
      id: Math.random().toString(36).substr(2, 9),
      name: source.web?.title || 'External Platform',
      platform: 'Global Web',
      url: source.web?.uri || '',
      status: 'active',
      reach: 'Global'
    };
    const currentChannels = config.savedSocialChannels || [];
    onUpdateConfig({ ...config, savedSocialChannels: [...currentChannels, newChannel] });
    setSocialResults(socialResults.filter(s => s !== source));
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-none">Owner Dashboard</h1>
          <p className="text-gray-500 font-bold text-lg mt-3 flex items-center gap-3">
             <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
             Global Zenith Command Center
          </p>
        </div>
        <div className="flex bg-white shadow-2xl p-2 rounded-3xl border border-gray-100 overflow-x-auto max-w-full no-scrollbar">
          {[
            { id: 'stats', label: 'Analytics', icon: 'fa-chart-pie' },
            { id: 'approvals', label: 'Queues', icon: 'fa-stamp', count: pending.length },
            { id: 'social', label: 'Social Blast', icon: 'fa-share-nodes' },
            { id: 'territory', label: 'Territories', icon: 'fa-map' },
            { id: 'payouts', label: 'Payouts', icon: 'fa-wallet' },
            { id: 'settings', label: 'Config', icon: 'fa-sliders' }
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap ${
                activeTab === t.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-400 hover:text-gray-900'
              }`}
            >
              <i className={`fas ${t.icon}`}></i>
              {t.label}
              {t.count ? <span className="bg-red-500 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center">{t.count}</span> : null}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'social' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-bottom-10">
          {/* Business Selection Panel */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white p-8 rounded-[3.5rem] shadow-xl border border-gray-100">
                <h3 className="text-xl font-black text-gray-900 mb-6">Select Business</h3>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                   {products.map(p => (
                     <button 
                        key={p.id}
                        onClick={() => { setSelectedProduct(p); setBlastCopy(''); }}
                        className={`w-full flex items-center p-4 rounded-3xl border-2 transition-all ${
                          selectedProduct?.id === p.id ? 'bg-emerald-50 border-emerald-500' : 'bg-gray-50 border-transparent hover:border-emerald-200'
                        }`}
                     >
                        <img src={p.imageUrl} className="w-12 h-12 rounded-xl object-cover mr-4" />
                        <div className="text-left">
                           <p className="font-black text-sm text-gray-900">{p.name}</p>
                           <p className="text-[10px] font-black text-emerald-600 uppercase">ZMW {p.price}</p>
                        </div>
                     </button>
                   ))}
                </div>
             </div>

             <div className="bg-gray-900 p-8 rounded-[3rem] text-white space-y-4">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                      <i className="fab fa-meta"></i>
                   </div>
                   <p className="font-black text-sm">Meta Business Suite</p>
                </div>
                <p className="text-[10px] text-gray-400 font-bold leading-relaxed italic">
                   "ZENITH ZM is granted direct API permissions to communicate with Meta Graph, WhatsApp Business, and Twitter X endpoints."
                </p>
                <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                   <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                   Permissions: GLOBAL_ALL
                </div>
             </div>
          </div>

          {/* Social Blast Workspace */}
          <div className="lg:col-span-8">
             <div className="bg-white rounded-[4.5rem] shadow-2xl border border-gray-100 p-12 h-full min-h-[600px] flex flex-col relative overflow-hidden">
                {!selectedProduct ? (
                   <div className="flex-grow flex flex-col items-center justify-center text-center opacity-30">
                      <i className="fas fa-bullhorn text-8xl mb-8"></i>
                      <h2 className="text-3xl font-black">Ready to Blast?</h2>
                      <p className="max-w-xs mx-auto mt-4 font-bold text-lg leading-relaxed italic">"Select a business from the directory to start your global social media campaign."</p>
                   </div>
                ) : (
                   <div className="space-y-10 flex-grow animate-in fade-in duration-500">
                      <header className="flex justify-between items-center">
                         <div>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Social Blast Hub</h2>
                            <p className="text-emerald-600 font-black text-[10px] uppercase tracking-widest mt-1">Campaign for: {selectedProduct.name}</p>
                         </div>
                         <div className="flex gap-2">
                            {['WhatsApp', 'Facebook', 'Messenger', 'Instagram', 'Twitter'].map(p => (
                               <button 
                                 key={p}
                                 onClick={() => generateBlast(p)}
                                 className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                    activePlatform === p ? 'bg-gray-900 text-white scale-110 shadow-lg' : 'bg-gray-50 text-gray-400 hover:text-gray-900'
                                 }`}
                               >
                                  <i className={`fab fa-${p.toLowerCase() === 'messenger' ? 'facebook-messenger' : p.toLowerCase() === 'twitter' ? 'x-twitter' : p.toLowerCase()}`}></i>
                               </button>
                            ))}
                         </div>
                      </header>

                      <div className="bg-gray-50 rounded-[3rem] p-10 border border-gray-100 min-h-[350px] relative flex flex-col">
                         {isBlasting ? (
                            <div className="flex-grow flex flex-col items-center justify-center gap-6">
                               <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 animate-pulse">Zenith-AI: Crafting Viral Content for {activePlatform}...</p>
                            </div>
                         ) : (
                            <div className="space-y-8 flex-grow">
                               <div className="flex justify-between items-center">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">AI-Generated {activePlatform} Post</p>
                                  <button onClick={() => setBlastCopy('')} className="text-red-500 text-[10px] font-black uppercase hover:underline">Clear</button>
                               </div>
                               <textarea 
                                 className="w-full flex-grow bg-transparent font-bold text-xl leading-relaxed text-gray-900 outline-none resize-none min-h-[250px] italic"
                                 value={blastCopy}
                                 onChange={(e) => setBlastCopy(e.target.value)}
                                 placeholder="Zenith-AI is ready to generate your post. Select a platform above..."
                               />
                            </div>
                         )}
                      </div>

                      <div className="pt-8 flex flex-col md:flex-row gap-6">
                         <button 
                           onClick={() => shareToPlatform(activePlatform)}
                           disabled={!blastCopy}
                           className="flex-grow py-8 bg-emerald-600 text-white rounded-[2.5rem] font-black text-xl shadow-2xl hover:bg-emerald-700 transition flex items-center justify-center gap-4 disabled:opacity-50"
                         >
                            <i className="fas fa-rocket"></i>
                            Launch Campaign to {activePlatform}
                         </button>
                         <button 
                            onClick={() => {
                               navigator.clipboard.writeText(blastCopy);
                               alert("Viral copy copied to clipboard!");
                            }}
                            className="px-12 py-8 bg-gray-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:bg-black transition"
                         >
                            Copy Asset
                         </button>
                      </div>
                   </div>
                )}
                
                <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                   <i className="fas fa-share-nodes text-[200px]"></i>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform"></div>
                <i className="fas fa-sack-dollar text-4xl text-emerald-600 mb-8"></i>
                <p className="text-5xl font-black text-gray-900 leading-none">ZMW {totalRev.toLocaleString()}</p>
                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mt-4">Platform Net Yield</p>
             </div>
             <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-xl">
                <i className="fas fa-handshake text-4xl text-blue-600 mb-8"></i>
                <p className="text-5xl font-black text-gray-900 leading-none">{transactions.length}</p>
                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mt-4">Captured Transactions</p>
             </div>
             <div className="bg-gray-900 col-span-1 md:col-span-2 p-12 rounded-[4rem] text-white shadow-2xl border border-white/5 relative overflow-hidden">
                <div className="flex justify-between items-center mb-12">
                   <h3 className="text-2xl font-black flex items-center gap-4"><i className="fas fa-receipt text-emerald-500"></i> Revenue Stream</h3>
                   <button className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:underline">Export Audit</button>
                </div>
                <div className="space-y-6">
                  {transactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/10">
                       <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><i className="fas fa-arrow-down-long text-emerald-500"></i></div>
                          <div>
                             <p className="font-black text-lg uppercase tracking-tight">{tx.type.replace('_', ' ')}</p>
                             <p className="text-[10px] text-gray-500 font-bold">{new Date(tx.timestamp).toLocaleString()}</p>
                          </div>
                       </div>
                       <p className="text-2xl font-black text-emerald-400">+ ZMW {tx.amount}</p>
                    </div>
                  ))}
                  {transactions.length === 0 && <p className="text-center py-10 text-gray-500 font-bold uppercase tracking-widest text-sm">No transactions captured yet.</p>}
                </div>
             </div>
          </div>
          <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-2xl space-y-10">
             <h3 className="text-2xl font-black text-gray-900">Market Vitality</h3>
             {[
               { label: 'Merchant Growth', current: 84, target: 100, color: 'bg-emerald-500' },
               { label: 'Ad Fill Rate', current: 62, target: 100, color: 'bg-blue-500' },
               { label: 'KYC Verification', current: 98, target: 100, color: 'bg-orange-500' }
             ].map((stat, i) => (
               <div key={i} className="space-y-4">
                  <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    <span>{stat.label}</span>
                    <span className="text-gray-900">{stat.current}%</span>
                  </div>
                  <div className="h-4 bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-1">
                     <div className={`h-full ${stat.color} rounded-full transition-all duration-1000`} style={{ width: `${stat.current}%` }}></div>
                  </div>
               </div>
             ))}
             <div className="pt-10 border-t border-gray-50">
                <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 border-dashed">
                   <p className="text-xs text-emerald-800 font-bold leading-relaxed italic">
                      "Owner Intelligence: Lusaka trading volume is up 14% this weekend. Consider a 5% discount on logistics ads."
                   </p>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'territory' && <TerritoryExplorer />}

      {activeTab === 'payouts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom-6">
          <div className="bg-gray-950 p-12 rounded-[4rem] text-white shadow-2xl border border-white/5 space-y-12">
            <header>
              <h3 className="text-3xl font-black tracking-tighter mb-2">Owner Wallet Connection</h3>
              <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Linked Identity: {config.ownerName}</p>
            </header>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Zambian Mobile Number</label>
                <div className="flex gap-4">
                  <div className="flex-grow relative">
                    <input 
                      type="text" 
                      placeholder="097 / 096 / 076..." 
                      className="w-full bg-black border border-emerald-900/50 rounded-2xl px-8 py-5 font-black text-xl text-white outline-none focus:border-emerald-500 transition shadow-inner"
                      value={config.ownerMobileNumber || ''}
                      onChange={(e) => onUpdateConfig({...config, ownerMobileNumber: e.target.value})}
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500">
                      <i className="fas fa-mobile-screen-button text-2xl"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Network Operator</label>
                <div className="grid grid-cols-3 gap-4">
                  {(['MTN', 'Airtel', 'Zamtel'] as const).map(op => (
                    <button 
                      key={op}
                      onClick={() => onUpdateConfig({...config, ownerMobileOperator: op})}
                      className={`py-5 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${
                        config.ownerMobileOperator === op 
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-900/50' 
                        : 'bg-black border-emerald-900/30 text-emerald-900 hover:border-emerald-700'
                      }`}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-white/5 text-center">
              <button 
                onClick={() => alert(`Wallet credentials synced for Owner ${config.ownerName}.`)}
                className="w-full py-6 bg-white text-black rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition shadow-2xl"
              >
                Sync Wallet Credentials
              </button>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            {showSuccess && (
              <div className="absolute inset-0 bg-emerald-600/95 backdrop-blur-xl z-20 flex flex-col items-center justify-center text-white text-center p-10 animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8">
                  <i className="fas fa-check text-emerald-600 text-4xl"></i>
                </div>
                <h3 className="text-4xl font-black mb-4">Transfer Complete</h3>
                <p className="text-emerald-100 font-bold max-w-xs">ZMW {totalRev.toLocaleString()} has been sent to {config.ownerMobileNumber}.</p>
                <button onClick={() => setShowSuccess(false)} className="mt-10 bg-white/20 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/30 transition">Dismiss</button>
              </div>
            )}

            <div className="space-y-12">
              <header className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-black tracking-tight text-gray-900">Treasury Yield</h3>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">Settlement Account</p>
                </div>
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <i className="fas fa-vault text-2xl"></i>
                </div>
              </header>

              <div className="p-10 bg-gray-50 rounded-[3rem] border border-gray-100 text-center space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Withdrawable Commissions</p>
                <p className="text-6xl font-black text-gray-900 tracking-tighter">ZMW {totalRev.toLocaleString()}</p>
              </div>
            </div>

            <div className="pt-12">
              <button 
                disabled={isWithdrawing || !config.ownerMobileNumber}
                onClick={handleWithdraw}
                className={`w-full py-8 rounded-[2.5rem] font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-4 ${
                  !config.ownerMobileNumber 
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                }`}
              >
                {isWithdrawing ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-money-bill-transfer"></i>}
                <span>{isWithdrawing ? 'Settling...' : 'Instant Withdrawal'}</span>
              </button>
              <p className="text-center text-[9px] font-black text-gray-300 uppercase tracking-widest mt-6 italic">
                Platform governance by {config.ownerName}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Approvals tab */}
      {activeTab === 'approvals' && (
        <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-100 overflow-hidden">
           <div className="p-12 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-2xl font-black text-gray-900">Verification Queue</h3>
              <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">{pending.length} New Requests</span>
           </div>
           {pending.length > 0 ? (
             <div className="divide-y divide-gray-50">
               {pending.map(p => (
                 <div key={p.id} className="p-12 flex flex-col md:flex-row items-center gap-12 group hover:bg-emerald-50/10 transition">
                    <img src={p.imageUrl} className="w-40 h-40 rounded-[2.5rem] object-cover shadow-2xl border-4 border-white transition-transform group-hover:scale-105" />
                    <div className="flex-grow space-y-4">
                       <h4 className="text-3xl font-black text-gray-900 tracking-tight">{p.name}</h4>
                       <p className="text-2xl font-black text-emerald-700">ZMW {p.price.toLocaleString()}</p>
                       <p className="text-gray-400 font-medium leading-relaxed line-clamp-2 max-w-2xl">{p.description}</p>
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => onUpdateProduct(p.id, { status: 'approved' })} className="px-10 py-6 bg-emerald-600 text-white rounded-3xl font-black text-xs uppercase hover:bg-emerald-700 transition">Approve</button>
                       <button onClick={() => onDeleteProduct(p.id)} className="px-10 py-6 bg-red-50 text-red-600 rounded-3xl font-black text-xs uppercase hover:bg-red-100 transition">Reject</button>
                    </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="p-32 text-center">
                <i className="fas fa-check-double text-4xl text-emerald-600 mb-6"></i>
                <h4 className="text-2xl font-black">All Clear</h4>
             </div>
           )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-2xl space-y-12">
             <header>
               <h3 className="text-3xl font-black text-gray-900">Monetization Engine</h3>
               <p className="text-gray-500 font-bold text-sm mt-2">Configure platform-wide transaction fees and rates.</p>
             </header>
             <div className="space-y-10">
                <div className="space-y-4">
                   <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      <span>Standard Listing Fee (ZMW)</span>
                      <span className="text-emerald-600 font-black">ZMW {config.listingFee}</span>
                   </div>
                   <input type="range" min="0" max="500" step="5" className="w-full accent-emerald-600 h-2 bg-gray-100 rounded-full appearance-none" 
                    value={config.listingFee} onChange={e => onUpdateConfig({...config, listingFee: parseInt(e.target.value)})} />
                </div>
                
                <div className="space-y-4">
                   <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      <span>Promotion Ad Fee (ZMW)</span>
                      <span className="text-blue-600 font-black">ZMW {config.promotionFee}</span>
                   </div>
                   <input type="range" min="0" max="2000" step="50" className="w-full accent-blue-600 h-2 bg-gray-100 rounded-full appearance-none" 
                    value={config.promotionFee} onChange={e => onUpdateConfig({...config, promotionFee: parseInt(e.target.value)})} />
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      <span>Featured Showcase Fee (ZMW)</span>
                      <span className="text-orange-600 font-black">ZMW {config.featuredFee}</span>
                   </div>
                   <input type="range" min="0" max="5000" step="100" className="w-full accent-orange-600 h-2 bg-gray-100 rounded-full appearance-none" 
                    value={config.featuredFee} onChange={e => onUpdateConfig({...config, featuredFee: parseInt(e.target.value)})} />
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      <span>Platform Commission Rate (%)</span>
                      <span className="text-emerald-600 font-black">{config.commissionRate}%</span>
                   </div>
                   <input type="range" min="0" max="50" step="0.5" className="w-full accent-emerald-600 h-2 bg-gray-100 rounded-full appearance-none" 
                    value={config.commissionRate} onChange={e => onUpdateConfig({...config, commissionRate: parseFloat(e.target.value)})} />
                </div>
             </div>
             <button onClick={handleSaveConfig} className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition shadow-xl">
               Save Financial Config
             </button>
          </div>

          <div className="space-y-10">
            <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-2xl space-y-12">
               <h3 className="text-3xl font-black text-gray-900">Operational Flags</h3>
               <div className="space-y-6">
                  <div className="flex items-center justify-between p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                     <div>
                        <p className="font-black text-gray-900 uppercase tracking-tight text-sm">Open Registration</p>
                        <p className="text-[10px] text-gray-400 font-bold">Allow new vendors to onboard.</p>
                     </div>
                     <button 
                       onClick={() => onUpdateConfig({...config, isRegistrationOpen: !config.isRegistrationOpen})}
                       className={`w-16 h-10 rounded-full transition-all flex items-center px-1.5 ${config.isRegistrationOpen ? 'bg-emerald-600 justify-end' : 'bg-gray-300 justify-start'}`}
                     >
                        <div className="w-7 h-7 bg-white rounded-full shadow-lg"></div>
                     </button>
                  </div>

                  <div className="flex items-center justify-between p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                     <div>
                        <p className="font-black text-gray-900 uppercase tracking-tight text-sm">AI Intelligence</p>
                        <p className="text-[10px] text-gray-400 font-bold">Deploy Gemini across the platform.</p>
                     </div>
                     <button 
                       onClick={() => onUpdateConfig({...config, isAiEnabled: !config.isAiEnabled})}
                       className={`w-16 h-10 rounded-full transition-all flex items-center px-1.5 ${config.isAiEnabled ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'}`}
                     >
                        <div className="w-7 h-7 bg-white rounded-full shadow-lg"></div>
                     </button>
                  </div>
               </div>
            </div>

            <div className="bg-gray-950 p-12 rounded-[4rem] border border-white/10 shadow-2xl space-y-10 text-white">
               <h3 className="text-3xl font-black text-white">Platform Branding</h3>
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Owner Identity</label>
                     <input 
                      type="text" 
                      className="w-full bg-black border border-white/10 rounded-2xl px-8 py-4 font-black text-white focus:border-emerald-500 outline-none transition"
                      value={config.ownerName || ''}
                      onChange={e => onUpdateConfig({...config, ownerName: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Admin Title</label>
                     <input 
                      type="text" 
                      className="w-full bg-black border border-white/10 rounded-2xl px-8 py-4 font-black text-white focus:border-emerald-500 outline-none transition"
                      value={config.ownerTitle || ''}
                      onChange={e => onUpdateConfig({...config, ownerTitle: e.target.value})}
                     />
                  </div>
               </div>
               <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                  {saveStatus ? <p className="text-emerald-400 font-black text-[10px] uppercase tracking-widest animate-pulse">{saveStatus}</p> : <div />}
                  <button onClick={handleSaveConfig} className="bg-emerald-600 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition">Update Brand</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;