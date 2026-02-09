
import React, { useState } from 'react';
import { generateAppInvite } from '../geminiService.ts';

interface ShareModalProps {
  onClose: () => void;
  userName?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ onClose, userName }) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const appUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToPlatform = async (platform: string) => {
    setLoading(true);
    try {
      const inviteText = await generateAppInvite(userName || 'A Zenith Merchant');
      const finalMsg = inviteText.replace('[LINK]', appUrl);
      const encodedMsg = encodeURIComponent(finalMsg);
      
      const links: Record<string, string> = {
        whatsapp: `https://wa.me/?text=${encodedMsg}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodedMsg}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodedMsg}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`
      };

      if (links[platform]) {
        window.open(links[platform], '_blank');
      }
    } catch (e) {
      console.error(e);
      alert("Sharing logic interrupted. Please copy the link instead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-gray-950/90 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[4rem] overflow-hidden shadow-2xl relative border border-white/20">
        <button onClick={onClose} className="absolute top-8 right-8 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 transition shadow-sm">
          <i className="fas fa-times"></i>
        </button>

        <div className="p-12 space-y-10">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-white text-3xl mx-auto shadow-2xl animate-bounce">
              <i className="fas fa-share-nodes"></i>
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Spread the Word</h2>
            <p className="text-gray-400 font-bold text-sm">Grow the Zenith ZM ecosystem by inviting your network.</p>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Universal Direct Link</label>
            <div className="flex bg-gray-50 border border-gray-100 rounded-[2rem] p-2 items-center group focus-within:ring-4 focus-within:ring-emerald-100 transition">
              <input readOnly value={appUrl} className="flex-grow bg-transparent px-6 py-3 font-bold text-gray-900 outline-none truncate" />
              <button 
                onClick={handleCopy}
                className={`px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${
                  copied ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-white hover:bg-emerald-600'
                }`}
              >
                {copied ? <i className="fas fa-check"></i> : 'Copy'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              { id: 'whatsapp', icon: 'fab fa-whatsapp', color: 'bg-[#25D366]', label: 'WhatsApp' },
              { id: 'facebook', icon: 'fab fa-facebook-f', color: 'bg-[#1877F2]', label: 'Facebook' },
              { id: 'twitter', icon: 'fab fa-x-twitter', color: 'bg-black', label: 'X' },
              { id: 'linkedin', icon: 'fab fa-linkedin-in', color: 'bg-[#0077B5]', label: 'LinkedIn' }
            ].map(p => (
              <button 
                key={p.id}
                onClick={() => shareToPlatform(p.id)}
                disabled={loading}
                className="flex flex-col items-center gap-3 group"
              >
                <div className={`w-16 h-16 ${p.color} text-white rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform ${loading ? 'opacity-50' : ''}`}>
                  <i className={`${p.icon} text-2xl`}></i>
                </div>
                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{p.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 text-center">
            <p className="text-[10px] text-emerald-800 font-black uppercase tracking-widest">
              <i className="fas fa-sparkles mr-2"></i>
              AI-Optimized Viral Invites Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
