
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { KINGS_DATA, DYNASTY_DATA } from '../data';
import { Icons } from './Icons';

interface GlobalChatProps {
  activeContext: {
    period: any;
    id: string | null;
  };
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
  groundingMetadata?: any;
  attachment?: {
    type: 'image' | 'audio' | 'pdf';
    name: string;
  };
}

interface Attachment {
  file: File | Blob;
  previewUrl: string;
  type: 'image' | 'audio' | 'pdf';
  name: string;
  base64Data?: string; // Cache the base64 string
  mimeType?: string;
}

const GlobalChat: React.FC<GlobalChatProps> = ({ activeContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'intro',
      role: 'model',
      text: "Greetings. I am **Itihaskar**, your AI guide to the past. I can analyze **images**, **documents**, and even listen to your **voice** questions. How may I assist?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Attachments State
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const getContextDescription = () => {
    if (activeContext.id) {
        if (KINGS_DATA[activeContext.id]) {
            return `Viewing: ${KINGS_DATA[activeContext.id].summary.title}`;
        } else if (DYNASTY_DATA[activeContext.id]) {
            return `Viewing: ${DYNASTY_DATA[activeContext.id].title}`;
        }
    }
    return "Exploring History";
  };

  const getSystemInstruction = () => {
    let contextText = "User is currently on the Main Dashboard.";
    
    if (activeContext.id) {
        // Check if it's a King
        if (KINGS_DATA[activeContext.id]) {
            const king = KINGS_DATA[activeContext.id];
            // Strip HTML for cleaner context
            const cleanContent = king.content?.replace(/<[^>]*>?/gm, ' ') || '';
            contextText = `User is currently viewing the profile of: ${king.summary.title}. 
            Reign: ${king.summary.reign || 'Unknown'}.
            Details: ${cleanContent.substring(0, 500)}...`;
        } 
        // Check if it's a Period/Dynasty
        else if (DYNASTY_DATA[activeContext.id]) {
            const period = DYNASTY_DATA[activeContext.id];
            contextText = `User is currently viewing the Era/Dynasty: ${period.title}.`;
        }
    }

    return `You are "Itihaskar" (The Historian), a knowledgeable and objective guide for an Indian History application called "BharatItihas".
    
    Current Context: ${contextText}

    Rules:
    1. Answer historical queries with precision.
    2. Analyze provided images or documents if present.
    3. If audio is provided, listen to the user's question and respond in text.
    4. Use the Google Search tool if you need to verify specific dates, recent archaeological findings, or facts not in your training data.
    5. Keep answers concise (max 3-4 sentences) unless asked for elaboration.
    6. Format output with Markdown.
    `;
  };

  // Helper to convert File/Blob to Base64 (stripping header)
  const fileToBase64 = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove "data:image/png;base64," prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileType = file.type.startsWith('image/') ? 'image' : (file.type === 'application/pdf' ? 'pdf' : 'pdf');
      
      setAttachment({
        file,
        previewUrl: URL.createObjectURL(file),
        type: fileType,
        name: file.name,
        mimeType: file.type
      });
    }
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleMicClick = async () => {
    if (isRecording) {
      // STOP Recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      // START Recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAttachment({
            file: audioBlob,
            previewUrl: audioUrl,
            type: 'audio',
            name: 'Voice Recording',
            mimeType: audioBlob.type // likely audio/webm;codecs=opus
          });
          
          // Stop all tracks to release mic
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Could not access microphone.");
      }
    }
  };

  const removeAttachment = () => {
    if (attachment?.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl);
    }
    setAttachment(null);
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    // Allow empty text if we have an attachment (e.g. audio only)
    if ((!textToSend && !attachment) || !process.env.API_KEY) return;

    const userMsgId = Date.now().toString();
    
    // Display User Message
    const userMessage: Message = { 
        id: userMsgId, 
        role: 'user', 
        text: textToSend || (attachment?.type === 'audio' ? "(Audio Input)" : "(Sent a file)"),
        attachment: attachment ? { type: attachment.type, name: attachment.name } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Capture current attachment to send, then clear state
    const currentAttachment = attachment;
    setAttachment(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = 'gemini-2.5-flash'; 
      
      const systemInstruction = getSystemInstruction();

      // Prepare contents for API
      const contentsParts: any[] = [];
      
      if (textToSend) {
          contentsParts.push({ text: textToSend });
      }

      if (currentAttachment) {
          const base64 = await fileToBase64(currentAttachment.file);
          contentsParts.push({
              inlineData: {
                  mimeType: currentAttachment.mimeType || currentAttachment.file.type,
                  data: base64
              }
          });
      }

      // Simplified history (Text only for now to avoid complexity in this demo, real app would keep multimodal history)
      // We'll just send the current multimodal turn + text history
      const history = messages.filter(m => m.role === 'model').slice(-3).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
      }));

      // Start streaming request
      const streamResult = await ai.models.generateContentStream({
        model: model,
        contents: [
            ...history,
            { role: 'user', parts: contentsParts }
        ],
        config: {
            systemInstruction: systemInstruction,
            tools: [{ googleSearch: {} }] 
        }
      });

      const botMsgId = (Date.now() + 1).toString();
      
      // Placeholder for bot message
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', isStreaming: true }]);

      let fullText = '';
      let groundingMetadata = null;

      for await (const chunk of streamResult) {
        const c = chunk as GenerateContentResponse;
        const chunkText = c.text || '';
        fullText += chunkText;
        
        if (c.candidates?.[0]?.groundingMetadata) {
            groundingMetadata = c.candidates[0].groundingMetadata;
        }

        setMessages(prev => prev.map(msg => 
            msg.id === botMsgId 
                ? { ...msg, text: fullText, groundingMetadata: groundingMetadata || msg.groundingMetadata } 
                : msg
        ));
      }

      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId ? { ...msg, isStreaming: false } : msg
      ));

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'model', 
          text: "I am having trouble analyzing that. Please ensure the file format is supported and try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([{
      id: 'intro',
      role: 'model',
      text: "Chat cleared. I am ready for your text, images, or documents."
    }]);
    setAttachment(null);
  };

  // Suggestions based on context
  const getSuggestions = () => {
    if (activeContext.id && KINGS_DATA[activeContext.id]) {
        return ["What are their key achievements?", "How did they die?", "Who succeeded them?", "Tell me a fun fact"];
    }
    if (activeContext.id && DYNASTY_DATA[activeContext.id]) {
        return ["Who founded this dynasty?", "Major events?", "Why did it decline?", "Famous monuments?"];
    }
    return ["Tell me about the Mauryan Empire", "Who was Ashoka?", "What is the Golden Age?", "Explain the caste system"];
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 group flex items-center justify-center transition-all duration-500
            ${isOpen 
                ? 'w-12 h-12 rounded-full bg-stone-900 text-white shadow-lg rotate-90' 
                : 'w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl hover:scale-110 hover:shadow-indigo-500/50 hover:rotate-12'
            }
        `}
        aria-label="Open AI Assistant"
      >
        {isOpen ? (
            <Icons.X />
        ) : (
            <div className="relative">
                <Icons.Gemini />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full border-2 border-white animate-pulse"></span>
            </div>
        )}
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-24 right-6 z-50 w-[90vw] md:w-[380px] h-[600px] max-h-[75vh] bg-white rounded-3xl shadow-2xl flex flex-col border border-white/20 overflow-hidden transition-all duration-300 origin-bottom-right
            ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}
        `}
        style={{ boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.25)' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 p-4 pt-5 pb-5 text-white flex justify-between items-start relative overflow-hidden">
            {/* Decorative BG pattern */}
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px'}}></div>
            
            <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                    <Icons.Gemini />
                </div>
                <div>
                    <h3 className="font-bold text-lg leading-none mb-1">Itihaskar AI</h3>
                    <div className="text-[10px] text-indigo-200 uppercase tracking-wider font-medium bg-black/20 inline-block px-2 py-0.5 rounded-md">
                        {getContextDescription()}
                    </div>
                </div>
            </div>
            
            <button 
                onClick={handleClear} 
                className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors relative z-10"
                title="Clear Chat"
            >
                <Icons.Trash />
            </button>
        </div>

        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-5 bg-stone-50">
            {messages.map((msg) => (
                <div 
                    key={msg.id} 
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                    <div 
                        className={`max-w-[88%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm relative animate-in fade-in slide-in-from-bottom-2 duration-300
                            ${msg.role === 'user' 
                                ? 'bg-gradient-to-br from-stone-800 to-stone-700 text-white rounded-tr-sm' 
                                : 'bg-white border border-stone-100 text-stone-700 rounded-tl-sm shadow-stone-200/50'
                            }
                        `}
                    >
                        {msg.role === 'model' && (
                            <div className="absolute -top-3 -left-2 w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] shadow-sm border border-white">
                                <Icons.Sparkles />
                            </div>
                        )}

                        {/* Attachment Indicator in History */}
                        {msg.attachment && (
                            <div className={`mb-2 p-2 rounded-lg flex items-center gap-2 text-xs font-medium ${msg.role === 'user' ? 'bg-white/10' : 'bg-stone-100'}`}>
                                {msg.attachment.type === 'image' && <Icons.Image />}
                                {msg.attachment.type === 'audio' && <Icons.MusicNote />}
                                {msg.attachment.type === 'pdf' && <Icons.FileText />}
                                <span className="truncate max-w-[150px]">{msg.attachment.name}</span>
                            </div>
                        )}

                        {/* Markdown Rendering */}
                        <div className="prose prose-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0 max-w-none" dangerouslySetInnerHTML={{ 
                            __html: msg.text
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\n/g, '<br/>') 
                        }} />
                        
                        {/* Grounding Sources */}
                        {msg.groundingMetadata?.groundingChunks && (
                            <div className="mt-3 pt-2 border-t border-black/5">
                                <p className="text-[10px] font-bold uppercase mb-1.5 flex items-center gap-1 opacity-60">
                                    <Icons.Search /> Sources
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {msg.groundingMetadata.groundingChunks.map((chunk: any, idx: number) => {
                                        if (chunk.web?.uri) {
                                            return (
                                                <a 
                                                    key={idx} 
                                                    href={chunk.web.uri} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-[9px] bg-black/5 hover:bg-indigo-50 text-stone-600 hover:text-indigo-600 px-2 py-1 rounded-md border border-black/5 truncate max-w-[140px] transition-colors flex items-center"
                                                >
                                                    <span className="truncate">{chunk.web.title || new URL(chunk.web.uri).hostname}</span>
                                                    <span className="ml-1 opacity-50">↗</span>
                                                </a>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
                <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-white border border-stone-100 flex items-center justify-center shadow-sm">
                        <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                            <div className="w-1 h-1 bg-pink-500 rounded-full animate-bounce delay-200"></div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Suggestions Chips (Only if few messages) */}
            {!isLoading && messages.length < 3 && (
                <div className="flex flex-wrap gap-2 mt-2 pl-1">
                    {getSuggestions().map((s, i) => (
                        <button 
                            key={i}
                            onClick={() => handleSend(s)}
                            className="text-xs bg-white border border-stone-200 text-stone-600 px-3 py-1.5 rounded-full hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors shadow-sm"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-stone-100 relative">
            
            {/* Attachment Preview Chip */}
            {attachment && (
                <div className="absolute top-[-3rem] left-4 right-4 flex items-center justify-between bg-stone-800 text-white p-2 px-3 rounded-lg shadow-lg text-xs animate-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-center gap-2 overflow-hidden">
                        {attachment.type === 'image' ? (
                            <img src={attachment.previewUrl} alt="preview" className="w-6 h-6 rounded object-cover border border-stone-600" />
                        ) : attachment.type === 'audio' ? (
                            <span className="text-orange-400"><Icons.MusicNote /></span>
                        ) : (
                            <span className="text-blue-300"><Icons.FileText /></span>
                        )}
                        <span className="truncate">{attachment.name}</span>
                    </div>
                    <button onClick={removeAttachment} className="ml-2 hover:text-red-300"><Icons.X /></button>
                </div>
            )}

            <div className="relative flex items-center shadow-sm rounded-full bg-stone-50 border border-stone-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
                
                {/* File Inputs (Hidden) */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*,application/pdf"
                    onChange={handleFileSelect}
                />

                {/* Attach Button */}
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="pl-3 p-2 text-stone-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
                    disabled={isLoading || isRecording}
                    title="Attach Image or PDF"
                >
                    <Icons.Paperclip />
                </button>

                {/* Mic Button */}
                <button 
                    onClick={handleMicClick}
                    className={`p-2 transition-colors flex-shrink-0
                        ${isRecording 
                            ? 'text-red-500 animate-pulse' 
                            : 'text-stone-400 hover:text-red-500'
                        } disabled:opacity-50`}
                    disabled={isLoading || !!attachment}
                    title={isRecording ? "Stop Recording" : "Record Voice"}
                >
                    {isRecording ? <Icons.StopCircle /> : <Icons.Microphone />}
                </button>

                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isRecording ? "Recording..." : (attachment ? "Add a message..." : "Ask history...")}
                    className="w-full bg-transparent text-stone-800 text-sm rounded-full px-3 py-3.5 focus:outline-none placeholder-stone-400"
                    disabled={isLoading || isRecording}
                />
                
                {/* Send Button */}
                <button 
                    onClick={() => handleSend()}
                    disabled={isLoading || isRecording || (!input.trim() && !attachment)}
                    className="absolute right-1.5 p-2 rounded-full bg-stone-900 text-white hover:bg-indigo-600 transition-colors disabled:opacity-30 disabled:hover:bg-stone-900 disabled:cursor-not-allowed transform active:scale-95"
                >
                    <Icons.Send />
                </button>
            </div>
            
            <div className="flex justify-between mt-2 px-2">
                <span className="text-[9px] text-stone-400">Supports: Images, PDF, Voice</span>
                <span className="text-[9px] text-stone-300 font-medium">Gemini 2.5 Flash</span>
            </div>
        </div>
      </div>
    </>
  );
};

export default GlobalChat;
