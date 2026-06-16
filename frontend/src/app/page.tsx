'use client';

import { useState, useRef, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatInterface from '@/components/ChatInterface';
import { chapter4 } from '@/data/chapter4';
import { chapter14 } from '@/data/chapter14';
import { Menu, Search as SearchIcon, BookOpen, Loader2, Quote } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('assistant');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('en');

  const renderContent = () => {
    switch (activeTab) {
      case 'assistant':
        return (
          <ChatInterface 
            setIsSidebarOpen={setIsSidebarOpen}
            language={language}
            setLanguage={setLanguage}
          />
        );
      case 'rights':
        return (
          <ChapterReader 
            chapter={chapter4}
            language={language}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        );
      case 'security':
        return (
          <ChapterReader 
            chapter={chapter14}
            language={language}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        );
      case 'search':
        return (
          <LegalSearch 
            language={language}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        );
      default:
        return (
          <ChatInterface 
            setIsSidebarOpen={setIsSidebarOpen}
            language={language}
            setLanguage={setLanguage}
          />
        );
    }
  };

  return (
    <main className="h-screen w-full flex bg-slate-100 p-0 overflow-hidden relative font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      {renderContent()}
    </main>
  );
}

/* --- Chapter Reader Component --- */

interface ChapterReaderProps {
  chapter: typeof chapter4;
  language: string;
  setIsSidebarOpen: (open: boolean) => void;
}

