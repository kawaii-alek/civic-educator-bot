import { Scale, MessageSquare, BookOpen, Landmark, Search, ShieldCheck, X, LayoutDashboard, GraduationCap } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const Sidebar = ({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }: SidebarProps) => {
  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <aside className={`w-72 bg-slate-900 text-slate-300 p-8 flex flex-col justify-between transition-transform duration-300 z-50 lg:flex h-full
        ${isSidebarOpen 
          ? 'fixed inset-y-0 left-0 translate-x-0' 
          : 'fixed inset-y-0 left-0 -translate-x-full lg:static lg:translate-x-0'
        }
      `}>
        <div>
          <div className="flex items-center justify-between text-white mb-12">
            <div className="flex items-center gap-3">
              <div className="bg-amber-600 p-2 rounded-lg">
                <Landmark size={24} />
              </div>
              <span className="text-xl font-serif font-bold tracking-tight">Civic Portal</span>
            </div>
            {/* Close button on mobile */}
            <button 
              className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          
          <nav className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 ml-4">Civic Portal</p>
            <NavItem 
              icon={<LayoutDashboard size={18} />} 
              label="Civic Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => handleNavClick('dashboard')}
            />
            <NavItem 
              icon={<MessageSquare size={18} />} 
              label="Expert Assistant" 
              active={activeTab === 'assistant'} 
              onClick={() => handleNavClick('assistant')}
            />
            <NavItem 
              icon={<GraduationCap size={18} />} 
              label="Interactive Quiz" 
              active={activeTab === 'quiz'} 
              onClick={() => handleNavClick('quiz')}
            />
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-6 mb-4 ml-4">Constitution</p>
            <NavItem 
              icon={<BookOpen size={18} />} 
              label="The Bill of Rights" 
              active={activeTab === 'rights'} 
              onClick={() => handleNavClick('rights')}
            />
            <NavItem 
              icon={<ShieldCheck size={18} />} 
              label="National Security" 
              active={activeTab === 'security'} 
              onClick={() => handleNavClick('security')}
            />
            <NavItem 
              icon={<Search size={18} />} 
              label="Legal Search" 
              active={activeTab === 'search'} 
              onClick={() => handleNavClick('search')}
            />
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-8 mt-auto">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-xs font-medium text-slate-400 italic">"All sovereign power belongs to the people of Kenya..."</p>
            <p className="text-[10px] text-slate-500 mt-2 font-bold">— Article 1</p>
          </div>
        </div>
      </aside>
    </>
  );
};

const NavItem = ({ 
  icon, 
  label, 
  active = false, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  onClick: () => void;
}) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
      active 
        ? 'bg-amber-600/10 text-amber-500 border-r-4 border-amber-600' 
        : 'hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default Sidebar;
