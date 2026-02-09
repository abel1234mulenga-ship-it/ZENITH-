
import React, { useState, useEffect } from 'react';
import { User, UserTier } from '../types';
import { fastResponse } from '../geminiService';

interface AuthPageProps {
  onAuth: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuth }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [method, setMethod] = useState<'email' | 'phone' | 'google'>('email');
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    phone: '', 
    name: '', 
    businessType: 'General Trade' 
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);

  const processingSteps = [
    "Initializing secure session...",
    "Verifying credentials...",
    "Connecting to Zambian Trade Registry...",
    "Setting up your Merchant Wallet...",
    "AI-optimizing your market visibility...",
    "Finalizing your Zenith ZM profile..."
  ];

  useEffect(() => {
    let interval: any;
    if (isProcessing && processStep < processingSteps.length) {
      interval = setInterval(() => {
        setProcessStep(prev => prev + 1);
      }, 1800);
    } else if (isProcessing && processStep === processingSteps.length) {
      completeAuth();
    }
    return () => clearInterval(interval);
  }, [isProcessing, processStep]);

  const completeAuth = async () => {
    const prompt = `Generate a 1-sentence welcome tip for a new Zambian business owner named ${formData.name || 'User'} who is starting a ${formData.businessType} business.`;
    const aiTip = await fastResponse(prompt);

    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name || (method === 'email' ? formData.email.split('@')[0] : 'Zambian Trader'),
      email: formData.email || 'user@zenith.zm',
      phone: formData.phone,
      role: 'user',
      tier: 'free', // New users start as free
      businessType: formData.businessType,
      walletBalance: 0, // Initial balance
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email || formData.phone || 'seed'}`
    };
    
    console.log("AI Market Tip:", aiTip);
    onAuth(mockUser);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup') {
      setIsProcessing(true);
      setProcessStep(0);
    } else {
      completeAuth();
    }
  };

  const socialLogin = () => {
    setIsProcessing(true);
    setProcessStep(2);
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
        <div className="w-full max-w-sm text-center space-y-12">
          <div className="relative mx-auto w-32 h-32">
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
            <div 
              className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"
              style={{ animationDuration: '1.5s' }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fas fa-shield-halved text-emerald-600 text-3xl animate-pulse"></i>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Processing Information</h2>
            <div className="space-y-3 text-left">
              {processingSteps.map((step, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center gap-3 text-sm font-bold transition-all duration-500 ${
                    idx < processStep ? 'text-emerald-600' : idx === processStep ? 'text-gray-900' : 'text-gray-200'
                  }`}
                >
                  <i className={`fas ${idx < processStep ? 'fa-check-circle' : idx === processStep ? 'fa-circle-notch fa-spin' : 'fa-circle'} text-[10px]`}></i>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 animate-pulse">
            <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">
              Securing {formData.name || 'Trader'}'s Business Environment
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-200/50 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-200/50 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white p-8 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
        <div className="text-center space-y-4 mb-10">
          <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-200 mb-6">
            <i className="fas fa-bolt text-white text-4xl"></i>
          </div>
          <h1 className="text-3xl font-black text-emerald-900 tracking-tight">
            {mode === 'signin' ? 'Welcome Back' : 'Join the Market'}
          </h1>
          <p className="text-gray-500 font-medium">Zambia's premier business engine.</p>
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
          <button 
            onClick={() => setMethod('email')}
            className={`flex-grow py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${method === 'email' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}
          >
            Email
          </button>
          <button 
            onClick={() => setMethod('phone')}
            className={`flex-grow py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${method === 'phone' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}
          >
            Mobile
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text" required placeholder="John Lungu"
                  className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-4 focus:ring-emerald-100 transition shadow-sm"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Industry Type</label>
                <select 
                  className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-4 focus:ring-emerald-100 transition shadow-sm appearance-none"
                  value={formData.businessType} onChange={e => setFormData({...formData, businessType: e.target.value})}
                >
                  <option>Agriculture & Tools</option>
                  <option>Construction Machinery</option>
                  <option>Electronics Trade</option>
                  <option>Logistics Services</option>
                  <option>General Retailing</option>
                </select>
              </div>
            </>
          )}

          {method === 'email' ? (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                type="email" required placeholder="name@zenith.zm"
                className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-4 focus:ring-emerald-100 transition shadow-sm"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Zambian Mobile Number</label>
              <div className="flex items-center bg-white border border-gray-100 rounded-2xl px-6 py-4 focus-within:ring-4 focus-within:ring-emerald-100 transition shadow-sm">
                <span className="text-gray-400 font-bold mr-3">+260</span>
                <input 
                  type="tel" required placeholder="977 000 000"
                  className="bg-transparent outline-none w-full font-bold"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" required placeholder="••••••••"
              className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-4 focus:ring-emerald-100 transition shadow-sm"
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-emerald-700 transition shadow-2xl shadow-emerald-200 flex items-center justify-center gap-3"
          >
            <span>{mode === 'signin' ? 'Verify & Enter' : 'Process My Account'}</span>
            <i className={`fas ${mode === 'signin' ? 'fa-chevron-right' : 'fa-wand-magic-sparkles'} text-xs`}></i>
          </button>
        </form>

        <div className="my-10 flex items-center gap-4">
          <div className="flex-grow h-px bg-gray-100"></div>
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Instant Connect</span>
          <div className="flex-grow h-px bg-gray-100"></div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={socialLogin}
            className="w-full py-4 border border-gray-100 rounded-2xl flex items-center justify-center gap-3 font-bold text-gray-600 hover:bg-gray-50 transition"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" className="w-5 h-5" alt="google" />
            <span>Google One-Tap</span>
          </button>
        </div>

        <div className="mt-12 text-center">
          <button 
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-sm font-bold text-emerald-600 hover:underline"
          >
            {mode === 'signin' ? "New Trader? Register Here" : "Already a Merchant? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