const ChapterReader = ({ chapter, language, setIsSidebarOpen }: ChapterReaderProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedArticles, setExpandedArticles] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'summary' | 'full'>('summary');

  const toggleArticle = (artNum: string) => {
    setExpandedArticles(prev => ({
      ...prev,
      [artNum]: !prev[artNum]
    }));
  };

  const filteredParts = chapter.parts.map(part => {
    const articles = part.articles.filter(art => 
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.number.includes(searchTerm) ||
      art.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.fullText.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { ...part, articles };
  }).filter(part => part.articles.length > 0);

  const translationsMap: Record<string, any> = {
    en: {
      searchPlaceholder: "Search articles...",
      summaryView: "Citizen Summary",
      fullText: "Full Legal Text",
      tapToExpand: "Read full legal text",
      tapToCollapse: "Show summary only",
      noResults: "No articles match your search.",
      articlesFound: "Articles found"
    },
    sw: {
      searchPlaceholder: "Tafuta vifungu...",
      summaryView: "Muhtasari wa Raia",
      fullText: "Maandishi Kamili ya Katiba",
      tapToExpand: "Soma maandishi kamili",
      tapToCollapse: "Onyesha muhtasari tu",
      noResults: "Hakuna vifungu vinavyolingana na utafutaji wako.",
      articlesFound: "Vifungu vilivyopatikana"
    }
  };

  const t = translationsMap[language] || translationsMap.en;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Top Header */}
      <header className="px-6 md:px-10 py-6 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-900 leading-tight">{chapter.title}</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
              {language === 'sw' ? 'Katiba ya Kenya' : 'Constitution of Kenya'}
            </p>
          </div>
        </div>

        {/* View Mode controls */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('summary')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              viewMode === 'summary' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {t.summaryView}
          </button>
          <button
            onClick={() => setViewMode('full')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              viewMode === 'full' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {t.fullText}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
        {/* Search Input */}
        <div className="max-w-md bg-white border border-slate-200 rounded-xl flex items-center gap-3 px-4 py-2.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500/50">
          <SearchIcon size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-sm font-sans"
          />
        </div>

        {filteredParts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-serif text-lg italic">{t.noResults}</p>
          </div>
        ) : (
          filteredParts.map((part, pIdx) => (
            <div key={pIdx} className="space-y-4">
              <h2 className="text-xs uppercase tracking-widest text-amber-600 font-bold border-b border-amber-200/50 pb-2">
                {part.title}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {part.articles.map((art, aIdx) => {
                  const isExpanded = expandedArticles[art.number] || viewMode === 'full';
                  return (
                    <div 
                      key={aIdx} 
                      className={`bg-white border rounded-2xl p-6 shadow-sm transition-all duration-300 ${
                        isExpanded ? 'border-amber-200 ring-2 ring-amber-50 md:col-span-2 shadow-amber-50/50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-700 font-serif font-bold text-sm border border-amber-100 flex-shrink-0">
                            {art.number}
                          </span>
                          <h3 className="font-serif font-bold text-slate-800 text-base md:text-lg">{art.title}</h3>
                        </div>
                        {viewMode === 'summary' && (
                          <button
                            onClick={() => toggleArticle(art.number)}
                            className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex-shrink-0 whitespace-nowrap"
                          >
                            {isExpanded ? t.tapToCollapse : t.tapToExpand}
                          </button>
                        )}
                      </div>

                      {/* Display content depending on mode */}
                      <div className="space-y-4">
                        {/* Summary View */}
                        <div className="text-slate-600 leading-relaxed font-sans text-sm">
                          {art.summary}
                        </div>

                        {/* Full Text View (expanded or full mode) */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-slate-100 font-serif text-slate-800 bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                              {language === 'sw' ? 'Maandishi Rasmi ya Katiba' : 'Official Constitutional Text'}
                            </span>
                            {art.fullText}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* --- Legal Search Component --- */

interface LegalSearchProps {
  language: string;
  setIsSidebarOpen: (open: boolean) => void;
}

const LegalSearch = ({ language, setIsSidebarOpen }: LegalSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<Record<string, string[]>>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  const translationsMap: Record<string, any> = {
    en: {
      title: "Legal Search Engine",
      subtitle: "Query the FAISS Vector Database for Direct Constitutional Provisions",
      placeholder: "Enter search terms (e.g. freedom of media, citizenship, devolution)...",
      searchBtn: "Search Database",
      searching: "Searching legal index...",
      noResults: "No matching constitutional provisions found.",
      resultsFound: "Matching provisions found",
      error: "Failed to connect to the search database. Please ensure the backend is running."
    },
    sw: {
      title: "Injini ya Utafutaji wa Kisheria",
      subtitle: "Tafuta moja kwa moja kutoka kwenye Hifadhidata ya Vifungu vya Katiba ya Kenya",
      placeholder: "Weka maneno ya utafutaji (mfano: uhuru wa vyombo vya habari, uraia, ugatuzi)...",
      searchBtn: "Tafuta Hifadhidata",
      searching: "Inatafuta kwenye faharasa...",
      noResults: "Hakuna vifungu vya katiba vinavyolingana vilivyopatikana.",
      resultsFound: "Vifungu vilivyopatikana",
      error: "Imeshindwa kuunganisha kwenye hifadhidata ya utafutaji. Hakikisha backend inafanya kazi."
    }
  };

  const t = translationsMap[language] || translationsMap.en;

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSearch = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || isLoading) return;

    // Check query cache
    const cacheKey = `${language}:${trimmedQuery.toLowerCase()}`;
    if (cacheRef.current[cacheKey]) {
      setResults(cacheRef.current[cacheKey]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    // Abort active fetch if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/v1';
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'my_secret_key123';

      const response = await fetch(`${apiUrl}/search?q=${encodeURIComponent(trimmedQuery)}`, {
        method: 'GET',
        headers: {
          'api-key': apiKey,
          'x-language': language
        },
        signal: abortController.signal
      });

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      const searchResults = data.results || [];
      
      // Save in cache
      cacheRef.current[cacheKey] = searchResults;
      setResults(searchResults);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Search aborted');
        return; // do not set states if aborted
      }
      console.error(err);
      setError(t.error);
    } finally {
      if (abortControllerRef.current === abortController) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Header */}
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
            <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 md:mt-1 uppercase tracking-wider">{t.subtitle}</p>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
        {/* Search Controls */}
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 px-4 py-2.5 md:py-3 shadow-inner transition-all focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500/50 focus-within:bg-white">
              <SearchIcon size={20} className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder={t.placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 font-sans text-sm md:text-base"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="px-6 h-11 md:h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center gap-2 md:gap-3 font-bold hover:bg-amber-700 active:scale-[0.98] transition-all disabled:opacity-50 text-sm md:text-base shadow-md whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>{t.searching}</span>
                </>
              ) : (
                <>
                  <span>{t.searchBtn}</span>
                  <SearchIcon size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Status & Errors */}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium text-sm">
            {error}
          </div>
        )}

        {/* Results List */}
        <div className="space-y-4 md:space-y-6">
          {results.length > 0 && (
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">
              {results.length} {t.resultsFound}
            </p>
          )}

          {results.length === 0 && !isLoading && !error && query && (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
              <SearchIcon size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-serif text-base md:text-lg italic">{t.noResults}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:gap-6">
            {results.map((res, index) => (
              <div 
                key={index} 
                className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md hover:scale-[1.01] hover:border-amber-300 transition-all duration-300 relative overflow-hidden group"
              >
                {/* Decorative border */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 md:w-1.5" />
                
                <div className="flex gap-3 md:gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors flex-shrink-0">
                    <Quote size={14} className="opacity-60 md:w-4.5 md:h-4.5" />
                  </div>
                  <div className="flex-1">
                    <span className="block text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                      {language === 'sw' ? 'Kifungu cha Katiba' : 'Constitutional Extract'} #{index + 1}
                    </span>
                    <p className="font-serif text-slate-800 text-sm md:text-base leading-relaxed whitespace-pre-line">
                      {res}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
