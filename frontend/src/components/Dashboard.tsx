'use client';

interface DashboardProps {
  language: string;
  setIsSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ language, setIsSidebarOpen, setActiveTab }: DashboardProps) {
  const translations: Record<string, any> = {
    en: {
      title: "Civic Dashboard",
      subtitle: "Overview and insights of the Constitution of Kenya (2010)",
      chapters: "Chapters",
      articles: "Articles",
      counties: "Counties",
      rights: "Core Rights"
    },
    sw: {
      title: "Mwangaza wa Kiraia",
      subtitle: "Maelezo ya jumla na ufahamu wa Katiba ya Kenya (2010)",
      chapters: "Sura",
      articles: "Vifungu",
      counties: "Kaunti",
      rights: "Haki za Msingi"
    }
  };

  const t = translations[language] || translations.en;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
      <header className="px-6 py-6 bg-white border-b border-slate-200">
        <h1 className="text-xl font-serif font-bold text-slate-900">{t.title}</h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">{t.subtitle}</p>
      </header>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.chapters}</p>
            <p className="text-3xl font-serif font-bold text-slate-900 mt-2">18</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.articles}</p>
            <p className="text-3xl font-serif font-bold text-slate-900 mt-2">264</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.counties}</p>
            <p className="text-3xl font-serif font-bold text-slate-900 mt-2">47</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.rights}</p>
            <p className="text-3xl font-serif font-bold text-slate-900 mt-2">30+</p>
          </div>
        </div>
      </div>
    </div>
  );
}
