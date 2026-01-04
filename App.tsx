
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Recruitment from './pages/Recruitment';
import Performance from './pages/Performance';
import { Bell, Search, User } from 'lucide-react';
import Logo from './components/Logo';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'employees': return <Employees />;
      case 'recruitment': return <Recruitment />;
      case 'performance': return <Performance />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <nav className="flex items-center justify-between mb-8 sticky top-0 bg-gray-50/80 backdrop-blur-md z-10 py-4">
          <div className="md:hidden flex items-center gap-2">
             <Logo className="w-8 h-8" />
             <span className="font-bold text-sm tracking-tight text-[#1e3a8a] uppercase">Srinidhi</span>
          </div>
          
          <div className="hidden md:flex items-center bg-white rounded-xl border border-gray-200 px-4 py-2 w-96 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <Search className="text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Quick search..." 
              className="bg-transparent border-none outline-none text-sm ml-2 w-full"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:bg-white hover:text-blue-900 rounded-xl transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-50"></span>
            </button>
            <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold group-hover:text-blue-900 transition-colors">Jordan Miller</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Managing Partner</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center text-white border-2 border-white shadow-md overflow-hidden">
                <img src="https://picsum.photos/seed/jordan/80/80" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </nav>

        {renderContent()}
      </main>
    </div>
  );
};

export default App;
