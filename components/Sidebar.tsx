
import React from 'react';
import { NAV_ITEMS } from '../constants';
import Logo from './Logo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col hidden md:flex">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Logo className="w-10 h-10 shadow-sm" />
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tighter text-[#1e3a8a] leading-none uppercase">Srinidhi</span>
            <span className="text-xs font-semibold tracking-widest text-gray-500 leading-none mt-1 uppercase">Associates</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-blue-50 text-blue-900 font-semibold' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            {React.cloneElement(item.icon as React.ReactElement, { size: 20 })}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
          <img src="https://picsum.photos/seed/admin/40/40" alt="Admin" className="w-8 h-8 rounded-full" />
          <div className="flex-1 truncate">
            <p className="text-sm font-semibold truncate">Admin User</p>
            <p className="text-xs text-gray-500 truncate">HR Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
