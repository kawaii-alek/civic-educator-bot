'use client';

interface DashboardProps {
  language: string;
  setIsSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ language, setIsSidebarOpen, setActiveTab }: DashboardProps) {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
      <header className="px-6 py-6 bg-white border-b border-slate-200">
        <h1 className="text-xl font-serif font-bold text-slate-900">Civic Dashboard</h1>
      </header>
      <div className="p-6">
        <p>Loading overview and insights...</p>
      </div>
    </div>
  );
}
