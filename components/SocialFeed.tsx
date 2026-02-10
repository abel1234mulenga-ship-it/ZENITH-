
import React, { useState, useEffect } from 'react';
import { SocialPost, User } from '../types.ts';
import { backendService } from '../backendService.ts';

interface SocialFeedProps {
  user: User;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ user }) => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    const response = await backendService.fetchFeed('Lusaka');
    if (response.status === 'success' && response.data) {
      setPosts(response.data);
    } else {
      setError(response.message);
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
      {/* Feed Section */}
      <div className="lg:col-span-8 space-y-8">
        <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100 flex items-center gap-4">
          <img src={user.avatar} className="w-12 h-12 rounded-2xl shadow-sm" alt="" />
          <input 
            type="text" 
            placeholder="Share an update or location..." 
            className="flex-grow bg-gray-50 rounded-xl px-4 py-3 outline-none text-sm font-bold focus:ring-2 focus:ring-emerald-100 transition"
          />
          <button className="w-12 h-12 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 transition">
            <i className="fas fa-camera"></i>
          </button>
        </div>

        {loading && (
          <div className="text-center py-10">
            <i className="fas fa-circle-notch fa-spin text-emerald-600 text-2xl"></i>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mt-2">Updating Feed...</p>
          </div>
        )}

        {!loading && error && (
           <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100 text-center">
             <p className="text-red-500 font-bold text-xs">{error}</p>
             <button onClick={loadFeed} className="mt-2 text-[10px] font-black uppercase underline">Retry</button>
           </div>
        )}

        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden group">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={post.userAvatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                <div>
                  <h3 className="font-black text-sm text-gray-900">{post.userName}</h3>
                  <p className="text-[9px] font-bold text-gray-400 flex items-center gap-1">
                    <i className="fas fa-location-dot text-emerald-500"></i> {post.location} • {new Date(post.timestamp).getHours()}h ago
                  </p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-900"><i className="fas fa-ellipsis"></i></button>
            </div>
            
            {post.image && (
              <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                <img src={post.image} className="w-full h-full object-cover" alt="" />
                {post.isPromoted && (
                  <span className="absolute top-4 right-4 bg-white/90 backdrop-blur text-emerald-700 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">Promoted</span>
                )}
              </div>
            )}

            <div className="p-6 space-y-4">
              <p className="text-gray-800 font-medium leading-relaxed">{post.content}</p>
              
              <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                <button className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition group/like">
                  <i className="far fa-heart group-hover/like:fas"></i>
                  <span className="text-xs font-black">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition">
                  <i className="far fa-comment"></i>
                  <span className="text-xs font-black">{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-400 hover:text-emerald-500 transition ml-auto">
                  <i className="far fa-share-square"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trending & Discovery Sidebar */}
      <div className="lg:col-span-4 space-y-8">
        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[60px] opacity-20"></div>
          <h3 className="text-xl font-black mb-6 flex items-center gap-3">
            <i className="fas fa-fire text-orange-500"></i> Trending Places
          </h3>
          
          <div className="space-y-4">
             <p className="text-xs text-gray-500 italic">No trending data currently available.</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-lg border border-gray-100">
          <h3 className="text-lg font-black text-gray-900 mb-6">Discover</h3>
          <div className="flex flex-wrap gap-2">
            {['#LusakaFood', '#MiningTech', '#ZambiaArt', '#CopperbeltBiz', '#AgriExpo', '#WeekendVibes'].map(tag => (
              <span key={tag} className="px-4 py-2 bg-gray-50 rounded-full text-[10px] font-black text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition cursor-pointer">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialFeed;
