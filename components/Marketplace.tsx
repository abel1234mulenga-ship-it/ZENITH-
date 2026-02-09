
import React, { useState } from 'react';
import { Product } from '../types';

interface MarketplaceProps {
  products: Product[];
}

const Marketplace: React.FC<MarketplaceProps> = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', 'Agriculture', 'Mining', 'Electronics', 'Fashion', 'Machinery', 'Real Estate', 'Food & Poultry'];
  
  const promoted = products.filter(p => p.isPromoted).slice(0, 4);
  const standard = products.filter(p => 
    (category === 'All' || p.category === category) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-1000">
      {/* Search & Hero Placement */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Zambian Open Market</h1>
            <p className="text-gray-500 font-medium mt-1">Discover high-quality assets across the hub.</p>
          </div>
          <div className="flex bg-white rounded-2xl shadow-xl border border-gray-100 px-6 py-4 w-full md:w-[450px] focus-within:ring-4 focus-within:ring-emerald-50 transition-all">
            <i className="fas fa-search text-gray-300 self-center mr-4"></i>
            <input 
              type="text" 
              placeholder="Search tools, land, or machinery..."
              className="bg-transparent outline-none w-full text-sm font-bold placeholder:text-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto space-x-3 pb-4 scrollbar-hide">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-8 py-3 rounded-2xl whitespace-nowrap font-black text-[10px] uppercase tracking-widest transition-all shadow-sm ${
                category === cat ? 'bg-emerald-600 text-white shadow-emerald-300' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sponsored Banner Placement (Static Mock for Ad Revenue Simulation) */}
      <div className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl border border-white/5">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/adbanner/1200/400')] bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent"></div>
        <div className="relative z-10 max-w-lg">
           <span className="bg-emerald-600 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block shadow-lg">SPONSORED</span>
           <h2 className="text-3xl font-black mb-4">Enterprise Farming Tech</h2>
           <p className="text-gray-300 font-medium mb-8 leading-relaxed italic">"Modernizing Zambian agriculture through high-performance tools and AI logistics."</p>
           <button className="px-10 py-4 bg-white text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition shadow-2xl">
              Explore Catalog
           </button>
        </div>
      </div>

      {/* Promoted Listings Section */}
      {promoted.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">Premium Picks</h2>
            <div className="h-px bg-gray-100 flex-grow"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {promoted.map(p => (
              <ProductCard key={p.id} product={p} isPromoted />
            ))}
          </div>
        </section>
      )}

      {/* Main Grid */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">All Listings</h2>
          <div className="h-px bg-gray-100 flex-grow"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {standard.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
};

const ProductCard: React.FC<{ product: Product, isPromoted?: boolean }> = ({ product, isPromoted }) => (
  <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all group relative flex flex-col h-full">
    <div className="relative aspect-[4/3] overflow-hidden">
      <img 
        src={product.imageUrl} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        alt={product.name} 
      />
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {isPromoted && (
          <span className="bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg border border-white/20">PROMOTED</span>
        )}
        {product.isFeatured && (
          <span className="bg-orange-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">FEATURED</span>
        )}
      </div>
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-black text-gray-900 group-hover:text-emerald-600 transition line-clamp-1">{product.name}</h3>
      </div>
      <p className="font-black text-emerald-700 text-lg mb-4">ZMW {product.price.toLocaleString()}</p>
      <p className="text-gray-400 text-[11px] font-medium line-clamp-2 mb-6 h-8">{product.description}</p>
      
      <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-400 text-[9px] font-black uppercase tracking-widest">
          <i className="fas fa-location-dot text-emerald-500"></i>
          {product.location.address}
        </div>
        <button className="w-10 h-10 bg-gray-50 text-gray-900 rounded-xl hover:bg-emerald-600 hover:text-white transition flex items-center justify-center">
          <i className="fas fa-cart-plus text-xs"></i>
        </button>
      </div>
    </div>
  </div>
);

export default Marketplace;
