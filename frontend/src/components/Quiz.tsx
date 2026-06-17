'use client';

interface QuizProps {
  language: string;
  setIsSidebarOpen: (open: boolean) => void;
}

export default function Quiz({ language, setIsSidebarOpen }: QuizProps) {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
      <header className="px-6 py-6 bg-white border-b border-slate-200">
        <h1 className="text-xl font-serif font-bold text-slate-900">Interactive Quiz</h1>
      </header>
      <div className="p-6">
        <p>Loading quiz categories...</p>
      </div>
    </div>
  );
}
