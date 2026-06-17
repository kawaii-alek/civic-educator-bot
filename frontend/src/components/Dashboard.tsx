'use client';

import { useState } from 'react';
import { 
  Landmark, 
  BookOpen, 
  Users, 
  ShieldAlert, 
  ChevronRight, 
  ChevronLeft, 
  Quote, 
  ArrowUpRight,
  Menu
} from 'lucide-react';

interface DashboardProps {
  language: string;
  setIsSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ language, setIsSidebarOpen, setActiveTab }: DashboardProps) {
  const [factIndex, setFactIndex] = useState(0);

  const translations: Record<string, any> = {
    en: {
      title: "Civic Dashboard",
      subtitle: "Overview and insights of the Constitution of Kenya (2010)",
      quickStats: "Quick Stats",
      chapters: "Chapters",
      articles: "Articles",
      counties: "Counties",
      rights: "Core Rights",
      quickFacts: "Constitutional Highlights",
      prev: "Previous",
      next: "Next",
      nationalValues: "National Values & Principles",
      nationalValuesDesc: "Article 10 binds all State organs, State officers, public officers and all persons whenever they apply or interpret the Constitution.",
      popularTopics: "Popular Legal Topics",
      popularTopicsDesc: "Click to search for relevant provisions in the Legal Index.",
      checkListTitle: "Key Pillars",
      quotesTitle: "Sovereignty & Power",
      p1: "Patriotism, National Unity & Rule of Law",
      p2: "Human Dignity, Equity & Social Justice",
      p3: "Inclusiveness, Equality & Human Rights",
      p4: "Good Governance, Integrity & Accountability",
      p5: "Sustainable Development"
    },
    sw: {
      title: "Mwangaza wa Kiraia",
      subtitle: "Maelezo ya jumla na ufahamu wa Katiba ya Kenya (2010)",
      quickStats: "Takwimu za Haraka",
      chapters: "Sura",
      articles: "Vifungu",
      counties: "Kaunti",
      rights: "Haki za Msingi",
      quickFacts: "Mambo Muhimu ya Katiba",
      prev: "Iliyopita",
      next: "Inayofuata",
      nationalValues: "Maadili ya Kitaifa na Kanuni",
      nationalValuesDesc: "Kifungu cha 10 kinawafunga wanachama wote wa vyombo vya Dola, maafisa wa serikali, maafisa wa umma na kila mtu anapotumia au kutafsiri Katiba hii.",
      popularTopics: "Mada Maarufu za Kisheria",
      popularTopicsDesc: "Bonyeza ili utafute vifungu husika kwenye Faharasa ya Kisheria.",
      checkListTitle: "Nguzo Kuu",
      quotesTitle: "Utawala & Nguvu",
      p1: "Uzalendo, Umoja wa Kitaifa na Utawala wa Sheria",
      p2: "Utu wa Binadamu, Usawa na Haki ya Kijamii",
      p3: "Ushirikishwaji, Usawa na Haki za Binadamu",
      p4: "Utawala Bora, Uadilifu na Uwajibikaji",
      p5: "Maendeleo Endelevu"
    }
  };

  const t = translations[language] || translations.en;

  const quickFacts = [
    {
      article: "Article 1",
      title: language === 'sw' ? "Mamlaka ya Wananchi" : "Sovereignty of the People",
      text: language === 'sw' 
        ? "Mamlaka yote ya kifalme ni ya wananchi wa Kenya na yataendeshwa tu kwa mujibu vya Katiba hii."
        : "All sovereign power belongs to the people of Kenya and shall be exercised only in accordance with this Constitution."
    },
    {
      article: "Article 2",
      title: language === 'sw' ? "Ukuu wa Katiba" : "Supremacy of the Constitution",
      text: language === 'sw'
        ? "Katiba hii ndiyo sheria kuu ya Jamhuri na inamfunga kila mtu na vyombo vyote vya Dola katika viwango vyote vya serikali."
        : "This Constitution is the supreme law of the Republic and binds all persons and all State organs at both levels of government."
    },
    {
      article: "Article 10",
      title: language === 'sw' ? "Maadili ya Kitaifa" : "National Values & Governance",
      text: language === 'sw'
        ? "Uzalendo, umoja wa kitaifa, ugatuzi wa mamlaka, utawala wa sheria, demokrasia na ushirikishwaji wa wananchi."
        : "Patriotism, national unity, sharing and devolving power, the rule of law, democracy, and participation of the people."
    },
    {
      article: "Article 19",
      title: language === 'sw' ? "Haki za Binadamu" : "Human Rights Framework",
      text: language === 'sw'
        ? "Mswada wa Haki ni sehemu muhimu ya muundo wa kidemokrasia wa Kenya na ndio msingi wa sera za kijamii na kiuchumi."
        : "The Bill of Rights is an integral part of Kenya's democratic state and is the framework for social, economic and cultural policies."
    }
  ];

  const popularTopics = [
    { name: language === 'sw' ? "Haki za Kimsingi" : "Fundamental Rights", query: "freedom of media, rights of arrested persons, child protection" },
    { name: language === 'sw' ? "Ugatuzi na Kaunti" : "Devolution & Counties", query: "devolved government, county functions, sharing of revenue" },
    { name: language === 'sw' ? "Uadilifu wa Viongozi" : "Leadership & Integrity", query: "conduct of state officers, financial integrity, oath of office" },
    { name: language === 'sw' ? "Uraia na Pasi" : "Citizenship & Passport", query: "dual citizenship, acquisition of citizenship, entitlement to passport" },
    { name: language === 'sw' ? "Mfumo wa Mahakama" : "Judiciary & Justice", query: "independence of judiciary, supreme court, access to justice" },
    { name: language === 'sw' ? "Rasilimali za Umma" : "Public Finance", query: "equalisation fund, budget process, auditor general" }
  ];

  const handleNextFact = () => {
    setFactIndex((prev) => (prev + 1) % quickFacts.length);
  };

  const handlePrevFact = () => {
    setFactIndex((prev) => (prev - 1 + quickFacts.length) % quickFacts.length);
  };

  const navigateToSearch = (query: string) => {
    localStorage.setItem('presetSearchQuery', query);
    setActiveTab('search');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Header */}
      <header className="px-6 md:px-10 py-6 bg-white border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-900 leading-tight">
              {t.title}
            </h1>
            <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">
              {t.subtitle}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.chapters}</p>
            <p className="text-3xl font-serif font-bold text-slate-900 mt-2">18</p>
            <p className="text-[10px] text-slate-500 mt-2">Organized sectors of law</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.articles}</p>
            <p className="text-3xl font-serif font-bold text-slate-900 mt-2">264</p>
            <p className="text-[10px] text-slate-500 mt-2">Constitutional sections</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.counties}</p>
            <p className="text-3xl font-serif font-bold text-slate-900 mt-2">47</p>
            <p className="text-[10px] text-slate-500 mt-2">Devolved units of governance</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.rights}</p>
            <p className="text-3xl font-serif font-bold text-slate-900 mt-2">30+</p>
            <p className="text-[10px] text-slate-500 mt-2">Protected freedoms</p>
          </div>
        </div>

        {/* Highlight Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Highlights Carousel */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex flex-col justify-between min-h-[260px]">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">{t.quickFacts}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={handlePrevFact}
                    className="p-1.5 rounded-lg border border-slate-250 hover:bg-slate-50 active:scale-95 transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={handleNextFact}
                    className="p-1.5 rounded-lg border border-slate-250 hover:bg-slate-50 active:scale-95 transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Slide Content */}
              <div className="p-6 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-1 text-xs font-bold font-serif bg-white text-slate-800 rounded border border-slate-200">
                    {quickFacts[factIndex].article}
                  </span>
                  <Quote size={20} className="text-slate-300" />
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900 mb-2">{quickFacts[factIndex].title}</h3>
                <p className="text-sm text-slate-700 leading-relaxed font-sans">{quickFacts[factIndex].text}</p>
              </div>
            </div>

            <div className="flex justify-center gap-1.5 mt-6">
              {quickFacts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setFactIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === factIndex ? 'w-6 bg-slate-700' : 'bg-slate-200'}`}
                />
              ))}
            </div>
          </div>

          {/* Static Preamble Card */}
          <div className="bg-slate-800 text-white rounded-xl p-8 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{t.quotesTitle}</span>
              <p className="font-serif italic text-sm md:text-base text-slate-200 leading-relaxed mt-6">
                {language === 'sw' 
                  ? `"Mamlaka yote ya kikatiba yanatoka kwa wananchi wenyewe... Nchi inapaswa kuongozwa kwa demokrasia, usawa, na haki za binadamu."`
                  : `"All sovereign power belongs to the people of Kenya... The democratic principles of governance must safeguard peace and progress."`}
              </p>
            </div>
            <div className="mt-8 border-t border-slate-700 pt-4">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Constitution Preamble</p>
              <p className="text-[10px] text-slate-500 mt-1">Republic of Kenya</p>
            </div>
          </div>
        </div>

        {/* National Values & Popular Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* National Values Article 10 */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h3 className="font-serif font-bold text-base text-slate-950 mb-2">{t.nationalValues}</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">{t.nationalValuesDesc}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">1</span>
                <span className="text-xs font-medium text-slate-700">{t.p1}</span>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">2</span>
                <span className="text-xs font-medium text-slate-700">{t.p2}</span>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">3</span>
                <span className="text-xs font-medium text-slate-700">{t.p3}</span>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">4</span>
                <span className="text-xs font-medium text-slate-700">{t.p4}</span>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-3 md:col-span-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">5</span>
                <span className="text-xs font-medium text-slate-700">{t.p5}</span>
              </div>
            </div>
          </div>

          {/* Popular Search Topics */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-serif font-bold text-base text-slate-950 mb-2">{t.popularTopics}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">{t.popularTopicsDesc}</p>
              
              <div className="flex flex-wrap gap-2">
                {popularTopics.map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => navigateToSearch(topic.query)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors text-xs font-medium text-slate-700"
                  >
                    <span>{topic.name}</span>
                    <ArrowUpRight size={10} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-4 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Civic Educator Index v1.0
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
