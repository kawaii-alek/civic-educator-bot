'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: 'Welcome to the Constitutional Expert System. I can assist you with detailed information regarding the Constitution of Kenya. What is your inquiry today?',
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8001/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': 'my_secret_key123'
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: input }]
        })
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      
      const botMsg: Message = {
        role: 'bot',
        content: data.content || "No matching constitutional provisions were found for this query.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        role: 'bot',
        content: "Error: Connection to the legal database was interrupted. Please ensure the repository backend is active.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
      {/* Institutional Top Bar */}
      <header className="px-10 py-8 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Constitutional Expert Assistant</h1>
          <p className="text-sm text-slate-500 mt-1">Republic of Kenya • Civic Education Portal</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
           <span className="text-[10px] font-bold uppercase tracking-wider">Secure Access</span>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-12 space-y-10 scrollbar-thin scrollbar-thumb-slate-200">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border ${
                msg.role === 'bot' 
                  ? 'bg-amber-50 border-amber-200 text-amber-700' 
                  : 'bg-slate-900 border-slate-800 text-white'
              }`}>
                {msg.role === 'bot' ? <LandmarkIcon /> : <User size={20} />}
              </div>
              <div className={`p-6 rounded-2xl shadow-sm border max-w-[70%] ${
                msg.role === 'bot' 
                  ? 'bg-white border-slate-200 text-slate-800' 
                  : 'bg-slate-800 border-slate-700 text-white'
              }`}>
                {msg.role === 'bot' && <Quote size={16} className="text-amber-300 mb-2 opacity-30" />}
                <p className="leading-relaxed font-serif text-lg">{msg.content}</p>
                <span className={`block text-[10px] mt-4 font-bold uppercase tracking-widest ${
                  msg.role === 'bot' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {msg.role === 'bot' ? 'Official Response' : 'User Query'} • {msg.timestamp}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <div className="flex gap-6 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
              <Loader2 className="animate-spin" size={20} />
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-slate-400 font-serif italic">
              Consulting Constitutional provisions...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-12 pt-0 bg-slate-50">
        <div className="bg-white p-2 border border-slate-200 rounded-xl flex items-center gap-4 shadow-lg ring-4 ring-slate-100">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe your inquiry regarding the law or constitution..."
            className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 px-6 font-serif text-lg"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 h-14 rounded-lg bg-amber-600 text-white flex items-center gap-3 font-bold hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            <span>Submit Inquiry</span>
            <Send size={18} />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-6 uppercase tracking-[0.2em] font-bold">
          Empowering citizens through constitutional awareness
        </p>
      </div>
    </div>
  );
};

const LandmarkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

export default ChatInterface;
