
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Command, Users, Briefcase, Calendar, MessageSquare, Settings, X, ArrowRight } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = [
    { id: 'dashboard', title: 'Dashboard', icon: <Briefcase size={18} />, path: 'dashboard', category: 'Navigation' },
    { id: 'employees', title: 'Employee Directory', icon: <Users size={18} />, path: 'employees', category: 'Navigation' },
    { id: 'recovery', title: 'Recovery CRM', icon: <Briefcase size={18} />, path: 'recovery', category: 'Navigation' },
    { id: 'leave', title: 'Leave Management', icon: <Calendar size={18} />, path: 'leave', category: 'Navigation' },
    { id: 'messages', title: 'Internal Messaging', icon: <MessageSquare size={18} />, path: 'messages', category: 'Navigation' },
    { id: 'settings', title: 'System Settings', icon: <Settings size={18} />, path: 'settings', category: 'Navigation' },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        onNavigate(filteredCommands[selectedIndex].path);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [filteredCommands, selectedIndex, onNavigate, onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setQuery('');
      setSelectedIndex(0);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-50 flex items-center gap-4">
              <Search className="text-gray-400" size={24} />
              <input 
                autoFocus
                type="text"
                placeholder="Search commands, pages, or actions..."
                className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-blue-900 placeholder:text-gray-300"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <Command size={10} /> K
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((cmd, index) => (
                  <button
                    key={cmd.id}
                    onClick={() => { onNavigate(cmd.path); onClose(); }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                      index === selectedIndex ? 'bg-blue-50 text-blue-900' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${index === selectedIndex ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {cmd.icon}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black uppercase tracking-tight">{cmd.title}</p>
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{cmd.category}</p>
                      </div>
                    </div>
                    {index === selectedIndex && (
                      <motion.div layoutId="arrow" initial={{ x: -10 }} animate={{ x: 0 }}>
                        <ArrowRight size={18} />
                      </motion.div>
                    )}
                  </button>
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-gray-400 font-medium italic serif">No commands found for "{query}"</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-50 flex items-center justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest">
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><ArrowRight size={10} className="rotate-90" /> Select</span>
                <span className="flex items-center gap-1">Enter Open</span>
              </div>
              <span>Srinidhi Command Center</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
