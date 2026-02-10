import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, AIServiceMode } from '../types.ts';
import { proChatbotResponse, fastAIResponse, groundedSearch } from '../geminiService.ts';

interface AIChatbotProps {
  onClose: () => void;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ onClose }) => {
  const [mode, setMode] = useState<AIServiceMode>(AIServiceMode.THINKING);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', parts: [{ text: "Greetings. I am the Zenith Master Intelligence. I'm utilizing my high-reasoning Pro core. How can I architect your business success today?" }] }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      let responseText = '';
      if (mode === AIServiceMode.THINKING) {
        // Deep reasoning using Pro model with thinking tokens
        responseText = await proChatbotResponse(messages, currentInput);
      } else if (mode === AIServiceMode.GENERAL) {
        // Low latency using Lite model
        responseText = await fastAIResponse(currentInput);
      } else if (mode === AIServiceMode.SEARCH) {
        // Real-time search grounding
        const res = await groundedSearch(currentInput);
        responseText = res.text;
      }

      setMessages(prev => [...prev, { role: 'model', parts: [{ text: responseText }] }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Operational error. The intelligence matrix is reset. Please try again." }] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] shadow-2xl border border-emerald-100 overflow-hidden animate-in slide-in-from-bottom-10">
      <div className="p-6 bg-emerald-600 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <i className={`fas ${mode === AIServiceMode.THINKING ? 'fa-brain' : mode === AIServiceMode.SEARCH ? 'fa-globe' : 'fa-bolt'} text-xl`}></i>
          </div>
          <div>
            <h3 className="font-black text-sm tracking-tight">Zenith AI Master</h3>
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-100 opacity-80">
              {mode === AIServiceMode.THINKING ? 'Pro Core Active (Reasoning)' : mode === AIServiceMode.SEARCH ? 'Search Grounding' : 'Lite Core (Low Latency)'}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 hover:bg-white/10 rounded-full transition"><i className="fas fa-times"></i></button>
      </div>

      <div className="flex p-2 bg-gray-50 border-b border-gray-100 gap-2">
        {[
          { id: AIServiceMode.THINKING, label: 'Strategy', icon: 'fa-brain' },
          { id: AIServiceMode.SEARCH, label: 'Search', icon: 'fa-magnifying-glass' },
          { id: AIServiceMode.GENERAL, label: 'Fast', icon: 'fa-bolt' },
        ].map(m => (
          <button 
            key={m.id}
            onClick={() => setMode(m.id as AIServiceMode)}
            className={`flex-grow flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              mode === m.id ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100 hover:border-emerald-200'
            }`}
          >
            <i className={`fas ${m.icon}`}></i> {m.label}
          </button>
        ))}
      </div>

      <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto space-y-6 bg-gray-50/30">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-[2rem] shadow-sm ${
              msg.role === 'user' 
              ? 'bg-emerald-600 text-white rounded-tr-none' 
              : 'bg-white text-gray-800 border border-emerald-50 rounded-tl-none font-medium'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.parts[0].text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-emerald-50 flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Synthesizing...</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-gray-100">
        <div className="flex bg-gray-50 border border-gray-200 rounded-[2rem] px-6 py-2 items-center focus-within:ring-4 focus-within:ring-emerald-50 transition-all">
          <input 
            placeholder={mode === AIServiceMode.THINKING ? "Ask for a complex business plan..." : "How can I help?"}
            className="flex-grow bg-transparent outline-none py-4 text-sm font-bold"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              input.trim() && !loading ? 'bg-emerald-600 text-white shadow-xl hover:scale-110' : 'bg-gray-200 text-gray-400'
            }`}
          >
            <i className={`fas ${loading ? 'fa-circle-notch fa-spin' : 'fa-paper-plane'}`}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
