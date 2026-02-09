
import React, { useState } from 'react';
import { User, AppConfig, AppView } from '../types';
import { generateAppInvite } from '../geminiService';

interface NavbarProps {
  activeView: AppView;
  setView: (view: AppView) => void;
  user: User | null;
  onLogout: () => void;
  config: AppConfig;
}

const Navbar: React.FC<NavbarProps> = ({ activeView, setView, user, onLogout, config }) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleAppShare = async () => {
    setIsSharing(true);
    try {
      const inviteText = await generateAppInvite(user?.name || 'A Zenith User');
      const finalMsg = inviteText.replace('[LINK]', window.location.href);
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Zenith ZM Super-App',
            text: finalMsg,
            url: window.location.href,
          });
        } catch (err) {
          console.error('Share failed', err);
          fallbackShare(finalMsg);
        }
      } else {
        fallbackShare(finalMsg);
      }
    } catch (e) {
      alert("Sharing service temporarily unavailable.");
    } finally {
      setIsSharing(false);
    }
  };

  const fallbackShare = (msg: string) => {
    navigator.clipboard.writeText(msg);
    alert('Viral invite copied to clipboard! Share it on your WhatsApp Status or Facebook Timeline.');
  };

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
            { id: 'navigator', label: 'Explore' },
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
          <button 
            onClick={handleAppShare}
            disabled={isSharing}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 border border-emerald-500 disabled:opacity-50"
          >
            {isSharing ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-share-nodes"></i>}
            {isSharing ? 'Preparing...' : 'Share App'}
          </button>

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
