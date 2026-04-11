
import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Plus,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { CompanyEvent, Employee } from '../types';

interface CalendarProps {
  employees: Employee[];
}

const MOCK_EVENTS: CompanyEvent[] = [
  {
    id: 'evt-1',
    title: 'Monthly Recovery Audit',
    date: '2026-04-10',
    type: 'Meeting',
    description: 'Reviewing Q1 recovery performance and agent efficiency.',
    location: 'Conference Room A',
    participants: ['Alice Johnson', 'Bob Smith']
  },
  {
    id: 'evt-2',
    title: 'Good Friday Holiday',
    date: '2026-04-03',
    type: 'Holiday',
    description: 'Office closed for Good Friday.'
  },
  {
    id: 'evt-3',
    title: 'HDFC Case Deadline',
    date: '2026-04-15',
    type: 'Deadline',
    description: 'Final submission for REC-001 recovery case.',
    location: 'Legal Dept'
  },
  {
    id: 'evt-4',
    title: 'Field Agent Training',
    date: '2026-04-20',
    type: 'Event',
    description: 'New GPS tracking and evidence capture training.',
    location: 'Training Hall'
  },
  {
    id: 'evt-5',
    title: 'IT System Maintenance',
    date: '2026-04-25',
    type: 'Schedule',
    description: 'Scheduled downtime for server upgrades.',
    location: 'Data Center'
  }
];

const Calendar: React.FC<CalendarProps> = ({ employees }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 8)); // April 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2026, 3, 8));
  const [events, setEvents] = useState<CompanyEvent[]>(MOCK_EVENTS);
  const [searchTerm, setSearchTerm] = useState('');

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const calendarDays = useMemo(() => {
    const days = [];
    const totalDays = daysInMonth(year, currentDate.getMonth());
    const startDay = firstDayOfMonth(year, currentDate.getMonth());

    // Padding for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, currentDate.getMonth(), i));
    }

    return days;
  }, [currentDate, year]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    return events.filter(e => e.date === dateStr);
  }, [selectedDate, events]);

  const nextMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));

  const getEventTypeColor = (type: CompanyEvent['type']) => {
    switch (type) {
      case 'Meeting': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Holiday': return 'bg-green-100 text-green-700 border-green-200';
      case 'Deadline': return 'bg-red-100 text-red-700 border-red-200';
      case 'Event': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Schedule': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter serif">Organizational Timeline</h1>
          <p className="text-gray-500 font-medium">Centralized calendar for tasks, schedules, and corporate events.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20">
            <Plus size={20} /> Add Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            {/* Design Recipe 9: Oversized Typographic Anchor */}
            <div className="absolute top-4 left-8 opacity-[0.03] pointer-events-none select-none">
              <span className="text-[200px] font-black leading-none text-blue-900 serif">
                {(currentDate.getMonth() + 1).toString().padStart(2, '0')}
              </span>
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center shadow-inner">
                    <CalendarIcon size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">{monthName}</h2>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">{year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                  <button onClick={prevMonth} className="p-3 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-blue-900 shadow-sm hover:shadow-md"><ChevronLeft size={20}/></button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-blue-900 hover:bg-white rounded-xl transition-all">Today</button>
                  <button onClick={nextMonth} className="p-3 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-blue-900 shadow-sm hover:shadow-md"><ChevronRight size={20}/></button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center py-2">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{day}</span>
                  </div>
                ))}
                {calendarDays.map((date, i) => {
                  if (!date) return <div key={`empty-${i}`} className="aspect-square"></div>;
                  
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  const dateStr = date.toISOString().split('T')[0];
                  const dayEvents = events.filter(e => e.date === dateStr);

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(date)}
                      className={`aspect-square rounded-[2rem] p-4 flex flex-col items-center justify-between transition-all relative group border ${
                        isSelected 
                          ? 'bg-blue-900 text-white border-blue-900 shadow-2xl shadow-blue-900/40 scale-105 z-10' 
                          : isToday
                            ? 'bg-blue-50 text-blue-900 border-blue-100 shadow-inner'
                            : 'bg-white text-gray-600 border-gray-50 hover:border-blue-200 hover:shadow-lg'
                      }`}
                    >
                      <span className={`text-lg font-black ${isSelected ? 'text-white' : 'text-blue-900'}`}>
                        {date.getDate()}
                      </span>
                      
                      {dayEvents.length > 0 && (
                        <div className="flex gap-1">
                          {dayEvents.slice(0, 3).map((e, idx) => (
                            <div 
                              key={idx} 
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-white/40' : 'bg-blue-900/20'
                              }`} 
                            />
                          ))}
                        </div>
                      )}

                      {dayEvents.length > 0 && !isSelected && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[8px] font-black rounded-lg flex items-center justify-center shadow-lg border-2 border-white animate-in zoom-in duration-300">
                          {dayEvents.length}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upcoming Legend */}
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Event Classifications</h3>
            <div className="flex flex-wrap gap-4">
              {['Meeting', 'Holiday', 'Deadline', 'Event', 'Schedule'].map((type) => (
                <div key={type} className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getEventTypeColor(type as any)}`}>
                  {type}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Selected Date Details */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-blue-900 text-white p-10 rounded-[3.5rem] shadow-2xl shadow-blue-900/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles size={120} />
            </div>
            
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-300 mb-2">Selected Date</p>
              <h3 className="text-4xl font-black uppercase tracking-tighter mb-1 serif">
                {selectedDate?.toLocaleDateString('default', { day: 'numeric', month: 'short' })}
              </h3>
              <p className="text-sm font-bold text-blue-200 mb-8">{selectedDate?.toLocaleDateString('default', { weekday: 'long', year: 'numeric' })}</p>

              <div className="space-y-6">
                {selectedDateEvents.length === 0 ? (
                  <div className="py-12 text-center space-y-4 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-sm">
                    <Clock size={40} className="mx-auto text-blue-400/30" />
                    <p className="text-xs font-black uppercase tracking-widest text-blue-300">No events scheduled</p>
                  </div>
                ) : (
                  selectedDateEvents.map(event => (
                    <div key={event.id} className="p-6 bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/10 hover:bg-white/15 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 bg-white/20 rounded-lg text-[8px] font-black uppercase tracking-widest text-white border border-white/10">
                          {event.type}
                        </span>
                        <button className="text-white/40 hover:text-white transition-colors"><MoreVertical size={16}/></button>
                      </div>
                      <h4 className="text-lg font-black uppercase tracking-tight mb-2 group-hover:text-blue-300 transition-colors">{event.title}</h4>
                      <p className="text-xs text-blue-100/70 mb-6 leading-relaxed italic">"{event.description}"</p>
                      
                      <div className="space-y-3">
                        {event.location && (
                          <div className="flex items-center gap-3 text-[10px] font-bold text-blue-200 uppercase tracking-widest">
                            <MapPin size={14} className="text-blue-400" /> {event.location}
                          </div>
                        )}
                        {event.participants && (
                          <div className="flex items-center gap-3 text-[10px] font-bold text-blue-200 uppercase tracking-widest">
                            <Users size={14} className="text-blue-400" /> {event.participants.length} Personnel
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button className="w-full mt-8 py-5 bg-white text-blue-900 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-all shadow-xl">
                Create New Entry
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Monthly Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span className="text-[10px] font-black text-blue-900 uppercase">Completed</span>
                </div>
                <span className="text-xs font-black text-blue-900">12</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <AlertCircle size={16} className="text-red-500" />
                  <span className="text-[10px] font-black text-blue-900 uppercase">Deadlines</span>
                </div>
                <span className="text-xs font-black text-blue-900">03</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
