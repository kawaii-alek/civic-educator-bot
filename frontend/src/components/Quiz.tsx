'use client';

import { useState } from 'react';

interface QuizProps {
  language: string;
  setIsSidebarOpen: (open: boolean) => void;
}

export default function Quiz({ language, setIsSidebarOpen }: QuizProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const categories: Record<string, any> = {
    rights: {
      title: language === 'sw' ? "Mswada wa Haki" : "Bill of Rights",
      desc: "Test your knowledge on fundamental rights and freedoms."
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
      <header className="px-6 py-6 bg-white border-b border-slate-200">
        <h1 className="text-xl font-serif font-bold text-slate-900">
          {language === 'sw' ? "Jaribio la Kiraia" : "Interactive Quiz"}
        </h1>
      </header>
      <div className="p-6 space-y-6">
        {!activeCategory ? (
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm max-w-md">
            <h2 className="font-serif font-bold text-lg text-slate-900">{categories.rights.title}</h2>
            <p className="text-sm text-slate-500 mt-2">{categories.rights.desc}</p>
            <button 
              onClick={() => setActiveCategory('rights')}
              className="mt-4 px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold"
            >
              Start Quiz
            </button>
          </div>
        ) : (
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
            <p>Question panel and answers coming soon...</p>
            <button 
              onClick={() => setActiveCategory(null)}
              className="mt-4 px-4 py-2 bg-slate-200 text-slate-800 rounded text-xs font-semibold"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
