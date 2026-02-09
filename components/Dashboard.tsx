
import React, { useState, useRef } from 'react';
import { Product, User, AppConfig } from '../types';
import { analyzeImage, generatePromoVideo, generateSocialAd, generateMarketStrategy } from '../geminiService';

interface DashboardProps {
  user: User;
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateUser: (updates: Partial<User>) => void;
  onDeleteProduct: (id: string) => void;
  config: AppConfig;
}

const Dashboard: React.FC<DashboardProps> = ({ user, products, onAddProduct, onUpdateUser, onDeleteProduct, config }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedProductForAI, setSelectedProductForAI] = useState<Product | null>(null);
  const [aiLabLoading, setAiLabLoading] = useState(false);
  const [aiLabStatus, setAiLabStatus] = useState('');
  const [aiLabResult, setAiLabResult] = useState<{ type: 'video' | 'text' | 'strategy', content: any } | null>(null);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '', category: 'Agriculture', price: 0, description: '',
    contactInfo: { phone: '', whatsapp: '', facebook: '', instagram: '', messenger: '' }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      try {
        const analysis = await analyzeImage(base64, file.type);
        setNewProduct(prev => ({ ...prev, description: analysis, imageUrl: URL.createObjectURL(file) }));
      } catch (err) { console.error(err); } 
      finally { setAnalyzing(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateVideo = async () => {
    if (!selectedProductForAI) return;
    setAiLabLoading(true);
    setAiLabResult(null);
    try {
      const videoUrl = await generatePromoVideo(
        `${selectedProductForAI.name}: ${selectedProductForAI.description}`,
        (msg) => setAiLabStatus(msg)
      );
      setAiLabResult({ type: 'video', content: videoUrl });
    } catch (e) {
      alert("Video generation failed. Ensure your API key supports Veo.");
    } finally {
      setAiLabLoading(false);
      setAiLabStatus('');
    }
  };

  const handleGenerateAds = async () => {
    if (!selectedProductForAI) return;
    setAiLabLoading(true);
    setAiLabResult(null);
    try {
      const ads = await generateSocialAd(selectedProductForAI.name, selectedProductForAI.description, selectedProductForAI.price);
      setAiLabResult({ type: 'text', content: ads });
    } catch (e) { alert("Ad generation failed."); }
    finally { setAiLabLoading(false); }
  };

  const handleMarketStrategy = async () => {
    if (!selectedProductForAI) return;
    setAiLabLoading(true);
    setAiLabResult(null);
    try {
      const strategy = await generateMarketStrategy(selectedProductForAI.name, selectedProductForAI.category);
      setAiLabResult({ type: 'strategy', content: strategy });
    } catch (e) { alert("Strategy analysis failed."); }
    finally { setAiLabLoading(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProduct.name || 'Unnamed Asset',
      category: newProduct.category || 'Agriculture',
      price: newProduct.price || 0,
      description: newProduct.description || '',
      imageUrl: newProduct.imageUrl || 'https://picsum.photos/400/300',
      ownerId: user.id,
      location: { lat: -15.4167, lng: 28.2833, address: 'Lusaka' },
      contactInfo: { ...newProduct.contactInfo } as any,
      status: 'pending',
      isFeatured: false,
      isPromoted: false,
      clicks: 0,
      sales: 0,
      createdAt: Date.now()
    };
    onAddProduct(product);
    setIsAdding(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">Console</h1>
          <div className="flex items-center gap-4 mt-3">
             <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg tracking-widest">{user.tier} Plan</span>
             <p className="text-gray-500 font-bold text-lg">Merchant Account</p>
          </div>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-emerald-600 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-emerald-700 transition">Create New Listing</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-gray-900 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">Merchant Capital</p>
          <p className="text-5xl font-black mb-12">ZMW {user.walletBalance.toLocaleString()}</p>
          <div className="flex gap-4">
            <button className="flex-grow py-4 bg-white/10 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white/20 transition">Recharge</button>
            <button className="flex-grow py-4 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-700 transition shadow-xl">Payout</button>
          </div>
        </div>
        <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-xl flex flex-col justify-center">
            <p className="text-4xl font-black text-gray-900">{products.length}</p>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mt-3">Active Inventory</p>
        </div>
        <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-xl flex flex-col justify-center">
            <p className="text-4xl font-black text-emerald-600">ZMW 0</p>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mt-3">Total Sales</p>
        </div>
      </div>

      <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <h3 className="font-black text-2xl text-gray-900">Portfolio Management</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Asset Reach</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-10 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Asset</th>
                <th className="px-10 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Value</th>
                <th className="px-10 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-10 py-6 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Growth Lab</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-emerald-50/10 transition group">
                  <td className="px-10 py-8 flex items-center gap-6">
                    <img src={p.imageUrl} className="w-16 h-16 rounded-2xl object-cover shadow-sm" alt="" />
                    <div>
                      <p className="font-black text-gray-900 text-lg">{p.name}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{p.category}</p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-lg font-black text-emerald-700">ZMW {p.price.toLocaleString()}</p>
                  </td>
                  <td className="px-10 py-8">
                     <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                       p.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                     }`}>
                       {p.status}
                     </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button 
                      onClick={() => setSelectedProductForAI(p)}
                      className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 transition shadow-lg"
                    >
                      <i className="fas fa-microscope mr-2"></i>
                      AI Lab
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Strategic Lab Modal */}
      {selectedProductForAI && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-gray-950/95 backdrop-blur-3xl animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-5xl rounded-[5rem] overflow-hidden flex flex-col lg:flex-row h-[85vh] shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
              {/* Sidebar Info */}
              <div className="lg:w-1/3 bg-gray-50 p-12 flex flex-col justify-between border-r border-gray-100">
                 <div className="space-y-8">
                    <button onClick={() => {setSelectedProductForAI(null); setAiLabResult(null);}} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 transition shadow-sm"><i className="fas fa-times"></i></button>
                    <div className="space-y-4">
                       <img src={selectedProductForAI.imageUrl} className="w-full aspect-square rounded-[3rem] object-cover shadow-2xl" />
                       <h3 className="text-3xl font-black text-gray-900 leading-tight">{selectedProductForAI.name}</h3>
                       <p className="text-gray-400 text-sm font-medium leading-relaxed">{selectedProductForAI.description}</p>
                    </div>
                 </div>
                 <div className="pt-8 border-t border-gray-100">
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em]">AI Strategic Lab Active</p>
                    <p className="text-xs text-gray-400 font-bold mt-1">Merchant: {user.name}</p>
                 </div>
              </div>

              {/* Lab Workspace */}
              <div className="flex-grow p-12 overflow-y-auto no-scrollbar relative bg-white">
                 <header className="mb-12">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Strategic Growth Hub</h2>
                    <p className="text-gray-500 font-bold mt-2">Deploy Zenith's most powerful AI models for this asset.</p>
                 </header>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                      { id: 'video', label: 'Cinematic Ad', icon: 'fa-clapperboard', color: 'bg-indigo-600', action: handleCreateVideo },
                      { id: 'ads', label: 'Ad Copy', icon: 'fa-pen-nib', color: 'bg-emerald-600', action: handleGenerateAds },
                      { id: 'market', label: 'Market Intelligence', icon: 'fa-brain-circuit', color: 'bg-orange-600', action: handleMarketStrategy },
                    ].map(tool => (
                      <button 
                        key={tool.id}
                        onClick={tool.action}
                        disabled={aiLabLoading}
                        className="p-8 rounded-[3rem] bg-gray-50 border border-gray-100 text-left group hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm"
                      >
                         <div className={`w-14 h-14 ${tool.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform`}>
                           <i className={`fas ${tool.icon} text-2xl`}></i>
                         </div>
                         <p className="font-black text-gray-900 text-sm">{tool.label}</p>
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Deploy Model</p>
                      </button>
                    ))}
                 </div>

                 {/* Lab Output Area */}
                 <div className="bg-gray-900 rounded-[4rem] p-12 text-white min-h-[400px] shadow-inner relative overflow-hidden">
                    {aiLabLoading ? (
                       <div className="flex flex-col items-center justify-center h-full py-20 gap-8">
                          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                          <div className="text-center space-y-2">
                             <p className="text-emerald-500 font-black uppercase tracking-[0.4em] text-xs animate-pulse">Zenith Engine: {aiLabStatus || 'Processing Request'}</p>
                             <p className="text-gray-500 text-[10px] font-bold">This may take up to 2 minutes for high-quality assets.</p>
                          </div>
                       </div>
                    ) : aiLabResult ? (
                       <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                          {aiLabResult.type === 'video' && (
                             <div className="space-y-8">
                                <video src={aiLabResult.content} controls className="w-full rounded-[3rem] shadow-2xl border border-white/10" />
                                <div className="flex justify-between items-center">
                                   <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">Veo 3.1 Cinematic Preview</p>
                                   <button className="px-8 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition">Download 4K</button>
                                </div>
                             </div>
                          )}
                          {aiLabResult.type === 'text' && (
                             <div className="space-y-8">
                                <h3 className="text-2xl font-black text-emerald-400">Localized Social Copy</h3>
                                <pre className="whitespace-pre-wrap font-bold text-gray-300 leading-relaxed bg-white/5 p-8 rounded-[2.5rem] border border-white/10 italic">
                                   {aiLabResult.content}
                                </pre>
                                <button onClick={() => navigator.clipboard.writeText(aiLabResult.content)} className="px-8 py-3 bg-emerald-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Copy to Clipboard</button>
                             </div>
                          )}
                          {aiLabResult.type === 'strategy' && (
                             <div className="space-y-8">
                                <h3 className="text-2xl font-black text-orange-400 flex items-center gap-4">
                                   <i className="fas fa-chess-king"></i> Market Dominance Brief
                                </h3>
                                <div className="prose prose-invert max-w-none text-gray-300 font-medium">
                                   <p className="whitespace-pre-wrap leading-relaxed">{aiLabResult.content.text}</p>
                                </div>
                                {aiLabResult.content.sources?.length > 0 && (
                                   <div className="pt-8 border-t border-white/10">
                                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Intelligence Sources</p>
                                      <div className="flex flex-wrap gap-3">
                                         {aiLabResult.content.sources.map((src: any, i: number) => (
                                            <a key={i} href={src.web?.uri} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition border border-white/5">
                                               {new URL(src.web?.uri).hostname}
                                            </a>
                                         ))}
                                      </div>
                                   </div>
                                )}
                             </div>
                          )}
                       </div>
                    ) : (
                       <div className="flex flex-col items-center justify-center h-full py-20 opacity-20 text-center space-y-6">
                          <i className="fas fa-microscope text-7xl"></i>
                          <p className="text-sm font-black uppercase tracking-[0.5em]">System Ready. Select a Strategy.</p>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Product Submission Form Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/90 backdrop-blur-xl animate-in zoom-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[4rem] p-12 overflow-y-auto max-h-[90vh] shadow-2xl no-scrollbar">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black text-gray-900">Commercial Submission</h3>
              <button onClick={() => setIsAdding(false)} className="w-12 h-12 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition flex items-center justify-center"><i className="fas fa-times"></i></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   <div className="space-y-8">
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Name</label>
                          <input type="text" required className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 font-black outline-none focus:ring-4 focus:ring-emerald-100 transition"
                              value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price (ZMW)</label>
                              <input type="number" required className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 font-black outline-none focus:ring-4 focus:ring-emerald-100 transition"
                                  value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseInt(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sector</label>
                              <select className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 font-black outline-none focus:ring-4 focus:ring-emerald-100 transition"
                                  value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                                  <option>Agriculture</option><option>Mining</option><option>Electronics</option><option>Machinery</option><option>Real Estate</option>
                              </select>
                          </div>
                      </div>
                      <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-200 rounded-[3rem] p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition min-h-[15rem] bg-gray-50/30"
                      >
                          {newProduct.imageUrl ? (
                              <img src={newProduct.imageUrl} className="w-full h-full object-cover rounded-2xl shadow-xl" />
                          ) : (
                              <div className="text-center">
                                  <i className="fas fa-camera-retro text-3xl text-emerald-600 mb-4"></i>
                                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{analyzing ? 'AI Scanning...' : 'Drop Photo'}</p>
                              </div>
                          )}
                          <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} />
                      </div>
                   </div>

                   <div className="space-y-8 bg-gray-50 p-10 rounded-[3.5rem] border border-gray-100">
                      <h4 className="text-[10px] font-black uppercase text-emerald-700 tracking-widest">Contact Visibility</h4>
                      <div className="space-y-6">
                         <input type="text" placeholder="Mobile Number" className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 font-bold text-sm outline-none shadow-sm"
                            onChange={e => setNewProduct({...newProduct, contactInfo: {...newProduct.contactInfo, phone: e.target.value} as any})} />
                         <input type="text" placeholder="WhatsApp" className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 font-bold text-sm outline-none shadow-sm"
                            onChange={e => setNewProduct({...newProduct, contactInfo: {...newProduct.contactInfo, whatsapp: e.target.value} as any})} />
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Description</label>
                    <textarea className="w-full bg-gray-50 border border-gray-100 rounded-[2.5rem] px-8 py-6 font-bold text-sm h-32 outline-none focus:ring-4 focus:ring-emerald-100 transition resize-none"
                        value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                </div>

                <button type="submit" className="w-full py-8 bg-emerald-600 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl hover:bg-emerald-700 transition-all">List Commercial Asset</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
