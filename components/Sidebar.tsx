
import React from 'react';
import { NAV_ITEMS } from '../constants';
import Logo from './Logo';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user }) => {
  const filteredNavItems = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col hidden md:flex z-20">
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
        {filteredNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-blue-50 text-blue-900 font-bold' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            {/* Fix: casting the icon to ReactElement<any> ensures the compiler allows generic props like 'size' */}
            {React.cloneElement(item.icon as React.ReactElement<any>, { size: 20 })}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
          <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-xl object-cover shadow-sm border border-white" />
          <div className="flex-1 truncate">
            <p className="text-xs font-bold text-blue-900 truncate uppercase tracking-tight">{user.name}</p>
            <p className="text-[10px] text-gray-400 truncate uppercase font-bold tracking-widest">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
