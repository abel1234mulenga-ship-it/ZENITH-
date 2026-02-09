
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decodeAudio, decodeAudioData, encodeAudio } from '../geminiService';

interface LiveAssistantProps {
  onClose: () => void;
}

const LiveAssistant: React.FC<LiveAssistantProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState("Say 'Hi' to start...");
  const [isThinking, setIsThinking] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);

  const startSession = async () => {
    setIsActive(true);
    setIsThinking(true);
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputContext = new AudioContext({ sampleRate: 16000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsThinking(false);
            setTranscript("I'm listening...");
            
            const source = inputContext.createMediaStreamSource(stream);
            const processor = inputContext.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const input = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(input.length);
              for (let i = 0; i < input.length; i++) int16[i] = input[i] * 32768;
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ 
                  media: { data: encodeAudio(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
                });
              });
            };
            
            source.connect(processor);
            processor.connect(inputContext.destination);
          },
          onmessage: async (msg: any) => {
            if (msg.serverContent?.outputTranscription) {
              setTranscript(msg.serverContent.outputTranscription.text);
            }
            
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decodeAudio(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
            }
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are the Zenith Super-App Assistant. You help users find tools, book heavy logistics vehicles, and manage their vendor accounts. Speak professionally and concisely.",
          outputAudioTranscription: {}
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsActive(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-blue-950/80 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition">
          <i className="fas fa-times text-xl"></i>
        </button>

        <div className="p-12 flex flex-col items-center text-center gap-12">
          <div className="relative">
            <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-700 ${
              isActive ? 'bg-blue-600 scale-110 shadow-[0_0_80px_rgba(37,99,235,0.4)]' : 'bg-gray-50 border border-gray-100'
            }`}>
              {isActive ? (
                <div className="flex items-center gap-1">
                   {[...Array(5)].map((_, i) => (
                     <div key={i} className="w-1.5 h-12 bg-white rounded-full animate-wave" style={{ animationDelay: `${i * 0.1}s` }}></div>
                   ))}
                </div>
              ) : (
                <i className="fas fa-microphone-lines text-5xl text-blue-600"></i>
              )}
            </div>
            {isThinking && <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>}
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-black text-gray-900">Zenith Voice</h2>
            <p className="text-lg text-gray-500 font-medium italic min-h-[3rem]">"{transcript}"</p>
          </div>

          <div className="flex gap-4 w-full">
            {!isActive ? (
              <button 
                onClick={startSession}
                className="flex-grow py-5 bg-blue-600 text-white rounded-3xl font-black text-xl hover:bg-blue-700 transition shadow-2xl"
              >
                Begin Conversation
              </button>
            ) : (
              <button 
                onClick={() => {
                  sessionRef.current?.close();
                  setIsActive(false);
                  setTranscript("Session ended.");
                }}
                className="flex-grow py-5 bg-red-50 text-red-600 rounded-3xl font-black text-xl hover:bg-red-100 transition"
              >
                Stop Listening
              </button>
            )}
          </div>
          
          <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">
            Real-time Multimodal Engine Active
          </div>
        </div>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { height: 1.5rem; }
          50% { height: 4rem; }
        }
        .animate-wave { animation: wave 1s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default LiveAssistant;
