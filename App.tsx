
import React, { useState, useEffect } from 'react';
import { Product, User, AppConfig, Transaction, AppView } from './types.ts';
import Navbar from './components/Navbar.tsx';
import Marketplace from './components/Marketplace.tsx';
import Dashboard from './components/Dashboard.tsx';
import LocalServices from './components/LocalServices.tsx';
import ServiceHub from './components/ServiceHub.tsx';
import Logistics from './components/Logistics.tsx';
import CityNavigator from './components/CityNavigator.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import AuthPage from './components/AuthPage.tsx';
import ShareModal from './components/ShareModal.tsx';
import { marketSearch } from './geminiService.ts';

const INITIAL_CONFIG: AppConfig = {
  listingFee: 25,
  promotionFee: 150,
  featuredFee: 500,
  commissionRate: 7.5,
  isRegistrationOpen: true,
  isAiEnabled: true,
  adminPasswordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // 'admin123'
  ownerName: 'Abel Mulenga Chinanda',
  ownerTitle: 'Platform Administrator'
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('hub');
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [config, setConfig] = useState<AppConfig>(INITIAL_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [zambianMarkets, setZambianMarkets] = useState<any[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    
    const cachedMarkets = localStorage.getItem('zenith_market_trends');
    if (cachedMarkets) {
      setZambianMarkets(JSON.parse(cachedMarkets));
    } else if (config.isAiEnabled) {
      marketSearch("Current trending commercial sectors in Lusaka 2024")
        .then(res => {
          setZambianMarkets(res.sources);
          localStorage.setItem('zenith_market_trends', JSON.stringify(res.sources));
        })
        .catch(err => {
          console.error("Market search failed:", err);
          if (err?.status === 429) setApiError("System is under heavy load. AI features may be limited.");
        });
    }
    return () => clearTimeout(timer);
  }, [config.isAiEnabled]);

  const handleAuth = (authUser: User) => {
    setUser(authUser);
    if (!users.find(u => u.id === authUser.id)) {
      setUsers([...users, authUser]);
    }
  };

  const processTransaction = (type: Transaction['type'], amount: number, userId: string) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      amount,
      type,
      timestamp: Date.now(),
      status: 'completed'
    };
    setTransactions([newTx, ...transactions]);
  };

  const handleAddProduct = (p: Product) => {
    setProducts([p, ...products]);
    processTransaction('listing_fee', config.listingFee, p.ownerId);
  };

  const handleUpdateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#006F41] flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
          <div className="h-full bg-[#EF7D00] animate-[loading_2s_linear_forwards]"></div>
        </div>
        <div className="z-10 text-center animate-in fade-in zoom-in duration-1000">
          <div className="w-44 h-44 bg-white rounded-[3.5rem] flex items-center justify-center mx-auto shadow-[0_20px_60px_rgba(0,0,0,0.3)] mb-10 transform hover:scale-105 transition-transform">
            <i className="fas fa-bolt text-[#006F41] text-8xl"></i>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-4">ZENITH <span className="text-[#EF7D00]">ZM</span></h1>
          <p className="text-xl font-bold text-emerald-100/80 tracking-[0.5em] uppercase animate-pulse mb-8">Africa's Digital Trade Engine</p>
          <div className="pt-8 border-t border-white/10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Created by</p>
            <p className="text-sm font-black text-white uppercase tracking-[0.2em] mt-2">{config.ownerName}</p>
          </div>
        </div>
        <style>{`@keyframes loading { 0% { width: 0%; } 100% { width: 100%; } }`}</style>
      </div>
    );
  }

  if (!user) return <AuthPage onAuth={handleAuth} config={config} />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Inter'] selection:bg-emerald-100 selection:text-emerald-900">
      {apiError && (
        <div className="bg-orange-500 text-white px-6 py-2 text-center text-[10px] font-black uppercase tracking-[0.2em] z-[70]">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          {apiError}
          <button onClick={() => setApiError(null)} className="ml-4 underline">Dismiss</button>
        </div>
      )}

      {user.role === 'admin' && (
        <div className="bg-gray-950 text-white px-6 py-2.5 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/10 z-[60]">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Owner Active</span>
            <span className="text-gray-500">Approvals: {products.filter(p => p.status === 'pending').length}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/40">Creator: {config.ownerName}</span>
            <button onClick={() => setView('admin')} className="bg-emerald-600 px-4 py-1 rounded-full hover:bg-emerald-500 transition shadow-lg">Open Control Center</button>
          </div>
        </div>
      )}

      <Navbar activeView={view} setView={setView} user={user} onLogout={() => setUser(null)} config={config} onOpenShare={() => setIsShareModalOpen(true)} />
      
      <main className="flex-grow container mx-auto px-4 py-8 pb-40 max-w-7xl">
        <div className="animate-in fade-in duration-700">
          {view === 'hub' && <ServiceHub setView={setView} zambianMarkets={zambianMarkets} user={user} />}
          {view === 'marketplace' && <Marketplace products={products.filter(p => p.status === 'approved')} config={config} />}
          {view === 'services' && <LocalServices />}
          {view === 'logistics' && <Logistics />}
          {view === 'navigator' && <CityNavigator />}
          {view === 'dashboard' && (
            <Dashboard 
              user={user} 
              products={products.filter(p => p.ownerId === user.id)}
              onAddProduct={handleAddProduct}
              onUpdateUser={(updates) => setUser({ ...user, ...updates })}
              onDeleteProduct={(id) => setProducts(products.filter(p => p.id !== id))}
              config={config}
            />
          )}
          {view === 'admin' && user.role === 'admin' && (
            <AdminPanel 
              config={config}
              onUpdateConfig={setConfig}
              products={products}
              users={users}
              transactions={transactions}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={(id) => setProducts(products.filter(p => p.id !== id))}
              onUpdateUser={(id, updates) => setUsers(users.map(u => u.id === id ? {...u, ...updates} : u))}
              onDeleteUser={(id) => setUsers(users.filter(u => u.id !== id))}
            />
          )}
        </div>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-32 right-6 md:bottom-12 md:right-12 flex flex-col gap-4 z-50">
        <button 
          onClick={() => setIsShareModalOpen(true)}
          className="w-16 h-16 bg-orange-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-4 border-white group relative"
        >
          <i className="fas fa-share-nodes text-2xl"></i>
          <span className="absolute right-20 bg-gray-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">Share Platform</span>
        </button>
        <button 
          onClick={() => setView('hub')} 
          className="w-20 h-20 bg-gradient-to-tr from-[#006F41] to-[#004D2D] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-4 border-white group relative"
        >
          <i className="fas fa-headset text-3xl"></i>
          <span className="absolute right-24 bg-gray-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">Trade Assistant</span>
        </button>
      </div>

      {isShareModalOpen && <ShareModal onClose={() => setIsShareModalOpen(false)} userName={user?.name} />}

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-3xl border-t border-gray-100 px-8 py-6 flex justify-around items-center z-40 md:hidden shadow-[0_-15px_40px_rgba(0,0,0,0.05)] rounded-t-[3.5rem]">
        {[
          { id: 'hub', icon: 'fa-house-chimney', label: 'Home' },
          { id: 'marketplace', icon: 'fa-store', label: 'Trade' },
          { id: 'navigator', icon: 'fa-map-location-dot', label: 'Explore' },
          { id: 'dashboard', icon: 'fa-user-tie', label: 'Console' }
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => setView(item.id as any)} 
            className={`flex flex-col items-center gap-2 transition-all ${view === item.id ? 'text-emerald-600 scale-110' : 'text-gray-400'}`}
          >
            <div className={`p-3 rounded-2xl transition-colors ${view === item.id ? 'bg-emerald-50' : 'bg-transparent'}`}>
              <i className={`fas ${item.icon} text-xl`}></i>
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
