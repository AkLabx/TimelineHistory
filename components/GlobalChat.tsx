
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
      text: "Greetings. I am Itihaskar, the royal chronicler. I can assist you in exploring these archives, comparing eras, or finding facts from the vast history of Bharat. How may I serve you today?"
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
    5. Maintain a polite, scholarly, slightly archaic but accessible tone (like a royal librarian).
    6. Format output with Markdown (bold for names, lists for points).
    `;
  };

  const handleSend = async () => {
    if (!input.trim() || !process.env.API_KEY) return;

    const userText = input.trim();
    setInput('');
    const userMsgId = Date.now().toString();
    
    // Add User Message
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = 'gemini-2.5-flash'; // Supporting Search Grounding
      
      const systemInstruction = getSystemInstruction();

      // We maintain a simplified history for the API call (last 10 messages) to save context window
      const history = messages.slice(-10).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
      }));

      // Start streaming request
      const streamResult = await ai.models.generateContentStream({
        model: model,
        contents: [
            ...history,
            { role: 'user', parts: [{ text: userText }] }
        ],
        config: {
            systemInstruction: systemInstruction,
            tools: [{ googleSearch: {} }] // Enable Google Search Grounding
        }
      });

      const botMsgId = (Date.now() + 1).toString();
      
      // Placeholder for bot message
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', isStreaming: true }]);

      let fullText = '';
      let groundingMetadata = null;

      for await (const chunk of streamResult) {
        // Type assertion for the chunk
        const c = chunk as GenerateContentResponse;
        
        const chunkText = c.text || '';
        fullText += chunkText;
        
        // Capture grounding metadata if present in any chunk (usually the last one)
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
          text: "My apologies. I am having trouble accessing the archives at the moment. Please try again." 
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

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center
            ${isOpen ? 'bg-stone-800 rotate-90 text-white' : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:shadow-orange-500/50'}
        `}
        aria-label="Open History Chat"
      >
        {isOpen ? <Icons.X /> : <Icons.Quill />}
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-24 right-6 z-50 w-[90vw] md:w-[400px] h-[500px] max-h-[70vh] bg-[#fdfbf7] rounded-2xl shadow-2xl flex flex-col border border-orange-200 overflow-hidden transition-all duration-300 origin-bottom-right
            ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-100 to-amber-50 p-4 border-b border-orange-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white border border-orange-200 flex items-center justify-center text-orange-600 shadow-sm">
                    📜
                </div>
                <div>
                    <h3 className="font-bold text-stone-800 font-serif leading-tight">Itihaskar</h3>
                    <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[10px] text-stone-500 uppercase tracking-wider font-medium">AI Historian</span>
                    </div>
                </div>
            </div>
            {/* Model Badge */}
            <div className="bg-white/50 px-2 py-1 rounded border border-orange-200 text-[10px] font-mono text-orange-800 flex items-center gap-1" title="Powered by Gemini 2.5 Flash">
                <Icons.Sparkles /> <span>Gemini 2.5</span>
            </div>
        </div>

        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
            {messages.map((msg) => (
                <div 
                    key={msg.id} 
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                    <div 
                        className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm relative
                            ${msg.role === 'user' 
                                ? 'bg-stone-800 text-white rounded-br-none font-sans' 
                                : 'bg-white border border-stone-200 text-stone-800 rounded-bl-none font-serif'
                            }
                        `}
                    >
                        {/* Markdown-ish Rendering (Simple Bold) */}
                        <div dangerouslySetInnerHTML={{ 
                            __html: msg.text
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\n/g, '<br/>') 
                        }} />
                        
                        {/* Google Search Grounding Sources */}
                        {msg.groundingMetadata?.groundingChunks && (
                            <div className="mt-3 pt-2 border-t border-stone-100">
                                <p className="text-[10px] text-stone-400 font-bold uppercase mb-1 flex items-center gap-1">
                                    <Icons.Search /> Sources
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {msg.groundingMetadata.groundingChunks.map((chunk: any, idx: number) => {
                                        if (chunk.web?.uri) {
                                            return (
                                                <a 
                                                    key={idx} 
                                                    href={chunk.web.uri} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] bg-stone-100 hover:bg-orange-100 text-stone-600 hover:text-orange-700 px-2 py-1 rounded border border-stone-200 truncate max-w-[150px] transition-colors block"
                                                >
                                                    {chunk.web.title || new URL(chunk.web.uri).hostname}
                                                </a>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <span className="text-[10px] text-stone-400 mt-1 px-1">
                        {msg.role === 'user' ? 'You' : 'Itihaskar'}
                    </span>
                </div>
            ))}
            {isLoading && (
                <div className="flex items-center gap-2 text-stone-400 text-xs p-2">
                    <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce delay-75"></div>
                        <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                    <span>Consulting the archives...</span>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-stone-200">
            <div className="relative flex items-center">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about history..."
                    className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all font-sans placeholder-stone-400"
                    disabled={isLoading}
                />
                <button 
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="absolute right-1.5 bg-stone-800 hover:bg-orange-600 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Icons.Send />
                </button>
            </div>
            <div className="text-[9px] text-center text-stone-400 mt-2">
                AI can make mistakes. Verify important historical facts.
            </div>
        </div>
      </div>
    </>
  );
};

export default GlobalChat;
