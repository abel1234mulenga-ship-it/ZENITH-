
import React from 'react';
import { User, AppConfig, AppView } from '../types.ts';

interface NavbarProps {
  activeView: AppView;
  setView: (view: AppView) => void;
  user: User | null;
  onLogout: () => void;
  config: AppConfig;
  onOpenShare: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeView, setView, user, onLogout, config, onOpenShare }) => {
  const isGuest = user?.role === 'guest';
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { id: 'hub', label: 'Hub' },
    { id: 'marketplace', label: 'Market' },
    { id: 'navigator', label: 'Explore' },
    { id: 'feed', label: 'Feed' },
    { id: 'logistics', label: 'Logistics' },
  ];

  // Only add privileged items if not a guest
  if (!isGuest) {
    navItems.splice(4, 0, { id: 'chat', label: 'Chat' }); // Insert Chat before Logistics
    navItems.push({ id: 'dashboard', label: 'Business' });
  }

  // Ensure Admin Portal is visible in the main nav list for mobile users
  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin Portal' });
  }

  return (
    <nav className="bg-white/95 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40 px-4">
      <div className="container mx-auto h-auto py-4 md:py-0 md:h-20 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setView('hub')}>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-100 group-hover:rotate-6 transition-transform">
              <i className="fas fa-bolt text-white text-xl md:text-2xl"></i>
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-xl md:text-2xl font-black tracking-tighter text-emerald-900">ZENITH</span>
              <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.4em] text-orange-600 flex items-center gap-1">
                AMC <span className="w-2 h-px bg-gray-200"></span> SuperApp
              </span>
            </div>
          </div>
          
          {/* Mobile User/Share moved to row for space efficiency if needed, but keeping separate for now */}
          <div className="flex md:hidden items-center gap-3">
             <button onClick={onOpenShare} className="w-8 h-8 bg-emerald-100 rounded-full text-emerald-600 flex items-center justify-center"><i className="fas fa-share-nodes text-xs"></i></button>
             {user && (
               <div className="relative" onClick={() => !isGuest && setView('dashboard')}>
                  <img src={user.avatar} className="w-8 h-8 rounded-xl border border-white shadow-sm" alt="avatar" />
                  <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 border-2 border-white rounded-full ${isGuest ? 'bg-gray-400' : 'bg-emerald-500'}`}></div>
               </div>
             )}
          </div>
        </div>

        <div className="w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <div className="flex items-center gap-2 bg-gray-50/80 p-1.5 rounded-2xl border border-gray-100 min-w-max">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setView(item.id as any)}
                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeView === item.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <button 
            onClick={onOpenShare}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 border border-emerald-500"
          >
            <i className="fas fa-share-nodes"></i>
            Share App
          </button>

          {isAdmin && (
             <button 
              onClick={() => setView('admin')}
              className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeView === 'admin' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-orange-50 text-orange-600 border border-orange-100'
              }`}
             >
               <i className="fas fa-crown"></i>
               Owner Portal
             </button>
          )}

          <div className="h-8 w-px bg-gray-100 hidden sm:block"></div>

          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-black text-gray-900 leading-none">{user.name}</p>
                <button onClick={onLogout} className="text-[9px] text-red-500 font-bold uppercase tracking-widest mt-1 hover:underline">
                  {isGuest ? 'Exit Guest Mode' : 'Sign Out'}
                </button>
              </div>
              <div className="relative group cursor-pointer" onClick={() => !isGuest && setView('dashboard')}>
                <img src={user.avatar} className="w-10 h-10 rounded-2xl border-2 border-white shadow-lg" alt="avatar" />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${isGuest ? 'bg-gray-400' : 'bg-emerald-500'}`}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
