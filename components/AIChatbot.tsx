
import React, { useState, useEffect, useRef } from 'react';
import { AIServiceMode, ChatMessage } from '../types';
import { thinkingResponse, marketSearch, fastResponse, generateTTS, decodeAudio, decodeAudioData } from '../geminiService';

interface AIChatbotProps {
  onClose: () => void;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ onClose }) => {
  const [mode, setMode] = useState<AIServiceMode>(AIServiceMode.GENERAL);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', parts: [{ text: "Hi! I'm your Zenith AI Assistant. How can I help you grow your tool business today?" }] }
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
    setInput('');
    setLoading(true);

    try {
      let responseText = '';
      if (mode === AIServiceMode.THINKING) {
        responseText = await thinkingResponse(input);
      } else if (mode === AIServiceMode.SEARCH) {
        const res = await marketSearch(input);
        responseText = res.text;
      } else {
        responseText = await fastResponse(input);
      }

      setMessages(prev => [...prev, { role: 'model', parts: [{ text: responseText }] }]);
    } catch (err: any) {
      console.error(err);
      let errorText = "Sorry, I encountered an error processing that request.";
      if (err?.message?.includes('429') || err?.status === 429) {
        errorText = "We're experiencing high traffic right now. Please wait a moment and try your request again.";
      }
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: errorText }] }]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Correctly play raw PCM audio data from the Gemini TTS API
   */
  const handleSpeak = async (text: string) => {
    try {
      const audioBase64 = await generateTTS(text);
      if (audioBase64) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const decoded = decodeAudio(audioBase64);
        const buffer = await decodeAudioData(decoded, audioCtx, 24000, 1);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start();
        console.debug("Playing raw PCM audio for response");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden animate-in slide-in-from-bottom-10">
      {/* Header */}
      <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <i className="fas fa-sparkles"></i>
          </div>
          <div>
            <h3 className="font-bold text-sm">Zenith Assistant</h3>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-blue-100 uppercase tracking-widest font-black">AI Active</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-lg transition">
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-gray-50 p-2 border-b border-gray-100 overflow-x-auto scrollbar-hide">
        {[
          { id: AIServiceMode.GENERAL, icon: 'fa-bolt', label: 'Fast' },
          { id: AIServiceMode.THINKING, icon: 'fa-brain', label: 'Think' },
          { id: AIServiceMode.SEARCH, icon: 'fa-globe', label: 'Search' },
        ].map(m => (
          <button 
            key={m.id}
            onClick={() => setMode(m.id as AIServiceMode)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap mr-2 ${
              mode === m.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            <i className={`fas ${m.icon}`}></i>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl relative group ${
              msg.role === 'user' 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
            }`}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.parts[0].text}</p>
              {msg.role === 'model' && (
                <button 
                  onClick={() => handleSpeak(msg.parts[0].text)}
                  className="absolute -right-10 top-2 opacity-0 group-hover:opacity-100 transition p-2 text-blue-600 hover:scale-110"
                >
                  <i className="fas fa-volume-up"></i>
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex space-x-1">
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex bg-gray-50 border border-gray-200 rounded-2xl px-4 py-1 items-center">
          <textarea 
            rows={1}
            placeholder={mode === AIServiceMode.THINKING ? "Ask a complex business question..." : "Ask me anything..."}
            className="flex-grow bg-transparent outline-none py-3 text-sm resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
              input.trim() ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300'
            }`}
          >
            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center uppercase tracking-widest font-bold">
          Powered by Gemini 3.0 Pro & Flash
        </p>
      </div>
    </div>
  );
};

export default AIChatbot;
