
import React, { useState } from 'react';
import { 
  LifeBuoy, 
  Search, 
  Plus, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  MessageSquare, 
  Filter,
  ArrowRight,
  Monitor,
  Cpu,
  Globe,
  Shield,
  X
} from 'lucide-react';
import { ITSupportTicket, User } from '../types';
import { sendEmailNotification } from '../lib/emailUtils';

interface ITSupportProps {
  user: User;
  addNotification: (userId: string, title: string, message: string) => void;
  logAction: (module: string, action: string, details: string) => void;
}

const MOCK_TICKETS: ITSupportTicket[] = [
  {
    id: 'TKT-1001',
    userId: 'emp-alice',
    userName: 'Alice Johnson',
    title: 'VPN Access Issue',
    description: 'Unable to connect to the corporate VPN from home network.',
    category: 'Network',
    status: 'Open',
    priority: 'High',
    createdAt: '2024-05-16 09:30',
    updatedAt: '2024-05-16 10:00',
    comments: [
      { userId: 'it-1', userName: 'IT Support', text: 'Checking the server logs.', timestamp: '2024-05-16 10:00' }
    ]
  },
  {
    id: 'TKT-1002',
    userId: 'emp-bob',
    userName: 'Bob Smith',
    title: 'Laptop Screen Flickering',
    description: 'The screen flickers intermittently when connected to external monitor.',
    category: 'Hardware',
    status: 'In Progress',
    priority: 'Medium',
    createdAt: '2024-05-15 14:20',
    updatedAt: '2024-05-16 11:00',
    comments: []
  }
];

const ITSupport: React.FC<ITSupportProps> = ({ user, addNotification, logAction }) => {
  const [tickets, setTickets] = useState<ITSupportTicket[]>(MOCK_TICKETS);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'Hardware' as ITSupportTicket['category'],
    priority: 'Medium' as ITSupportTicket['priority']
  });

  const handleAddTicket = () => {
    if (!newTicket.title || !newTicket.description) return;

    const ticket: ITSupportTicket = {
      id: `TKT-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      title: newTicket.title,
      description: newTicket.description,
      category: newTicket.category,
      status: 'Open',
      priority: newTicket.priority,
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      comments: []
    };

    setTickets(prev => [ticket, ...prev]);
    addNotification(user.id, 'Ticket Raised', `Your IT support ticket "${ticket.title}" has been successfully created.`);
    
    // Send email notification
    sendEmailNotification(
      'it-support@srinidhi.com', 
      `New IT Ticket: ${ticket.priority} Priority - ${ticket.title}`,
      `A new ticket has been raised by ${user.name}.\n\nCategory: ${ticket.category}\nPriority: ${ticket.priority}\nDescription: ${ticket.description}`
    );

    // Log action
    logAction('IT Support', 'Create Ticket', `Raised new ticket: ${ticket.title} (${ticket.id})`);

    // Notify IT Admins
    addNotification('it-admin', 'New IT Ticket', `${user.name} raised a ${ticket.priority} priority ticket: ${ticket.title}`);

    setShowNewTicket(false);
    setNewTicket({
      title: '',
      description: '',
      category: 'Hardware',
      priority: 'Medium'
    });
  };

  const getStatusColor = (status: ITSupportTicket['status']) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'Closed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: ITSupportTicket['priority']) => {
    switch (priority) {
      case 'Urgent': return 'text-red-600';
      case 'High': return 'text-orange-600';
      case 'Medium': return 'text-blue-600';
      case 'Low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter serif">IT Support Center</h1>
          <p className="text-gray-500 font-medium">Raise tickets, track progress, and get technical assistance.</p>
        </div>
        <button 
          onClick={() => setShowNewTicket(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20"
        >
          <Plus size={20} /> Raise Ticket
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
            <Clock size={32} />
          </div>
          <div>
            <p className="text-3xl font-black text-blue-900">1.2h</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Avg Response Time</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <p className="text-3xl font-black text-blue-900">94%</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Resolution Rate</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
            <AlertCircle size={32} />
          </div>
          <div>
            <p className="text-3xl font-black text-blue-900">12</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pending Urgent</p>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Active Tickets</h2>
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text"
                  placeholder="Search tickets..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-900/10 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="px-4 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-900 outline-none cursor-pointer"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Network">Network</option>
                <option value="Access">Access</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          {filteredTickets.length > 0 ? filteredTickets.map(ticket => (
            <div key={ticket.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${getStatusColor(ticket.status)}`}>
                    {ticket.category === 'Hardware' ? <Monitor size={16} /> : 
                     ticket.category === 'Network' ? <Globe size={16} /> : 
                     ticket.category === 'Access' ? <Shield size={16} /> : <Cpu size={16} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight">{ticket.title}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{ticket.id} • {ticket.category}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
              
              <p className="text-xs text-gray-600 mb-6 line-clamp-2">{ticket.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                    <Clock size={12} /> {ticket.createdAt}
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${getPriorityColor(ticket.priority)}`}>
                    <AlertCircle size={12} /> {ticket.priority} Priority
                  </div>
                </div>
                <button className="flex items-center gap-2 text-[10px] font-black text-blue-900 uppercase tracking-widest hover:gap-3 transition-all">
                  Details <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )) : (
            <div className="bg-white p-20 rounded-[3rem] border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                <Search size={32} />
              </div>
              <p className="text-gray-400 font-medium italic serif">No tickets found matching your search or filter.</p>
            </div>
          )}
        </div>

        {/* Sidebar / Quick Help */}
        <div className="space-y-6">
          <div className="bg-blue-900 text-white p-8 rounded-[3rem] shadow-2xl shadow-blue-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <h3 className="text-lg font-black uppercase tracking-tight mb-2 relative z-10">Need Instant Help?</h3>
            <p className="text-xs text-blue-100/80 mb-6 relative z-10">Check our knowledge base or chat with our AI assistant for quick resolutions.</p>
            <button className="w-full py-4 bg-white text-blue-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-50 transition-all">
              Open Knowledge Base
            </button>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">System Status</h3>
            <div className="space-y-4">
              {[
                { label: 'Corporate VPN', status: 'Operational' },
                { label: 'Email Servers', status: 'Operational' },
                { label: 'HRMS Portal', status: 'Operational' },
                { label: 'Recovery CRM', status: 'Degraded', color: 'text-orange-500' },
              ].map((sys, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600">{sys.label}</span>
                  <span className={`text-[10px] font-black uppercase ${sys.color || 'text-green-500'}`}>{sys.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-blue-900/20 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="max-w-xl w-full bg-white rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">Raise IT Ticket</h2>
              <button onClick={() => setShowNewTicket(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><X size={20}/></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Issue Title</label>
                <input 
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm text-blue-900 outline-none" 
                  placeholder="e.g. Cannot access recovery database" 
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                  <select 
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-xs text-blue-900 outline-none"
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({...newTicket, category: e.target.value as ITSupportTicket['category']})}
                  >
                    <option>Hardware</option>
                    <option>Software</option>
                    <option>Network</option>
                    <option>Access</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Priority</label>
                  <select 
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-xs text-blue-900 outline-none"
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({...newTicket, priority: e.target.value as ITSupportTicket['priority']})}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  rows={4}
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm text-blue-900 outline-none resize-none" 
                  placeholder="Describe the issue in detail..." 
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                />
              </div>

              <button 
                onClick={handleAddTicket}
                className="w-full py-5 bg-blue-900 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3"
              >
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ITSupport;
