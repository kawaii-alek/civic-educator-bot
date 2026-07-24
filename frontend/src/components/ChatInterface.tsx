'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Quote, Menu, Languages, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
}

const TRANSLATIONS = {
  en: {
    title: "Constitutional Expert Assistant",
    subtitle: "Republic of Kenya • Civic Education Portal",
    secureAccess: "Secure Access",
    welcome: "Welcome to the Constitutional Expert System. I can assist you with detailed information regarding the Constitution of Kenya. What is your inquiry today?",
    placeholder: "Describe your inquiry regarding the law or constitution...",
    submitBtn: "Submit Inquiry",
    footer: "Empowering citizens through constitutional awareness",
    loading: "Consulting Constitutional provisions...",
    error: "Error: Connection to the legal database was interrupted. Please ensure the repository backend is active.",
    officialResponse: "Official Response",
    userQuery: "User Query"
  },
  sw: {
    title: "Msaidizi wa Katiba",
    subtitle: "Jamhuri ya Kenya • Tovuti ya Elimu ya Uraia",
    secureAccess: "Ufikiaji Salama",
    welcome: "Karibu kwenye Mfumo wa Mtaalamu wa Katiba. Naweza kukusaidia kwa maelezo ya kina kuhusu Katiba ya Kenya. Je, una swali gani leo?",
    placeholder: "Eleza swali lako kuhusu sheria au katiba...",
    submitBtn: "Tuma Swali",
    footer: "Kuwezesha wananchi kupitia uelewa wa katiba",
    loading: "Inatafuta vifungu vya Katiba...",
    error: "Hitilafu: Muunganisho kwenye hifadhidata ya kisheria umekatizwa. Tafadhali hakikisha kuwa backend inafanya kazi.",
    officialResponse: "Jibu Rasmi",
    userQuery: "Swali la Mtumiaji"
  }
};

interface ChatInterfaceProps {
  setIsSidebarOpen: (open: boolean) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English (EN)' },
  { code: 'sw', name: 'Kiswahili (SW)' },
  { code: 'kikuyu', name: 'Gikuyu (Kikuyu)' },
  { code: 'luo', name: 'Dholuo (Luo)' },
  { code: 'luhya', name: 'Luhya' },
  { code: 'kamba', name: 'Kamba' },
  { code: 'kalenjin', name: 'Kalenjin' },
  { code: 'somali', name: 'Somali' }
];

const ChatInterface = ({ setIsSidebarOpen, language, setLanguage }: ChatInterfaceProps) => {
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: TRANSLATIONS.en.welcome,
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'bot') {
        return [{
          ...prev[0],
          content: t.welcome
        }];
      }
      return prev;
    });
  }, [language, t.welcome]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const payloadMessages = [
      ...messages.map(msg => ({
        role: msg.role === 'bot' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: 'user', content: input }
    ];

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const endpoint = (apiBaseUrl && apiBaseUrl.startsWith('http') && !apiBaseUrl.includes('localhost'))
        ? (apiBaseUrl.endsWith('/') ? `${apiBaseUrl}v1/chat/completions` : `${apiBaseUrl}/v1/chat/completions`)
        : '/api/chat';
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'my_secret_key123';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
          'x-language': language
        },
        body: JSON.stringify({
          messages: payloadMessages,
          language: language
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      
      const botMsg: Message = {
        role: 'bot',
        content: data.content || "No matching constitutional provisions were found for this query.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
        return;
      }
      console.error(error);
      const errorDetail = error?.message ? ` (${error.message})` : '';
      const errorMsg: Message = {
        role: 'bot',
        content: `Error: Connection to the legal database failed${errorDetail}. Please check your GEMINI_API_KEY in Vercel settings and redeploy.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      if (abortControllerRef.current === abortController) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
      {/* Institutional Top Bar */}
      <header className="px-4 md:px-10 py-4 md:py-6 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg active:scale-95 transition-all"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-lg md:text-2xl font-serif font-bold text-slate-900 leading-tight">{t.title}</h1>
            <p className="text-[10px] md:text-sm text-slate-500 mt-0.5 md:mt-1">{t.subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative flex items-center hover:scale-[1.02] active:scale-[0.98] transition-transform">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="appearance-none pl-8 pr-7 py-1.5 md:py-2 text-[11px] md:text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 outline-none cursor-pointer"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              <Languages size={12} />
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              <ChevronDown size={10} />
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[10px] font-bold uppercase tracking-wider">{t.secureAccess}</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-6 md:space-y-10 scrollbar-thin scrollbar-thumb-slate-200">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 md:gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 border ${
                msg.role === 'bot' 
                  ? 'bg-amber-50 border-amber-200 text-amber-700' 
                  : 'bg-slate-900 border-slate-800 text-white'
              }`}>
                {msg.role === 'bot' ? <LandmarkIcon /> : <User size={16} />}
              </div>
              <div className={`p-4 md:p-6 rounded-2xl shadow-sm border max-w-[90%] sm:max-w-[85%] md:max-w-[70%] ${
                msg.role === 'bot' 
                  ? 'bg-white border-slate-200 text-slate-800' 
                  : 'bg-slate-800 border-slate-700 text-white'
              }`}>
                {msg.role === 'bot' && <Quote size={14} className="text-amber-300 mb-1 opacity-30" />}
                <p className="leading-relaxed font-sans text-sm md:text-base whitespace-pre-line">{msg.content}</p>
                <span className={`block text-[9px] md:text-[10px] mt-4 font-bold uppercase tracking-widest ${
                  msg.role === 'bot' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {msg.role === 'bot' ? t.officialResponse : t.userQuery} • {msg.timestamp}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <div className="flex gap-4 md:gap-6 animate-pulse">
            <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
              <Loader2 className="animate-spin" size={16} />
            </div>
            <div className="p-4 md:p-6 rounded-2xl bg-white border border-slate-200 text-slate-400 font-sans text-sm md:text-base italic">
              {t.loading}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-12 pt-0 bg-slate-50">
        <div className="bg-white p-1.5 md:p-2 border border-slate-200 rounded-xl flex items-center gap-2 md:gap-4 shadow-lg ring-4 ring-slate-100/50 transition-all focus-within:ring-amber-500/20 focus-within:border-amber-500/50">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.placeholder}
            className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 px-2 md:px-6 font-sans text-sm md:text-base"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-3 md:px-6 h-10 md:h-14 rounded-lg bg-amber-600 text-white flex items-center gap-2 md:gap-3 font-bold hover:bg-amber-700 active:scale-[0.98] transition-all disabled:opacity-50 text-xs md:text-base whitespace-nowrap"
          >
            <span>{t.submitBtn}</span>
            <Send size={14} className="md:w-4 md:h-4" />
          </button>
        </div>
        <p className="text-center text-[9px] md:text-[10px] text-slate-400 mt-4 md:mt-6 uppercase tracking-[0.2em] font-bold">
          {t.footer}
        </p>
      </div>
    </div>
  );
};

const LandmarkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

export default ChatInterface;
