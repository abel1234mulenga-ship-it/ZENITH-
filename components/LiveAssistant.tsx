
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
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const startSession = async () => {
    setIsActive(true);
    setIsThinking(true);
    
    // Always create a new AI instance right before connection for the latest keys
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
            scriptProcessorRef.current = processor;
            
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

            if (msg.serverContent?.interrupted) {
               nextStartTimeRef.current = 0;
            }
          },
          onerror: (err) => {
            console.error("Live session error:", err);
            setTranscript("System busy. Retrying connection...");
            setIsThinking(false);
          },
          onclose: () => {
            setIsActive(false);
            setIsThinking(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are the Zenith Super-App Strategic Assistant. You help Zambian merchants grow their businesses. Be concise, professional, and strategic.",
          outputAudioTranscription: {}
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsActive(false);
      setIsThinking(false);
    }
  };

  const stopSession = () => {
    sessionRef.current?.close();
    scriptProcessorRef.current?.disconnect();
    setIsActive(false);
    setTranscript("Session archived.");
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-blue-950/90 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[4rem] overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition"><i className="fas fa-times text-2xl"></i></button>

        <div className="p-16 flex flex-col items-center text-center gap-12">
          <div className="relative">
            <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-700 ${
              isActive ? 'bg-blue-600 shadow-[0_0_80px_rgba(37,99,235,0.4)]' : 'bg-gray-50 border border-gray-100'
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
            {isThinking && <div className="absolute inset-[-10px] border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>}
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-black text-gray-900">Strategic Voice</h2>
            <p className="text-lg text-gray-500 font-medium italic min-h-[4rem] leading-relaxed">"{transcript}"</p>
          </div>

          <div className="flex gap-4 w-full">
            {!isActive ? (
              <button onClick={startSession} className="flex-grow py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl hover:bg-blue-700 transition shadow-2xl">Begin Command</button>
            ) : (
              <button onClick={stopSession} className="flex-grow py-6 bg-red-50 text-red-600 rounded-[2rem] font-black text-xl hover:bg-red-100 transition">End Session</button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes wave { 0%, 100% { height: 1.5rem; } 50% { height: 4rem; } }
        .animate-wave { animation: wave 1s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default LiveAssistant;
