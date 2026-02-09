
import React, { useState, useEffect } from 'react';
import { Product, User } from './types';
import Navbar from './components/Navbar';
import Marketplace from './components/Marketplace';
import Dashboard from './components/Dashboard';
import LocalServices from './components/LocalServices';
import ServiceHub from './components/ServiceHub';
import Logistics from './components/Logistics';
import LiveAssistant from './components/LiveAssistant';
import AdminPanel from './components/AdminPanel';
import AuthPage from './components/AuthPage';
import { marketSearch } from './geminiService';

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Industrial Drill Press', category: 'Machinery', price: 4500, description: 'Heavy duty workshop drill press for Copperbelt mining ops.', imageUrl: 'https://picsum.photos/seed/drill/400/300', ownerId: 'v1', location: { lat: -15.4167, lng: 28.2833, address: 'Lusaka' }, isFeatured: true, isPromoted: true },
  { id: '2', name: 'Solar Inverter 5kVA', category: 'Electronics', price: 12850, description: 'Reliable power for Zambian enterprises. Hybrid model.', imageUrl: 'https://picsum.photos/seed/solar/400/300', ownerId: 'v1', location: { lat: -12.9667, lng: 28.6333, address: 'Ndola' }, isPromoted: false },
  { id: '3', name: 'Zambian Maize (50kg Bag)', category: 'Agriculture', price: 340, description: 'Premium white maize from Eastern Province.', imageUrl: 'https://picsum.photos/seed/maize/400/300', ownerId: 'v2', location: { lat: -15.4167, lng: 28.2833, address: 'Lusaka' }, isFeatured: false, isPromoted: true }
];

const App: React.FC = () => {
  const [view, setView] = useState<'hub' | 'marketplace' | 'services' | 'dashboard' | 'logistics' | 'admin'>('hub');
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [zambianMarkets, setZambianMarkets] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000); // Faster splash for UX
    const fetchMarkets = async () => {
      try {
        const result = await marketSearch("Major trading hubs in Lusaka and Copperbelt.");
        if (result.sources) setZambianMarkets(result.sources);
      } catch (error) { console.error(error); }
    };
    fetchMarkets();
    return () => clearTimeout(timer);
  }, []);

  const handleUpdateUser = (updates: Partial<User>) => {
    if (user) setUser({ ...user, ...updates });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#006F41] flex flex-col items-center justify-center text-white overflow-hidden p-6 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-white/10 overflow-hidden">
          <div className="h-full bg-[#EF7D00] animate-[loading_2s_linear_forwards]"></div>
        </div>
        <div className="z-10 text-center space-y-8 animate-in fade-in zoom-in duration-1000">
          <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl mb-8 transform hover:rotate-12 transition-transform">
            <i className="fas fa-bolt text-[#006F41] text-6xl"></i>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">ZENITH <span className="text-[#EF7D00]">ZM</span></h1>
            <p className="text-xl md:text-2xl font-black text-emerald-100/90 tracking-[0.3em] uppercase animate-pulse">Launching Commerce...</p>
          </div>
        </div>
        <style>{`@keyframes loading { 0% { width: 0%; } 100% { width: 100%; } }`}</style>
      </div>
    );
  }

  if (!user) return <AuthPage onAuth={setUser} />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Inter']">
      <Navbar activeView={view} setView={setView} user={user} onLogout={() => setUser(null)} />
      <main className="flex-grow container mx-auto px-4 py-6 pb-32 max-w-7xl">
        {view === 'hub' && <ServiceHub setView={setView} zambianMarkets={zambianMarkets} />}
        {view === 'marketplace' && <Marketplace products={products} />}
        {view === 'services' && <LocalServices />}
        {view === 'logistics' && <Logistics />}
        {view === 'dashboard' && (
          <Dashboard 
            user={user} 
            products={products.filter(p => p.ownerId === user.id || user.role === 'admin')}
            onAddProduct={(p) => setProducts([p, ...products])}
            onUpdateUser={handleUpdateUser}
          />
        )}
        {view === 'admin' && user.role === 'admin' && <AdminPanel />}
      </main>
      <button 
        onClick={() => setIsLiveOpen(true)}
        className="fixed bottom-10 right-10 w-20 h-20 bg-gradient-to-tr from-emerald-600 to-green-800 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20"></div>
        <i className="fas fa-microphone-lines text-3xl"></i>
      </button>
      {isLiveOpen && <LiveAssistant onClose={() => setIsLiveOpen(false)} />}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-gray-100 px-10 py-6 flex justify-around items-center z-40 md:hidden shadow-2xl rounded-t-[3rem]">
        {[
          { id: 'hub', icon: 'fa-house', label: 'Home' },
          { id: 'marketplace', icon: 'fa-store', label: 'Market' },
          { id: 'logistics', icon: 'fa-truck-fast', label: 'Logistics' },
          { id: 'dashboard', icon: 'fa-user', label: 'Console' }
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => setView(item.id as any)} 
            className={`flex flex-col items-center gap-1 transition-all ${view === item.id ? 'text-emerald-600 scale-110' : 'text-gray-400'}`}
          >
            <i className={`fas ${item.icon} text-2xl`}></i>
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
