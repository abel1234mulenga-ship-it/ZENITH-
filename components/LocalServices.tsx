
import React, { useState } from 'react';
import { mapsQuery } from '../geminiService';

const LocalServices: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{text: string, sources: any[] } | null>(null);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      // Mocking current location for demo
      const res = await mapsQuery(query, { lat: 40.7128, lng: -74.006 });
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-blue-900">Local Service Radar</h1>
        <p className="text-gray-500">Find tool repairs, rental centers, or logistics help powered by Google Maps intelligence.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl border border-blue-50 space-y-4">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="e.g., Best tool repair shops in Brooklyn"
            className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Locate'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['Repair Shops', 'Equipment Rental', 'Truck Logistics', 'Workshop Spaces'].map(hint => (
            <button 
              key={hint}
              onClick={() => setQuery(`Find ${hint} nearby`)}
              className="text-xs bg-blue-50 text-blue-700 py-2 rounded-lg font-bold hover:bg-blue-100 transition"
            >
              {hint}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
          <div className="prose max-w-none text-gray-700 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Gemini's Recommendations</h3>
            <div className="whitespace-pre-wrap">{result.text}</div>
          </div>
          
          {result.sources.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="font-bold text-sm text-gray-400 uppercase tracking-widest mb-4">Locations Found</h4>
              <div className="space-y-3">
                {result.sources.map((chunk: any, i: number) => (
                  <a 
                    key={i} 
                    href={chunk.maps?.uri} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-200 transition group"
                  >
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-4 text-blue-600 shadow-sm">
                      <i className="fas fa-map-marked-alt"></i>
                    </div>
                    <div>
                      <p className="font-bold text-blue-900 group-hover:underline">{chunk.maps?.title || 'View on Maps'}</p>
                      <p className="text-xs text-gray-400">Verified Location</p>
                    </div>
                    <i className="fas fa-external-link-alt ml-auto text-gray-300"></i>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Placeholder Map Visualization */}
      <div className="h-64 bg-gray-200 rounded-3xl overflow-hidden relative group">
        <img src="https://picsum.photos/seed/map/1200/600" className="w-full h-full object-cover opacity-50 grayscale" alt="map placeholder" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-white">
            <i className="fas fa-satellite text-blue-600 animate-pulse"></i>
            <span className="font-bold text-gray-800">Satellite Analysis Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalServices;
