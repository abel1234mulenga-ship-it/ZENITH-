
import React, { useState, useEffect } from 'react';
import { User, AppConfig } from '../types';

interface AuthPageProps {
  onAuth: (user: User) => void;
  config: AppConfig;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuth, config }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'admin'>('signin');
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    name: '', 
    businessType: 'General Trade' 
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(0);

  const steps = [
    "Establishing Encrypted Bridge...",
    "Authenticating with Zambian Trade Registry...",
    "Verifying Merchant Credentials...",
    "Allocating Cloud Resources...",
    "Synchronizing Market Context..."
  ];

  const adminSteps = [
    "Initializing Owner Protocol...",
    "Decrypting Administrator Vault...",
    "Synchronizing Platform Governance...",
    `Authenticating ${config.ownerName}...`,
    "Opening Master Control Center..."
  ];

  useEffect(() => {
    if (isProcessing) {
      const activeSteps = mode === 'admin' ? adminSteps : steps;
      const interval = setInterval(() => {
        setStep(prev => {
          if (prev >= activeSteps.length - 1) {
            clearInterval(interval);
            completeAuth();
            return prev;
          }
          return prev + 1;
        });
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  const completeAuth = () => {
    const isAdminMode = mode === 'admin';
    const isOwnerEmail = formData.email.toLowerCase() === 'owner@zenith.zm';
    
    const mockUser: User = {
      id: (isAdminMode || isOwnerEmail) ? 'admin' : Math.random().toString(36).substr(2, 9),
      name: (isAdminMode || isOwnerEmail) ? (config.ownerName || 'Platform Owner') : (formData.name || 'Zambian Merchant'),
      email: isAdminMode ? 'owner@zenith.zm' : formData.email,
      passwordHash: config.adminPasswordHash,
      role: (isAdminMode || isOwnerEmail) ? 'admin' : 'vendor',
      tier: (isAdminMode || isOwnerEmail) ? 'enterprise' : 'free',
      walletBalance: (isAdminMode || isOwnerEmail) ? 1245800 : 0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${isAdminMode ? 'admin-abel' : formData.email}`,
      isSuspended: false,
      joinedAt: Date.now()
    };
    onAuth(mockUser);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
  };

  const currentSteps = mode === 'admin' ? adminSteps : steps;

  if (isProcessing) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-8 animate-in fade-in duration-500 ${mode === 'admin' ? 'bg-gray-950 text-emerald-400' : 'bg-white text-gray-900'}`}>
         <div className="w-full max-sm text-center space-y-12">
            <div className="relative mx-auto w-36 h-36">
               <div className={`absolute inset-0 border-4 rounded-full ${mode === 'admin' ? 'border-emerald-900' : 'border-emerald-50'}`}></div>
               <div className={`absolute inset-0 border-4 rounded-full border-t-transparent animate-spin ${mode === 'admin' ? 'border-emerald-400' : 'border-emerald-600'}`}></div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <i className={`fas ${mode === 'admin' ? 'fa-crown text-emerald-400' : 'fa-shield-halved text-emerald-600'} text-4xl animate-pulse`}></i>
               </div>
            </div>
            <div className="space-y-4">
               <h2 className={`text-2xl font-black uppercase tracking-tighter ${mode === 'admin' ? 'text-white' : 'text-gray-900'}`}>
                  {mode === 'admin' ? 'OWNER AUTHENTICATION' : 'Securing Access'}
               </h2>
               <div className="space-y-3 text-left">
                  {currentSteps.map((s, idx) => (
                    <div key={idx} className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${idx <= step ? (mode === 'admin' ? 'text-emerald-400' : 'text-emerald-600') : (mode === 'admin' ? 'text-gray-800' : 'text-gray-200')}`}>
                       <i className={`fas ${idx < step ? 'fa-check-circle' : idx === step ? 'fa-circle-notch fa-spin' : 'fa-circle'}`}></i>
                       <span>{s}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-1000 ${mode === 'admin' ? 'bg-black' : 'bg-emerald-50'}`}>
      <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] transition-all duration-1000 ${mode === 'admin' ? 'bg-emerald-900/30' : 'bg-emerald-200/50'}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] transition-all duration-1000 ${mode === 'admin' ? 'bg-gray-900/50' : 'bg-orange-200/50'}`}></div>

      <div className={`w-full max-w-md backdrop-blur-3xl rounded-[4rem] shadow-2xl border p-12 md:p-16 animate-in slide-in-from-bottom-10 duration-700 relative z-10 transition-all duration-1000 ${
        mode === 'admin' ? 'bg-gray-900/80 border-emerald-900/50' : 'bg-white/80 border-white'
      }`}>
        <div className="flex justify-center mb-10">
           <div className={`p-1 rounded-2xl flex gap-1 transition-colors ${mode === 'admin' ? 'bg-black' : 'bg-emerald-100/50'}`}>
              <button onClick={() => setMode('signin')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${mode !== 'admin' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>Merchant</button>
              <button onClick={() => setMode('admin')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'admin' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' : 'text-gray-400 hover:text-emerald-600'}`}>Owner</button>
           </div>
        </div>

        <div className="text-center mb-12">
           <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl mb-8 group hover:rotate-6 transition-all duration-700 ${mode === 'admin' ? 'bg-emerald-600 border border-emerald-400/30' : 'bg-emerald-600'}`}>
             <i className={`fas ${mode === 'admin' ? 'fa-crown text-white' : 'fa-bolt text-white'} text-4xl`}></i>
           </div>
           <h1 className={`text-4xl font-black tracking-tighter leading-none mb-3 transition-colors ${mode === 'admin' ? 'text-white' : 'text-gray-900'}`}>
             {mode === 'admin' ? 'GOD MODE' : 'ZENITH ZM'}
           </h1>
           <p className={`font-black uppercase tracking-[0.4em] text-[10px] ${mode === 'admin' ? 'text-emerald-500' : 'text-gray-400'}`}>
             {mode === 'admin' ? config.ownerTitle : 'Official Merchant Portal'}
           </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
           {mode === 'signup' && (
             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Identity</label>
                <input required type="text" placeholder="e.g. Lungu Agri-Works" className="w-full bg-white border border-gray-100 rounded-3xl px-8 py-5 font-bold outline-none focus:ring-4 focus:ring-emerald-100 transition shadow-sm"
                 value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
             </div>
           )}

           {mode !== 'admin' ? (
             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Merchant Email</label>
                <input required type="email" placeholder="trade@zenith.zm" className="w-full bg-white border border-gray-100 rounded-3xl px-8 py-5 font-bold outline-none focus:ring-4 focus:ring-emerald-100 transition shadow-sm"
                 value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
             </div>
           ) : (
             <div className="p-6 bg-emerald-950/30 border border-emerald-900/50 rounded-3xl mb-4 text-center">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Administrative Target</p>
                <p className="text-sm font-black text-white">owner@zenith.zm</p>
             </div>
           )}

           <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${mode === 'admin' ? 'text-emerald-600' : 'text-gray-400'}`}>
                {mode === 'admin' ? 'Master Secret Key' : 'Security Secret'}
              </label>
              <input required type="password" placeholder="••••••••" className={`w-full rounded-3xl px-8 py-5 font-bold outline-none focus:ring-4 transition shadow-sm ${mode === 'admin' ? 'bg-black border-emerald-900 text-white focus:ring-emerald-900' : 'bg-white border-gray-100 focus:ring-emerald-100'}`}
               value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
           </div>

           <button type="submit" className={`w-full py-6 rounded-[2rem] font-black text-xl transition-all shadow-2xl ${mode === 'admin' ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-900/40' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'}`}>
              {mode === 'admin' ? 'Unlock Control' : (mode === 'signin' ? 'Unlock Platform' : 'Register Asset')}
           </button>
        </form>

        <div className="mt-12 text-center space-y-4">
           {mode !== 'admin' ? (
             <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-xs font-black uppercase tracking-widest text-emerald-600 hover:underline">{mode === 'signin' ? 'Create new Merchant account' : 'Return to sign in'}</button>
           ) : (
             <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest leading-relaxed">Administrator Login: Restricted to {config.ownerName}</p>
           )}
           <div className="pt-8 border-t border-gray-50/10">
             <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${mode === 'admin' ? 'text-emerald-900' : 'text-gray-400'}`}>Platform Creator</p>
             <p className={`text-[11px] font-black uppercase tracking-[0.3em] ${mode === 'admin' ? 'text-emerald-500' : 'text-emerald-900'}`}>{config.ownerName}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
