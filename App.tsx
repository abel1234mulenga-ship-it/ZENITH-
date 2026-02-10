
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
import AIChatbot from './components/AIChatbot.tsx';
import UserChat from './components/UserChat.tsx';
import SocialFeed from './components/SocialFeed.tsx';
import { groundedSearch } from './geminiService.ts';

const INITIAL_CONFIG: AppConfig = {
  listingFee: 25,
  promotionFee: 150,
  featuredFee: 500,
  commissionRate: 7.5,
  isRegistrationOpen: true,
  isAiEnabled: true,
  adminPasswordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
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
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    
    if (config.isAiEnabled) {
      groundedSearch("Top 5 trending commercial districts in Lusaka and Copperbelt for trade 2024")
        .then(res => setZambianMarkets(res.sources))
        .catch(err => {
          if (err?.status === 429) setApiError("High traffic. Some AI features may be throttled.");
        });
    }
    return () => clearTimeout(timer);
  }, [config.isAiEnabled]);

  const handleAuth = (authUser: User) => {
    setUser(authUser);
    if (authUser.role !== 'guest' && !users.find(u => u.id === authUser.id)) {
      setUsers([...users, authUser]);
    }
  };

  const processTransaction = (type: Transaction['type'], amount: number, userId: string) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId, amount, type, timestamp: Date.now(), status: 'completed'
    };
    setTransactions([newTx, ...transactions]);
  };

  const handleAddProduct = (p: Product) => {
    if (user?.role === 'guest') {
      alert("Please sign in as a merchant to list assets.");
      return;
    }
    setProducts([p, ...products]);
    processTransaction('listing_fee', config.listingFee, p.ownerId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-emerald-700 flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
          <div className="h-full bg-orange-500 animate-[loading_2s_linear_forwards]"></div>
        </div>
        <div className="z-10 text-center animate-in fade-in zoom-in duration-1000">
          <div className="w-32 h-32 md:w-44 md:h-44 bg-white rounded-[2rem] md:rounded-[4rem] flex items-center justify-center mx-auto shadow-2xl mb-8 md:mb-10 transform hover:scale-105 transition-transform">
            <i className="fas fa-bolt text-emerald-700 text-6xl md:text-8xl"></i>
          </div>
          <h1 className="text-4xl md:text-8xl font-black tracking-tighter uppercase mb-4">ZENITH <span className="text-orange-500">ZM</span></h1>
          <p className="text-sm md:text-xl font-bold text-emerald-100/80 tracking-[0.3em] md:tracking-[0.5em] uppercase animate-pulse">Master Trading Engine</p>
        </div>
        <style>{`@keyframes loading { 0% { width: 0%; } 100% { width: 100%; } }`}</style>
      </div>
    );
  }

  if (!user) return <AuthPage onAuth={handleAuth} config={config} />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Inter']">
      {apiError && (
        <div className="bg-orange-500 text-white px-6 py-2 text-center text-[10px] font-black uppercase tracking-[0.2em] z-[70]">
          <i className="fas fa-triangle-exclamation mr-2"></i> {apiError}
          <button onClick={() => setApiError(null)} className="ml-4 underline">Dismiss</button>
        </div>
      )}

      <Navbar activeView={view} setView={setView} user={user} onLogout={() => setUser(null)} config={config} onOpenShare={() => setIsShareModalOpen(true)} />
      
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8 pb-32 md:pb-40 max-w-7xl overflow-x-hidden">
        {view === 'hub' && <ServiceHub setView={setView} zambianMarkets={zambianMarkets} user={user} />}
        {view === 'marketplace' && <Marketplace products={products.filter(p => p.status === 'approved')} config={config} />}
        {view === 'services' && <LocalServices />}
        {view === 'logistics' && <Logistics />}
        {view === 'navigator' && <CityNavigator />}
        {view === 'feed' && <SocialFeed user={user} />}
        {/* Chat and Dashboard are protected in Navbar, but safeguard here */}
        {view === 'chat' && user.role !== 'guest' && <UserChat currentUser={user} />}
        {view === 'dashboard' && user.role !== 'guest' && (
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
            onUpdateProduct={(id, u) => setProducts(prev => prev.map(p => p.id === id ? {...p, ...u} : p))}
            onDeleteProduct={(id) => setProducts(products.filter(p => p.id !== id))}
            onUpdateUser={(id, updates) => setUsers(users.map(u => u.id === id ? {...u, ...updates} : u))}
            onDeleteUser={(id) => setUsers(users.filter(u => u.id !== id))}
          />
        )}
      </main>

      {/* Floating Global Triggers */}
      <div className="fixed bottom-6 right-4 md:bottom-12 md:right-12 flex flex-col gap-3 md:gap-4 z-50">
        {isChatOpen && (
          <div className="absolute bottom-20 md:bottom-24 right-0 w-[90vw] md:w-[400px] h-[500px] md:h-[600px] shadow-2xl animate-in slide-in-from-bottom-5">
             <AIChatbot onClose={() => setIsChatOpen(false)} />
          </div>
        )}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-14 h-14 md:w-20 md:h-20 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-4 border-white relative group ${isChatOpen ? 'bg-emerald-700' : 'bg-emerald-600'}`}
        >
          <i className={`fas ${isChatOpen ? 'fa-times' : 'fa-sparkles'} text-white text-xl md:text-3xl`}></i>
          <span className="absolute right-24 bg-gray-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none hidden md:block">Zenith Master AI</span>
        </button>
        <button 
          onClick={() => setIsShareModalOpen(true)}
          className="w-12 h-12 md:w-16 md:h-16 bg-orange-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-4 border-white group relative"
        >
          <i className="fas fa-share-nodes text-lg md:text-2xl"></i>
        </button>
      </div>

      {isShareModalOpen && <ShareModal onClose={() => setIsShareModalOpen(false)} userName={user?.name} />}
    </div>
  );
};

export default App;
