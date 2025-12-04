
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
}

const GlobalChat: React.FC<GlobalChatProps> = ({ activeContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'intro',
      role: 'model',
      text: "Greetings. I am **Itihaskar**, your AI guide to the past. I can help you uncover details about dynasties, rulers, and events on this page. Ask me anything!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    2. If the user asks about the "current page" or "this king", refer to the Current Context above.
    3. Use the Google Search tool if you need to verify specific dates, recent archaeological findings, or facts not in your training data.
    4. Keep answers concise (max 3-4 sentences) unless asked for elaboration.
    5. Maintain a polite, scholarly tone.
    6. Format output with Markdown (bold for names, lists for points).
    `;
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    if (!textToSend || !process.env.API_KEY) return;

    setInput('');
    const userMsgId = Date.now().toString();
    
    // Add User Message
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', text: textToSend }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = 'gemini-2.5-flash'; 
      
      const systemInstruction = getSystemInstruction();

      // We maintain a simplified history for the API call (last 10 messages)
      const history = messages.slice(-10).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
      }));

      // Start streaming request
      const streamResult = await ai.models.generateContentStream({
        model: model,
        contents: [
            ...history,
            { role: 'user', parts: [{ text: textToSend }] }
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
          text: "I am having trouble accessing the archives. Please try again." 
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
      text: "Chat cleared. How may I assist you with your historical inquiries?"
    }]);
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
        <div className="p-4 bg-white border-t border-stone-100">
            <div className="relative flex items-center shadow-sm rounded-full bg-stone-50 border border-stone-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a historical question..."
                    className="w-full bg-transparent text-stone-800 text-sm rounded-full pl-4 pr-12 py-3.5 focus:outline-none placeholder-stone-400"
                    disabled={isLoading}
                />
                <button 
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    className="absolute right-1.5 p-2 rounded-full bg-stone-900 text-white hover:bg-indigo-600 transition-colors disabled:opacity-30 disabled:hover:bg-stone-900 disabled:cursor-not-allowed transform active:scale-95"
                >
                    <Icons.Send />
                </button>
            </div>
            <div className="flex justify-center mt-2">
                <span className="text-[9px] text-stone-300 font-medium">Powered by Gemini 2.5 Flash</span>
            </div>
        </div>
      </div>
    </>
  );
};

export default GlobalChat;
