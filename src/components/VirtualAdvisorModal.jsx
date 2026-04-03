import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const VirtualAdvisorModal = ({ onClose, initialContext }) => {
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hello! I'm your Virtual AI Advisor. I've reviewed your policy score and recommendations. How can I assist you with your estate planning and life insurance needs today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        // Fallback mock mode if no API key
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'model', 
            content: `[Mock Response] I see you are asking about: "${userMessage.content}". Since no Gemini API key is configured in this prototype, I am unable to connect to the backend. Please add VITE_GEMINI_API_KEY to your .env file to enable live AI responses.`
          }]);
          setIsLoading(false);
        }, 1500);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemPrompt = "You are an expert life insurance virtual advisor. Your tone is knowledgeable, calm, and respectful. You explain, don't lecture. When answering, provide simple and structured answers. The user has a policy score of " + initialContext.score + " with 'Needs Review' status. Their main issue is beneficiary updates. Context: " + userMessage.content;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: systemPrompt,
      });

      setMessages(prev => [...prev, { role: 'model', content: response.text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I ran into an issue connecting to the AI service. Please check your API key configuration." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl h-[80vh]">
        {/* Header */}
        <div className="bg-brand-navy p-4 text-white flex justify-between items-center px-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="text-accent-gold" size={28} />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-brand-navy rounded-full"></span>
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Sarah Mitchell</h3>
              <p className="text-xs text-text-secondary">Licensed AI Advisor</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-amber-100 text-accent-amber-hover' : 'bg-slate-200 text-brand-slate'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl max-w-[80%] text-[0.95rem] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-accent-amber text-brand-dark rounded-tr-none' : 'bg-white text-brand-slate rounded-tl-none border border-slate-100'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-brand-slate flex items-center justify-center flex-shrink-0">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-2xl bg-white text-brand-slate rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full p-1 pl-4 focus-within:border-accent-amber focus-within:ring-2 focus-within:ring-amber-50 transition-all">
            <input 
              type="text" 
              placeholder="Ask Sarah a question..." 
              className="flex-1 bg-transparent border-none outline-none text-brand-dark py-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-accent-amber text-brand-dark disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} className="translate-x-[1px]" />
            </button>
          </div>
          <div className="text-center mt-2">
           <span className="text-[10px] text-text-muted">Conversations are powered by Google Gemini and are monitored for quality.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualAdvisorModal;
