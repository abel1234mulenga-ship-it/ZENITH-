
import React, { useState, useEffect, useRef } from 'react';
import { ChatThread, User } from '../types';
import { backendService } from '../backendService';

interface UserChatProps {
  currentUser: User;
}

const UserChat: React.FC<UserChatProps> = ({ currentUser }) => {
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Polling ref to manage intervals
  const pollInterval = useRef<any>(null);

  const fetchChats = async () => {
    try {
      const response = await backendService.fetchChats(currentUser);
      if (response.status === 'success' && response.data) {
        setThreads(response.data);
      }
    } catch (e) {
      console.error("Chat sync failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
    // Setup polling for real-time feel
    pollInterval.current = setInterval(fetchChats, 5000);
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [currentUser]);

  const activeThread = threads.find(t => t.id === activeThreadId);
  const participantId = activeThread?.participants[0].id;
  const isBlocked = participantId && blockedUsers.includes(participantId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeThreadId || isBlocked || sending) return;

    setSending(true);
    // Optimistic Update can be added here if needed, but we rely on backend response for single source of truth
    
    const response = await backendService.sendMessage(currentUser, activeThreadId, newMessage);

    if (response.status === 'success' && response.data) {
      setNewMessage('');
      fetchChats(); // Refresh immediately
    } else {
      alert(`Transmission Error: ${response.message} (${response.code})`);
    }
    setSending(false);
  };

  const toggleBlock = () => {
    if (!participantId) return;
    if (isBlocked) {
      setBlockedUsers(prev => prev.filter(id => id !== participantId));
    } else {
      setBlockedUsers(prev => [...prev, participantId]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
         <div className="text-center">
            <i className="fas fa-circle-notch fa-spin text-emerald-600 text-3xl"></i>
            <p className="text-[10px] font-black uppercase tracking-widest mt-4">Establishing Secure Uplink...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
      {/* Thread List - Hidden on mobile if thread active */}
      <div className={`w-full md:w-1/3 bg-white rounded-[2rem] shadow-xl border border-gray-100 flex flex-col overflow-hidden ${activeThreadId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Messages</h2>
          <div className="flex gap-2 mt-4">
            <button className="flex-grow py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">All</button>
            <button className="flex-grow py-2 bg-white text-gray-400 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest">Business</button>
            <button className="flex-grow py-2 bg-white text-gray-400 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest">Groups</button>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-2">
          {threads.map(thread => (
            <button
              key={thread.id}
              onClick={() => setActiveThreadId(thread.id)}
              className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all border ${
                activeThreadId === thread.id 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-white border-transparent hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <img src={thread.participants[0].avatar} className="w-12 h-12 rounded-xl object-cover" alt="" />
                {thread.unreadCount > 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>}
              </div>
              <div className="flex-grow text-left overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-black text-xs md:text-sm text-gray-900 truncate">{thread.participants[0].name}</span>
                  <span className="text-[9px] font-bold text-gray-400">{new Date(thread.lastTimestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p className={`text-xs truncate ${thread.unreadCount > 0 ? 'font-bold text-gray-800' : 'text-gray-400'}`}>{thread.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`w-full md:w-2/3 bg-white rounded-[2rem] shadow-xl border border-gray-100 flex flex-col overflow-hidden ${!activeThreadId ? 'hidden md:flex' : 'flex'}`}>
        {activeThread ? (
          <>
            <div className="p-4 md:p-6 border-b border-gray-50 flex items-center gap-4 bg-white z-10 shadow-sm">
              <button onClick={() => setActiveThreadId(null)} className="md:hidden w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full"><i className="fas fa-arrow-left text-gray-600"></i></button>
              <img src={activeThread.participants[0].avatar} className="w-10 h-10 rounded-xl" alt="" />
              <div>
                <h3 className="font-black text-sm text-gray-900">{activeThread.participants[0].name}</h3>
                <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Online
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <button onClick={toggleBlock} className={`w-10 h-10 rounded-xl transition ${isBlocked ? 'bg-red-500 text-white' : 'bg-gray-50 text-gray-400 hover:text-red-500'}`}>
                  <i className="fas fa-ban"></i>
                </button>
                <button className="w-10 h-10 bg-gray-50 rounded-xl text-gray-400 hover:text-emerald-600 transition"><i className="fas fa-video"></i></button>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50/50">
              <div className="text-center py-4">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-yellow-50 inline-block px-4 py-1 rounded-full border border-yellow-100">
                  <i className="fas fa-lock mr-2"></i> Messages are E2E Encrypted & Monitored for Safety
                </p>
              </div>
              {activeThread.messages.map(msg => {
                // Check multiple ID formats for robustness (mock DB vs real ID)
                const isMe = msg.senderId === currentUser.id || msg.senderId === 'currentUser';
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm ${
                      isMe 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                    }`}>
                      <p>{msg.text}</p>
                      <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-emerald-200' : 'text-gray-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        {isMe && <i className={`fas fa-check-double ml-1 ${msg.isRead ? 'text-white' : 'text-emerald-400'}`}></i>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white flex gap-3 relative">
              {isBlocked && (
                <div className="absolute inset-0 bg-gray-100/90 flex items-center justify-center z-20">
                  <p className="text-xs font-black text-red-500 uppercase tracking-widest">You have blocked this contact.</p>
                </div>
              )}
              <button type="button" className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-600 transition flex-shrink-0"><i className="fas fa-plus"></i></button>
              <input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a secure message..."
                className="flex-grow bg-gray-50 rounded-xl px-4 md:px-6 outline-none text-sm font-bold focus:ring-2 focus:ring-emerald-100 transition"
              />
              <button type="submit" disabled={sending} className="w-10 h-10 md:w-12 md:h-12 bg-emerald-600 text-white rounded-xl shadow-lg hover:scale-105 transition flex-shrink-0 flex items-center justify-center">
                {sending ? <i className="fas fa-circle-notch fa-spin text-xs"></i> : <i className="fas fa-paper-plane"></i>}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center opacity-30 p-8 text-center">
            <i className="fas fa-comments text-6xl md:text-8xl mb-6"></i>
            <h3 className="text-2xl font-black">Secure Comms</h3>
            <p className="font-bold max-w-xs mt-2">Select a thread to start encrypted communication with merchants or partners.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserChat;
