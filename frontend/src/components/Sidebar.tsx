import { Scale, MessageSquare, BookOpen, Landmark, Search, ShieldCheck } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-72 bg-slate-900 text-slate-300 p-8 flex flex-col justify-between hidden lg:flex">
      <div>
        <div className="flex items-center gap-3 text-white mb-12">
          <div className="bg-amber-600 p-2 rounded-lg">
            <Landmark size={24} />
          </div>
          <span className="text-xl font-serif font-bold tracking-tight">Civic Portal</span>
        </div>
        
        <nav className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 ml-4">Constitution</p>
          <NavItem icon={<MessageSquare size={18} />} label="Expert Assistant" active />
          <NavItem icon={<BookOpen size={18} />} label="The Bill of Rights" />
          <NavItem icon={<ShieldCheck size={18} />} label="National Security" />
          <NavItem icon={<Search size={18} />} label="Legal Search" />
        </nav>
      </div>

      <div className="border-t border-slate-800 pt-8 mt-auto">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <p className="text-xs font-medium text-slate-400 italic">"All sovereign power belongs to the people of Kenya..."</p>
          <p className="text-[10px] text-slate-500 mt-2 font-bold">— Article 1</p>
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <a 
    href="#" 
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-amber-600/10 text-amber-500 border-r-4 border-amber-600' 
        : 'hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </a>
);

export default Sidebar;
