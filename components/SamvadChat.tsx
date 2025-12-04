import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { KINGS_DATA } from '../data';
import { Icons } from './Icons';

interface SamvadChatProps {
  isOpen: boolean;
  onClose: () => void;
  figureId: string | null;
}

// --- Audio Helper Functions ---

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Simple SFX Generator
const playSfx = (ctx: AudioContext | null, type: 'click' | 'connect' | 'disconnect') => {
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    
    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'connect') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'disconnect') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(200, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (e) {
    // Ignore sfx errors
  }
};

const SamvadChat: React.FC<SamvadChatProps> = ({ isOpen, onClose, figureId }) => {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  
  // Refs for audio handling
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);

  // Refs for Visualizers
  const userAnalyserRef = useRef<AnalyserNode | null>(null);
  const aiAnalyserRef = useRef<AnalyserNode | null>(null);
  const userCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const aiVisualizerRef = useRef<HTMLDivElement | null>(null); // The glow element
  const animationFrameRef = useRef<number>(0);

  const figure = figureId ? KINGS_DATA[figureId] : null;

  // Cleanup function
  const cleanup = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Stop all queued audio
    audioQueueRef.current.forEach(node => {
      try { node.stop(); } catch (e) {}
    });
    audioQueueRef.current = [];
    
    setStatus('disconnected');
    setAiSpeaking(false);
  };

  useEffect(() => {
    if (isOpen && figure) {
      startSession();
    } else {
      cleanup();
    }
    return () => cleanup();
  }, [isOpen, figureId]);

  // Animation Loop for Visualizers
  useEffect(() => {
    if (status !== 'connected') return;

    const animate = () => {
      // 1. Visualize User Mic (Waveform)
      if (userAnalyserRef.current && userCanvasRef.current) {
        const canvas = userCanvasRef.current;
        const ctx = canvas.getContext('2d');
        const analyser = userAnalyserRef.current;
        
        if (ctx) {
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyser.getByteTimeDomainData(dataArray);

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.lineWidth = 2;
          ctx.strokeStyle = isMicMuted ? '#57534e' : '#f97316'; // Stone-600 or Orange-500
          ctx.beginPath();

          const sliceWidth = canvas.width * 1.0 / bufferLength;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * canvas.height / 2;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            x += sliceWidth;
          }
          ctx.stroke();
        }
      }

      // 2. Visualize AI Speech (Glow/Scale)
      if (aiAnalyserRef.current && aiVisualizerRef.current) {
        const analyser = aiAnalyserRef.current;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        
        // Map average (0-255) to scale (1.0 - 1.5)
        // Threshold: only animate if average > 10 to reduce jitter
        const scale = average > 5 ? 1 + (average / 255) * 0.8 : 1;
        const opacity = average > 5 ? 0.2 + (average / 255) * 0.6 : 0; // ambient glow

        aiVisualizerRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
        aiVisualizerRef.current.style.opacity = opacity.toString();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [status, isMicMuted]);

  const startSession = async () => {
    if (!figure) return;
    setStatus('connecting');

    try {
      // 1. Initialize Audio Context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000, 
      });

      // 2. Initialize Gemini Client
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // 3. Prepare System Instruction
      const contextContent = figure.content?.replace(/<[^>]*>?/gm, ' ') || "Historical figure.";
      const systemInstruction = `You are ${figure.summary.title}. 
      Reign: ${figure.summary.reign}. 
      Context: ${contextContent.substring(0, 1000)}.
      
      Roleplay rules:
      1. Speak in the first person ("I").
      2. Use a tone befitting a ruler of your era.
      3. Keep answers conversational and concise (2-3 sentences mostly).
      4. Do not break character.
      `;

      // 4. Connect to Live API
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: systemInstruction,
        },
        callbacks: {
          onopen: async () => {
            setStatus('connected');
            playSfx(audioContextRef.current, 'connect');
            
            // Start Microphone Stream
            try {
              mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
              sourceNodeRef.current = audioContextRef.current!.createMediaStreamSource(mediaStreamRef.current);
              
              // Set up User Analyser
              userAnalyserRef.current = audioContextRef.current!.createAnalyser();
              userAnalyserRef.current.fftSize = 256;
              sourceNodeRef.current.connect(userAnalyserRef.current);

              // Use ScriptProcessor for raw PCM access
              processorRef.current = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
              
              processorRef.current.onaudioprocess = (e) => {
                if (isMicMuted) return;

                const inputData = e.inputBuffer.getChannelData(0);
                const pcm16 = floatTo16BitPCM(inputData);
                const base64Data = arrayBufferToBase64(pcm16);

                sessionPromise.then(session => {
                    session.sendRealtimeInput({
                        media: {
                            mimeType: "audio/pcm;rate=16000",
                            data: base64Data
                        }
                    });
                });
              };

              // Connect analyser to processor
              userAnalyserRef.current.connect(processorRef.current);
              processorRef.current.connect(audioContextRef.current!.destination);
            } catch (micError) {
              console.error("Microphone access denied", micError);
              setStatus('error');
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              setAiSpeaking(true);
              playAudioChunk(audioData);
            }
            if (message.serverContent?.turnComplete) {
               setTimeout(() => setAiSpeaking(false), 1000);
            }
          },
          onclose: () => {
            setStatus('disconnected');
          },
          onerror: (err) => {
            setStatus('error');
          }
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (error) {
      console.error("Failed to start session", error);
      setStatus('error');
    }
  };

  const playAudioChunk = async (base64Audio: string) => {
    if (!audioContextRef.current) return;

    try {
      const audioBytes = base64ToUint8Array(base64Audio);
      const pcmData = new Int16Array(audioBytes.buffer);
      const floatData = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        floatData[i] = pcmData[i] / 32768.0;
      }

      const audioBuffer = audioContextRef.current.createBuffer(1, floatData.length, 24000);
      audioBuffer.copyToChannel(floatData, 0);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;

      // Set up Output Analyser if not exists
      if (!aiAnalyserRef.current) {
        aiAnalyserRef.current = audioContextRef.current.createAnalyser();
        aiAnalyserRef.current.fftSize = 64; // Smaller FFT for smoother bass/volume pulse
        aiAnalyserRef.current.smoothingTimeConstant = 0.8;
      }

      // Chain: Source -> Analyser -> Destination
      source.connect(aiAnalyserRef.current);
      aiAnalyserRef.current.connect(audioContextRef.current.destination);

      const currentTime = audioContextRef.current.currentTime;
      const startTime = Math.max(currentTime, nextStartTimeRef.current);
      
      source.start(startTime);
      nextStartTimeRef.current = startTime + audioBuffer.duration;
      
      audioQueueRef.current.push(source);
      source.onended = () => {
        audioQueueRef.current = audioQueueRef.current.filter(s => s !== source);
        if (audioQueueRef.current.length === 0) {
            setAiSpeaking(false);
        }
      };

    } catch (e) {
      console.error("Error playing audio chunk", e);
    }
  };

  const toggleMic = () => {
    playSfx(audioContextRef.current, 'click');
    setIsMicMuted(!isMicMuted);
  };

  const handleClose = () => {
    playSfx(audioContextRef.current, 'disconnect');
    // Slight delay to let the sound play
    setTimeout(onClose, 200);
  };

  if (!isOpen || !figure) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-md transition-opacity" 
            onClick={handleClose}
        ></div>

        {/* Drawer */}
        <div className="relative w-full max-w-md bg-[#1c1917] shadow-2xl h-full border-l border-stone-700 flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="p-4 bg-stone-900 border-b border-stone-800 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest border border-red-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        Live
                    </div>
                    <span className="text-stone-400 text-xs uppercase tracking-widest">Samvad</span>
                </div>
                <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full text-stone-400 hover:text-white transition-colors">
                    <Icons.X />
                </button>
            </div>

            {/* Main Visualizer Area */}
            <div className="flex-grow relative flex flex-col items-center justify-center p-8 overflow-hidden bg-gradient-to-b from-[#1c1917] to-black">
                
                {/* AI Voice Visualizer (Glow) */}
                <div 
                    ref={aiVisualizerRef}
                    className="absolute top-1/2 left-1/2 w-64 h-64 bg-orange-500 rounded-full blur-[80px] pointer-events-none transition-transform duration-75 ease-linear will-change-transform opacity-0"
                ></div>

                {/* Avatar Container */}
                <div className="relative z-10">
                    <div className={`w-40 h-40 rounded-full border-4 shadow-2xl overflow-hidden relative transition-all duration-300 border-stone-700 shadow-black`}>
                        {figure.imageUrl ? (
                            <img src={figure.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-stone-800 flex items-center justify-center text-6xl">👑</div>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center space-y-2 z-10">
                    <h2 className="text-3xl font-bold text-white heading-text text-shadow-lg">{figure.summary.title.split('(')[0]}</h2>
                    <p className="text-stone-400 font-serif italic text-sm">{figure.summary.reign || 'Historical Figure'}</p>
                </div>

                {/* Status Text */}
                <div className="mt-12 h-8 flex items-center justify-center z-10">
                    {status === 'connecting' && (
                        <span className="text-orange-400 text-sm animate-pulse font-mono">CONNECTING TO HISTORY...</span>
                    )}
                    {status === 'error' && (
                        <span className="text-red-400 text-sm font-mono">CONNECTION FAILED</span>
                    )}
                    {status === 'connected' && (
                        <div className="flex flex-col items-center gap-2">
                            {aiSpeaking ? (
                                <span className="text-orange-300 text-xs font-bold uppercase tracking-widest animate-pulse">Speaking...</span>
                            ) : (
                                <span className="text-stone-500 text-xs uppercase tracking-widest">Listening...</span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="p-8 bg-stone-900 border-t border-stone-800 relative">
                
                {/* User Mic Visualizer (Canvas) */}
                <div className="absolute top-[-40px] left-0 right-0 h-10 flex items-end justify-center px-8 pointer-events-none">
                    <canvas ref={userCanvasRef} width={300} height={40} className="w-full h-full opacity-50"></canvas>
                </div>

                <div className="flex items-center justify-center gap-6">
                    <button 
                        onClick={toggleMic}
                        className={`p-4 rounded-full transition-all duration-200 ring-2 ${isMicMuted ? 'bg-stone-800 text-red-400 ring-red-900/30' : 'bg-stone-800 text-white hover:bg-stone-700 ring-stone-700'}`}
                        title={isMicMuted ? "Unmute" : "Mute"}
                    >
                        {isMicMuted ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        )}
                    </button>

                    <button 
                        onClick={handleClose}
                        className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-lg hover:shadow-red-900/50 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" /></svg>
                        <span>End Call</span>
                    </button>
                </div>
                <p className="text-center text-stone-600 text-[10px] mt-6 font-mono opacity-50">
                    Gemini Live • {status}
                </p>
            </div>
        </div>
    </div>
  );
};

export default SamvadChat;