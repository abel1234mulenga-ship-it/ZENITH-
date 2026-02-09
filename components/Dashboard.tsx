
import React, { useState, useRef } from 'react';
import { Product, User, UserTier } from '../types';
import { analyzeImage, generatePromoVideo, generateSocialAd } from '../geminiService';

interface DashboardProps {
  user: User;
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateUser: (updates: Partial<User>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, products, onAddProduct, onUpdateUser }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [isAdvertising, setIsAdvertising] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '', category: 'Agriculture', price: 0, description: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpgrade = (tier: UserTier) => {
    onUpdateUser({ tier });
    setShowSubscription(false);
  };

  const handleCreateVideo = async () => {
    if (!newProduct.name) return;
    setGeneratingVideo(true);
    try {
      const url = await generatePromoVideo(newProduct.name);
      setNewProduct(prev => ({ ...prev, videoUrl: url }));
    } catch (err) { console.error(err); } 
    finally { setGeneratingVideo(false); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      try {
        const analysis = await analyzeImage(base64, file.type);
        setNewProduct(prev => ({ 
          ...prev, 
          description: analysis,
          imageUrl: URL.createObjectURL(file)
        }));
      } catch (err) { console.error(err); } 
      finally { setAnalyzing(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProduct.name || 'Unnamed Product',
      category: newProduct.category || 'Agriculture',
      price: newProduct.price || 0,
      description: newProduct.description || '',
      imageUrl: newProduct.imageUrl || 'https://picsum.photos/400/300',
      videoUrl: newProduct.videoUrl,
      ownerId: user.id,
      location: { lat: -15.4167, lng: 28.2833, address: 'Lusaka' },
      isPromoted: user.tier !== 'free'
    };
    onAddProduct(product);
    setIsAdding(false);
    setNewProduct({});
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">{user.name}'s Console</h1>
          <div className="flex items-center gap-3 mt-1">
             <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-lg shadow-emerald-100">
               {user.tier} Account
             </span>
             <p className="text-gray-500 font-bold text-sm">Managing {user.businessType}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowSubscription(true)}
            className="bg-white border border-gray-200 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition shadow-sm"
          >
            Upgrade Tier
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-emerald-700 transition"
          >
            New Listing
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-10 rounded-[3rem] text-white shadow-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Available Capital</p>
          <p className="text-4xl font-black mb-10">ZMW {user.walletBalance.toLocaleString()}</p>
          <div className="flex gap-3">
            <button className="flex-grow py-3 bg-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition">Add Funds</button>
            <button className="flex-grow py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition shadow-xl">Withdraw</button>
          </div>
        </div>

        {[
          { label: 'Active Reach', val: '4.2K', trend: '+12%', icon: 'fa-bullhorn', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Market Sales', val: 'ZMW 8,400', trend: '+45%', icon: 'fa-cart-arrow-down', color: 'text-amber-600', bg: 'bg-amber-50' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
            <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-8 shadow-inner`}>
              <i className={`fas ${s.icon} text-xl`}></i>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-gray-900">{s.val}</p>
              <span className="text-[10px] font-black text-emerald-600">{s.trend}</span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {showSubscription && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-950/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-5xl rounded-[4rem] overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col md:flex-row">
            <div className="bg-gray-900 text-white p-12 md:w-80 flex flex-col justify-between">
              <div>
                <h3 className="text-3xl font-black mb-6">Choose Your Growth</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Upgrade to unlock AI-powered marketing and priority placement in Zambia's largest commerce hub.</p>
              </div>
              <button onClick={() => setShowSubscription(false)} className="text-gray-500 hover:text-white font-black text-[10px] uppercase tracking-widest text-left">Cancel & Return</button>
            </div>
            <div className="flex-grow p-12 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50">
               {[
                 { id: 'pro', name: 'Pro Merchant', price: '250', features: ['AI Ad Copy Gen', '7s Promo Videos', '3% Commission Cap', 'Verified Badge'], color: 'bg-blue-600' },
                 { id: 'enterprise', name: 'Enterprise', price: '1200', features: ['All Pro Features', 'Featured Banner Placement', '1% Commission Cap', 'Dedicated Ops Support'], color: 'bg-emerald-600' }
               ].map(tier => (
                 <div key={tier.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all flex flex-col justify-between group">
                    <div>
                       <h4 className="font-black text-xl mb-2">{tier.name}</h4>
                       <p className="text-3xl font-black mb-8">ZMW {tier.price}<span className="text-xs text-gray-400 font-bold tracking-normal">/mo</span></p>
                       <ul className="space-y-4">
                          {tier.features.map(f => (
                            <li key={f} className="flex items-center gap-3 text-xs font-bold text-gray-500">
                               <i className="fas fa-check-circle text-emerald-500"></i>
                               {f}
                            </li>
                          ))}
                       </ul>
                    </div>
                    <button 
                      onClick={() => handleUpgrade(tier.id as UserTier)}
                      className={`w-full mt-10 py-5 ${tier.color} text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl group-hover:scale-105 transition-transform`}
                    >
                      Activate {tier.id}
                    </button>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}

      {/* Existing modals for adding products go here, but with enhanced UI similar to above... */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-black text-xl text-gray-900">Marketplace Portfolio</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Listing</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">ROI Stats</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Promotion</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={p.imageUrl} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" />
                      <div>
                        <p className="font-bold text-gray-900">{p.name}</p>
                        <p className="text-[10px] font-black text-emerald-600">ZMW {p.price}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-gray-900">{p.clicks || 0} Clicks</span>
                       <span className="text-[10px] font-bold text-gray-400">{p.sales || 0} Conversion</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {p.isPromoted ? (
                      <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-full uppercase tracking-widest border border-blue-100">Active Ad</span>
                    ) : (
                      <button className="text-[9px] font-black text-gray-300 uppercase hover:text-blue-600 transition tracking-widest">Boost Now</button>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-gray-300 hover:text-red-500 transition"><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
