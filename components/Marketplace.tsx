
import React, { useState } from 'react';
import { Product } from '../types';

interface MarketplaceProps {
  products: Product[];
  config: any;
}

const Marketplace: React.FC<MarketplaceProps> = ({ products, config }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', 'Agriculture', 'Mining', 'Electronics', 'Fashion', 'Machinery', 'Real Estate', 'Logistics'];
  
  const promoted = products.filter(p => p.isPromoted).slice(0, 4);
  const standard = products.filter(p => 
    (category === 'All' || p.category === category) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <h1 className="text-6xl font-black text-gray-900 tracking-tighter leading-none mb-4">The Zenith Market</h1>
            <p className="text-gray-500 font-bold text-xl">Connecting Zambia's leading merchants and traders.</p>
          </div>
          <div className="flex bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 px-8 py-5 w-full md:w-[500px] focus-within:ring-8 focus-within:ring-emerald-50 transition-all group">
            <i className="fas fa-search text-gray-300 self-center mr-6 text-xl group-focus-within:text-emerald-500 transition-colors"></i>
            <input 
              type="text" 
              placeholder="Search assets or merchants..."
              className="bg-transparent outline-none w-full text-lg font-bold placeholder:text-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex overflow-x-auto space-x-4 pb-6 scrollbar-hide">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-10 py-4 rounded-3xl whitespace-nowrap font-black text-xs uppercase tracking-[0.2em] transition-all shadow-md ${
                category === cat ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Global Ad Banner */}
      <div className="bg-gray-950 rounded-[5rem] p-16 text-white relative overflow-hidden group shadow-[0_50px_100px_rgba(0,0,0,0.2)] border border-white/5">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1600&h=600')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-[2000ms]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent"></div>
        <div className="relative z-10 max-w-2xl space-y-8">
           <span className="bg-orange-500 text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.4em] mb-6 inline-block shadow-2xl border border-white/20">Market Spotlight</span>
           <h2 className="text-6xl font-black tracking-tighter leading-tight">Zambian Trade Network 2025</h2>
           <p className="text-gray-300 text-xl font-medium leading-relaxed italic">"The digital bridge between local production and global demand."</p>
           <button onClick={() => setCategory('Machinery')} className="px-12 py-6 bg-white text-gray-950 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-emerald-600 hover:text-white transition shadow-2xl">
              Browse Heavy Duty
           </button>
        </div>
      </div>

      {promoted.length > 0 && (
        <section className="space-y-10">
          <div className="flex items-center gap-6">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.6em]">Promoted Listings</h2>
            <div className="h-px bg-gray-100 flex-grow"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {promoted.map(p => (
              <ProductCard key={p.id} product={p} isPromoted />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-10">
        <div className="flex items-center gap-6">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.6em]">Market Discovery</h2>
          <div className="h-px bg-gray-100 flex-grow"></div>
        </div>
        {standard.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {standard.map(p => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-gray-50 rounded-[4rem]">
                <i className="fas fa-search text-gray-200 text-6xl mb-6"></i>
                <p className="text-gray-500 font-black text-xl tracking-tight uppercase">No assets found for "{searchTerm}"</p>
            </div>
        )}
      </section>
    </div>
  );
};

const ProductCard: React.FC<{ product: Product, isPromoted?: boolean }> = ({ product, isPromoted }) => {
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="bg-white rounded-[4rem] overflow-hidden shadow-xl border border-gray-100 hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all group relative flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={product.imageUrl} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
          alt={product.name} 
        />
        <div className="absolute top-6 left-6 flex flex-col gap-3">
          {isPromoted && (
            <span className="bg-blue-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-2xl border border-white/20">Promoted</span>
          )}
          {product.isFeatured && (
            <span className="bg-emerald-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-2xl">Featured</span>
          )}
        </div>
      </div>
      <div className="p-10 flex flex-col flex-grow relative">
        <h3 className="font-black text-gray-900 group-hover:text-emerald-600 transition text-2xl line-clamp-1 mb-2">{product.name}</h3>
        <p className="font-black text-emerald-700 text-3xl mb-6">ZMW {product.price.toLocaleString()}</p>
        <p className="text-gray-400 text-sm font-medium line-clamp-2 mb-10 h-10 leading-relaxed">{product.description}</p>
        
        {/* Contact Overlay */}
        {showContact && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8 animate-in fade-in duration-300 rounded-[4rem]">
             <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-8">Direct Merchant Contact</h4>
             <div className="grid grid-cols-3 gap-6 w-full max-w-[240px]">
                {product.contactInfo.phone && (
                  <a href={`tel:${product.contactInfo.phone}`} title="Call Now" className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition shadow-lg">
                    <i className="fas fa-phone"></i>
                  </a>
                )}
                {product.contactInfo.whatsapp && (
                  <a href={`https://wa.me/${product.contactInfo.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" title="WhatsApp" className="w-14 h-14 bg-green-500 text-white rounded-2xl flex items-center justify-center hover:bg-green-600 transition shadow-lg">
                    <i className="fab fa-whatsapp text-2xl"></i>
                  </a>
                )}
                {product.contactInfo.facebook && (
                  <a href={product.contactInfo.facebook.startsWith('http') ? product.contactInfo.facebook : `https://facebook.com/${product.contactInfo.facebook}`} target="_blank" rel="noreferrer" title="Facebook" className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition shadow-lg">
                    <i className="fab fa-facebook-f text-xl"></i>
                  </a>
                )}
                {product.contactInfo.instagram && (
                  <a href={`https://instagram.com/${product.contactInfo.instagram}`} target="_blank" rel="noreferrer" title="Instagram" className="w-14 h-14 bg-pink-600 text-white rounded-2xl flex items-center justify-center hover:bg-pink-700 transition shadow-lg">
                    <i className="fab fa-instagram text-2xl"></i>
                  </a>
                )}
                {product.contactInfo.messenger && (
                  <a href={`https://m.me/${product.contactInfo.messenger}`} target="_blank" rel="noreferrer" title="Messenger" className="w-14 h-14 bg-blue-400 text-white rounded-2xl flex items-center justify-center hover:bg-blue-500 transition shadow-lg">
                    <i className="fab fa-facebook-messenger text-2xl"></i>
                  </a>
                )}
                <button onClick={() => setShowContact(false)} className="w-14 h-14 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-gray-200 transition">
                  <i className="fas fa-times"></i>
                </button>
             </div>
             <p className="mt-8 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Secured by Zenith Encryption</p>
          </div>
        )}

        <div className="mt-auto pt-8 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3 text-gray-400 text-[10px] font-black uppercase tracking-widest">
            <i className="fas fa-location-dot text-emerald-500 text-sm"></i>
            {product.location.address}
          </div>
          <button 
            onClick={() => setShowContact(true)}
            className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition shadow-lg shadow-emerald-100"
          >
            Contact Merchant
          </button>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
