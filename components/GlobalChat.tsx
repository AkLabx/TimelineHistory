
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
    previewUrl?: string;
  };
}

interface Attachment {
  file: File | Blob;
  previewUrl: string;
  type: 'image' | 'audio' | 'pdf';
  name: string;
  mimeType?: string;
}

const GlobalChat: React.FC<GlobalChatProps> = ({ activeContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'intro',
      role: 'model',
      text: "Greetings. I am **Aalok GPT**, your AI guide to the past. I can analyze **images**, **documents**, and even listen to your **voice** questions. How may I assist?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Tools Config State
  const [useSearch, setUseSearch] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Attachments State
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, attachment]); // Scroll when attachment is added too

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close settings if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
            setIsSettingsOpen(false);
        }
    };
    if (isSettingsOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

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

    return `You are "Aalok GPT" (The Historian), a knowledgeable and objective guide for an Indian History application called "BharatItihas".
    
    Current Context: ${contextText}

    Rules:
    1. Answer historical queries with precision.
    2. Analyze provided images or documents if present.
    3. If audio is provided, listen to the user's question and respond in text.
    4. ${useSearch ? 'You have access to Google Search. Use it to find recent information, fact-check, or find details not in your training data.' : 'Rely on your internal knowledge base.'}
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
    // Allow empty text if we have an attachment
    if ((!textToSend && !attachment) || !process.env.API_KEY) return;

    const userMsgId = Date.now().toString();
    
    // Display User Message
    const userMessage: Message = { 
        id: userMsgId, 
        role: 'user', 
        text: textToSend,
        attachment: attachment ? { 
            type: attachment.type, 
            name: attachment.name,
            previewUrl: attachment.previewUrl 
        } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto'; // Reset height
    setIsLoading(true);
    
    // Capture current attachment to send, then clear state WITHOUT revoking url yet
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

      // Simplified history 
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
            tools: useSearch ? [{ googleSearch: {} }] : [] 
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
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 p-4 pt-5 pb-5 text-white flex justify-between items-start relative overflow-visible flex-shrink-0">
            {/* Decorative BG pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px'}}></div>
            
            <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                    <Icons.Gemini />
                </div>
                <div>
                    <h3 className="font-bold text-lg leading-none mb-1">Aalok GPT</h3>
                    <div className="text-[10px] text-indigo-200 uppercase tracking-wider font-medium bg-black/20 inline-block px-2 py-0.5 rounded-md">
                        {getContextDescription()}
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-1 relative z-10">
                {/* Settings with Dropdown */}
                <div className="relative" ref={settingsRef}>
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className={`p-2 rounded-full transition-all duration-300 ${isSettingsOpen ? 'text-white bg-white/20 shadow-inner' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
                        title="Settings"
                    >
                        <div className="relative">
                            <Icons.Settings />
                            {useSearch && !isSettingsOpen && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-indigo-700"></span>}
                        </div>
                    </button>

                    {/* Settings Popover */}
                    {isSettingsOpen && (
                        <div className="absolute top-full right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right text-stone-800 z-50">
                            <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/80 backdrop-blur-sm">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Model Tools</h4>
                            </div>
                            <div className="p-2">
                                <div 
                                    className="flex items-center justify-between p-3 hover:bg-stone-50 rounded-xl cursor-pointer transition-colors group select-none"
                                    onClick={() => setUseSearch(!useSearch)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${useSearch ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-400'}`}>
                                            <Icons.Search />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-stone-700 group-hover:text-stone-900">Google Grounding</span>
                                            <span className="text-[10px] text-stone-400">Connect to real-time info</span>
                                        </div>
                                    </div>
                                    
                                    {/* IOS-style Toggle */}
                                    <div className={`w-9 h-5 rounded-full relative transition-colors duration-300 ${useSearch ? 'bg-green-500' : 'bg-stone-300'}`}>
                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${useSearch ? 'translate-x-4.5' : 'translate-x-0.5'}`} style={{ transform: useSearch ? 'translateX(18px)' : 'translateX(2px)' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleClear} 
                    className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                    title="Clear Chat"
                >
                    <Icons.Trash />
                </button>
            </div>
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

                        {/* Render Images if present */}
                        {msg.attachment && msg.attachment.type === 'image' && msg.attachment.previewUrl && (
                            <div className="mb-3 rounded-lg overflow-hidden border border-white/20 shadow-sm">
                                <img src={msg.attachment.previewUrl} alt="uploaded" className="w-full h-auto max-h-[250px] object-cover" />
                            </div>
                        )}

                        {/* Attachment Indicator for other types */}
                        {msg.attachment && msg.attachment.type !== 'image' && (
                            <div className={`mb-2 p-2 rounded-lg flex items-center gap-2 text-xs font-medium ${msg.role === 'user' ? 'bg-white/10' : 'bg-stone-100'}`}>
                                {msg.attachment.type === 'audio' && <Icons.MusicNote />}
                                {msg.attachment.type === 'pdf' && <Icons.FileText />}
                                <span className="truncate max-w-[150px]">{msg.attachment.name}</span>
                            </div>
                        )}

                        {/* Markdown Rendering */}
                        {msg.text && (
                            <div className="prose prose-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0 max-w-none" dangerouslySetInnerHTML={{ 
                                __html: msg.text
                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    .replace(/\n/g, '<br/>') 
                            }} />
                        )}
                        
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
            
            {/* Integrated Input Container */}
            <div className={`relative flex flex-col shadow-sm bg-stone-50 border border-stone-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all duration-300 ${attachment ? 'rounded-2xl' : 'rounded-3xl'}`}>
                
                {/* Preview Area Inside Input */}
                {attachment && (
                    <div className="p-3 pb-0 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="relative inline-block group">
                            {attachment.type === 'image' ? (
                                <img src={attachment.previewUrl} alt="preview" className="h-20 w-20 rounded-xl object-cover border border-stone-200 shadow-sm" />
                            ) : (
                                <div className="h-16 w-16 rounded-xl bg-stone-200 flex items-center justify-center border border-stone-300 text-stone-500">
                                    {attachment.type === 'audio' ? <Icons.MusicNote /> : <Icons.FileText />}
                                </div>
                            )}
                            <button
                                onClick={removeAttachment}
                                className="absolute -top-2 -right-2 bg-stone-800 text-white rounded-full p-1 shadow-md hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                                title="Remove attachment"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <span className="block text-[9px] text-stone-400 mt-1 truncate max-w-[80px]">{attachment.name}</span>
                        </div>
                    </div>
                )}

                {/* Input Controls Row */}
                <div className="flex items-end p-1.5">
                    {/* File Inputs (Hidden) */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*,application/pdf"
                        onChange={handleFileSelect}
                    />

                    {/* Tools */}
                    <div className="flex items-center pb-2 pl-1">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-stone-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors disabled:opacity-50"
                            disabled={isLoading || isRecording}
                            title="Attach Image or PDF"
                        >
                            <Icons.Paperclip />
                        </button>

                        <button 
                            onClick={handleMicClick}
                            className={`p-2 rounded-full transition-colors flex-shrink-0
                                ${isRecording 
                                    ? 'text-red-500 bg-red-50 animate-pulse' 
                                    : 'text-stone-400 hover:text-red-500 hover:bg-red-50'
                                } disabled:opacity-50`}
                            disabled={isLoading || !!attachment}
                            title={isRecording ? "Stop Recording" : "Record Voice"}
                        >
                            {isRecording ? <Icons.StopCircle /> : <Icons.Microphone />}
                        </button>
                    </div>

                    {/* Text Area */}
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isRecording ? "Recording..." : (attachment ? "Add a caption..." : "Ask history...")}
                        className="flex-grow bg-transparent text-stone-800 text-sm px-3 py-3.5 focus:outline-none placeholder-stone-400 resize-none max-h-32 min-h-[44px]"
                        rows={1}
                        disabled={isLoading || isRecording}
                    />
                    
                    {/* Send Button */}
                    <div className="pb-1 pr-1">
                        <button 
                            onClick={() => handleSend()}
                            disabled={isLoading || isRecording || (!input.trim() && !attachment)}
                            className="p-2.5 rounded-full bg-stone-900 text-white hover:bg-indigo-600 transition-colors disabled:opacity-30 disabled:hover:bg-stone-900 disabled:cursor-not-allowed transform active:scale-95 shadow-md"
                        >
                            <Icons.Send />
                        </button>
                    </div>
                </div>
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
