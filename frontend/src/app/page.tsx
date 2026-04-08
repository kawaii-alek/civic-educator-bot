import Sidebar from '@/components/Sidebar';
import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    <main className="h-screen w-full flex bg-slate-100 p-0 overflow-hidden">
        <Sidebar />
        <ChatInterface />
    </main>
  );
}
