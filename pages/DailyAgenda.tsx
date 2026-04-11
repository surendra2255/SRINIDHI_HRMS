
import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  ArrowRight
} from 'lucide-react';
import { FollowUpReminder, User } from '../types';

interface DailyAgendaProps {
  user: User;
  reminders: FollowUpReminder[];
  onComplete: (id: string) => void;
}

const DailyAgenda: React.FC<DailyAgendaProps> = ({ user, reminders, onComplete }) => {
  const [filter, setFilter] = useState<'All' | 'Call' | 'Visit'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReminders = reminders.filter(r => {
    const matchesFilter = filter === 'All' || r.type === filter;
    const matchesSearch = r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.caseId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingReminders = filteredReminders.filter(r => r.status === 'Pending');
  const completedReminders = filteredReminders.filter(r => r.status === 'Completed');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter serif">Daily Agenda</h1>
          <p className="text-gray-500 font-medium">Your schedule for today's recovery follow-ups.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-900 rounded-xl">
            <Calendar size={18} />
            <span className="text-xs font-black uppercase tracking-widest">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-blue-900 text-white p-8 rounded-[3rem] shadow-2xl shadow-blue-900/20">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 mb-2">Today's Progress</p>
            <div className="flex items-end gap-2 mb-6">
              <span className="text-5xl font-black">{completedReminders.length}</span>
              <span className="text-xl font-bold text-blue-300 mb-1">/ {reminders.length}</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-8">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000" 
                style={{ width: `${(completedReminders.length / reminders.length) * 100}%` }}
              ></div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-2"><Phone size={14} /> Calls Pending</span>
                <span>{pendingReminders.filter(r => r.type === 'Call').length}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-2"><MapPin size={14} /> Visits Pending</span>
                <span>{pendingReminders.filter(r => r.type === 'Visit').length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Quick Filters</p>
            <div className="space-y-2">
              {['All', 'Call', 'Visit'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    filter === f ? 'bg-blue-50 text-blue-900' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {f === 'All' ? 'All Tasks' : f === 'Call' ? 'Phone Follow-ups' : 'Field Visits'}
                  {filter === f && <ChevronRight size={16} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by customer or case ID..." 
              className="w-full pl-16 pr-6 py-5 bg-white border border-gray-100 rounded-[2rem] text-sm font-medium shadow-sm focus:ring-4 focus:ring-blue-900/5 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Pending Tasks */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">Pending Follow-ups</h3>
            {pendingReminders.length > 0 ? (
              pendingReminders.map((reminder) => (
                <div key={reminder.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                        reminder.type === 'Call' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                      }`}>
                        {reminder.type === 'Call' ? <Phone size={24} /> : <MapPin size={24} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-black text-blue-900">{reminder.customerName}</span>
                          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">#{reminder.caseId}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                          <span className="flex items-center gap-1"><Clock size={14} /> Due: {reminder.dueDate}</span>
                          <span className={`flex items-center gap-1 ${reminder.status === 'Overdue' ? 'text-red-500' : ''}`}>
                            <AlertCircle size={14} /> {reminder.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => onComplete(reminder.id)}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                      >
                        <CheckCircle2 size={16} /> Mark Done
                      </button>
                      <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all">
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 p-12 rounded-[3rem] border border-dashed border-gray-200 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4 shadow-sm">
                  <CheckCircle2 size={32} />
                </div>
                <p className="text-gray-400 font-medium italic serif">All caught up! No pending tasks for this filter.</p>
              </div>
            )}
          </div>

          {/* Completed Tasks */}
          {completedReminders.length > 0 && (
            <div className="space-y-4 opacity-60">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">Completed Today</h3>
              {completedReminders.map((reminder) => (
                <div key={reminder.id} className="bg-white p-4 rounded-[2rem] border border-gray-50 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-600 line-through">{reminder.customerName}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{reminder.type} • {reminder.caseId}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded-lg">Completed</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyAgenda;
