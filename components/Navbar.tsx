
import React from 'react';
import { User, AppConfig } from '../types';

interface NavbarProps {
  activeView: string;
  setView: (view: 'hub' | 'marketplace' | 'services' | 'dashboard' | 'logistics' | 'admin') => void;
  user: User | null;
  onLogout: () => void;
  config: AppConfig;
}

const Navbar: React.FC<NavbarProps> = ({ activeView, setView, user, onLogout, config }) => {
  return (
    <nav className="bg-white/95 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40 px-4">
      <div className="container mx-auto h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setView('hub')}>
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-100 group-hover:rotate-6 transition-transform">
            <i className="fas fa-bolt text-white text-2xl"></i>
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-2xl font-black tracking-tighter text-emerald-900">ZENITH</span>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-orange-600 flex items-center gap-1">
              AMC <span className="w-2 h-px bg-gray-200"></span> SuperApp
            </span>
            <span className="text-[7px] font-bold text-gray-300 uppercase tracking-widest mt-0.5">By {config.ownerName}</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 bg-gray-50/80 p-1.5 rounded-2xl border border-gray-100">
          {[
            { id: 'hub', label: 'Hub' },
            { id: 'marketplace', label: 'Market' },
            { id: 'logistics', label: 'Logistics' },
            { id: 'dashboard', label: 'Business' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeView === item.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6">
          {user?.role === 'admin' && (
             <button 
              onClick={() => setView('admin')}
              className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeView === 'admin' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600 border border-orange-100'
              }`}
             >
               <i className="fas fa-crown"></i>
               Portal
             </button>
          )}

          <div className="h-8 w-px bg-gray-100 hidden sm:block"></div>

          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-black text-gray-900 leading-none">{user.name}</p>
                <button onClick={onLogout} className="text-[9px] text-red-500 font-bold uppercase tracking-widest mt-1 hover:underline">Sign Out</button>
              </div>
              <div className="relative group cursor-pointer" onClick={() => setView('dashboard')}>
                <img src={user.avatar} className="w-10 h-10 rounded-2xl border-2 border-white shadow-lg" alt="avatar" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
