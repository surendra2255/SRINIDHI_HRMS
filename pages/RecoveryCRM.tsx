
import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  MessageSquare, 
  FileText, 
  MoreVertical,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Download,
  Upload,
  ShieldCheck,
  BarChart3,
  Calculator,
  History,
  X,
  Calendar,
  MapPin
} from 'lucide-react';
import { RecoveryCase, User, CaseTimelineEvent } from '../types';
import { exportToCSV } from '../lib/exportUtils';
import { sendEmailNotification } from '../lib/emailUtils';
import TwoFactorModal from '../components/TwoFactorModal';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface RecoveryCRMProps {
  user: User;
  addNotification: (userId: string, title: string, message: string) => void;
  logAction: (module: string, action: string, details: string) => void;
}

const MOCK_CASES: RecoveryCase[] = [
  {
    id: 'REC-001',
    bankName: 'HDFC Bank',
    accountNumber: 'XXXX-XXXX-1234',
    customerName: 'John Doe',
    amountDue: 45000,
    status: 'In Progress',
    assignedAgentId: 'emp-alice',
    lastUpdate: '2024-05-15',
    notes: ['Customer promised to pay by 20th May'],
    priority: 'High',
    timeline: [
      { id: 't1', caseId: 'REC-001', type: 'Status Change', details: 'Case created and assigned to Alice', agentId: 'emp-md', agentName: 'Srinidhi Rao', timestamp: '2024-05-10 10:00 AM' },
      { id: 't2', caseId: 'REC-001', type: 'Call', details: 'Initial call made. Customer requested more time.', agentId: 'emp-alice', agentName: 'Alice Johnson', timestamp: '2024-05-12 02:30 PM' },
      { id: 't3', caseId: 'REC-001', type: 'Note', details: 'Customer promised to pay by 20th May', agentId: 'emp-alice', agentName: 'Alice Johnson', timestamp: '2024-05-15 11:15 AM' },
    ]
  },
  {
    id: 'REC-002',
    bankName: 'ICICI Bank',
    accountNumber: 'XXXX-XXXX-5678',
    customerName: 'Jane Smith',
    amountDue: 120000,
    status: 'Legal',
    assignedAgentId: 'emp-bob',
    lastUpdate: '2024-05-14',
    notes: ['Legal notice sent on 10th May'],
    priority: 'High',
    timeline: [
      { id: 't4', caseId: 'REC-002', type: 'Status Change', details: 'Case created', agentId: 'emp-md', agentName: 'Srinidhi Rao', timestamp: '2024-05-01 09:00 AM' },
      { id: 't5', caseId: 'REC-002', type: 'Visit', details: 'Field visit conducted. House found locked.', agentId: 'emp-bob', agentName: 'Bob Smith', timestamp: '2024-05-05 11:00 AM' },
      { id: 't6', caseId: 'REC-002', type: 'Legal Action', details: 'Legal notice sent via registered post', agentId: 'emp-md', agentName: 'Srinidhi Rao', timestamp: '2024-05-10 04:00 PM' },
    ]
  },
  {
    id: 'REC-003',
    bankName: 'SBI',
    accountNumber: 'XXXX-XXXX-9012',
    customerName: 'Robert Brown',
    amountDue: 15000,
    status: 'New',
    assignedAgentId: 'emp-alice',
    lastUpdate: '2024-05-16',
    notes: ['New case assigned'],
    priority: 'Medium',
    timeline: []
  }
];

const RecoveryCRM: React.FC<RecoveryCRMProps> = ({ user, addNotification, logAction }) => {
  const [cases, setCases] = useState<RecoveryCase[]>(MOCK_CASES);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'cases' | 'legal' | 'analytics' | 'calculator'>('cases');
  const [selectedCase, setSelectedCase] = useState<RecoveryCase | null>(null);

  // Settlement Calculator State
  const [otsAmount, setOtsAmount] = useState<number>(0);
  const [otsPercentage, setOtsPercentage] = useState<number>(70); // Default 70% waiver/discount? No, usually it's % of principal.
  const [otsPrincipal, setOtsPrincipal] = useState<number>(0);
  const [otsInterest, setOtsInterest] = useState<number>(0);
  const [otsResult, setOtsResult] = useState<{ settlement: number, waiver: number } | null>(null);

  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.bankName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const calculateOTS = () => {
    const total = otsPrincipal + otsInterest;
    const settlement = (otsPrincipal * (otsPercentage / 100));
    const waiver = total - settlement;
    setOtsResult({ settlement, waiver });
    logAction('Recovery CRM', 'Calculate OTS', `Calculated OTS for Principal: ${otsPrincipal}, Interest: ${otsInterest}, Percentage: ${otsPercentage}%`);
  };

  const handleUpdateStatus = (caseId: string, newStatus: RecoveryCase['status']) => {
    const caseToUpdate = cases.find(c => c.id === caseId);
    if (!caseToUpdate) return;

    const oldStatus = caseToUpdate.status;
    const timestamp = new Date().toLocaleString();
    
    const newEvent: CaseTimelineEvent = {
      id: `ev-${Date.now()}`,
      caseId,
      type: 'Status Change',
      details: `Status updated from ${oldStatus} to ${newStatus}`,
      agentId: user.id,
      agentName: user.name,
      timestamp
    };

    setCases(prev => prev.map(c => c.id === caseId ? { 
      ...c, 
      status: newStatus, 
      lastUpdate: new Date().toISOString().split('T')[0],
      timeline: [newEvent, ...(c.timeline || [])]
    } : c));
    
    // Log action
    logAction('Recovery CRM', 'Update Case Status', `Case ${caseId} status changed from ${oldStatus} to ${newStatus}`);
    
    // Notify relevant parties
    addNotification(caseToUpdate.assignedAgentId, 'Case Status Updated', `Case ${caseId} (${caseToUpdate.customerName}) is now ${newStatus}`);
    
    // Send email notification for status change
    sendEmailNotification(
      'management@srinidhi.com',
      `Recovery Case Status Update: ${caseId}`,
      `Case ${caseId} for customer ${caseToUpdate.customerName} has been updated to status: ${newStatus}.\nUpdated by: ${user.name}`
    );

    if (newStatus === 'Legal') {
      addNotification('legal-team', 'New Legal Action', `Case ${caseId} has been moved to Legal status.`);
    }

    if (newStatus === 'Settled' || newStatus === 'Closed') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1e3a8a', '#3b82f6', '#10b981']
      });
    }
  };

  const handleExport = () => {
    setIs2FAModalOpen(true);
  };

  const confirmExport = () => {
    exportToCSV(filteredCases, 'recovery_cases', {
      id: 'Case ID',
      customerName: 'Customer Name',
      bankName: 'Bank Name',
      accountNumber: 'Account Number',
      amountDue: 'Amount Due',
      status: 'Status',
      priority: 'Priority',
      lastUpdate: 'Last Update'
    });
    logAction('Recovery CRM', 'Export Data', `Exported ${filteredCases.length} recovery cases to CSV`);
  };

  const getStatusColor = (status: RecoveryCase['status']) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Legal': return 'bg-red-100 text-red-700 border-red-200';
      case 'Settled': return 'bg-green-100 text-green-700 border-green-200';
      case 'Closed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter serif">Recovery CRM</h1>
          <p className="text-gray-500 font-medium">Banking recovery management and agent tracking system.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
            <Upload size={18} /> Import Records
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-xl text-sm font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20">
            <Plus size={18} /> New Case
          </button>
        </div>
      </div>

      {/* CRM Tabs */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
        {[
          { id: 'cases', label: 'Active Cases', icon: <Database size={16} /> },
          { id: 'legal', label: 'Legal Integration', icon: <ShieldCheck size={16} /> },
          { id: 'analytics', label: 'Performance', icon: <BarChart3 size={16} /> },
          { id: 'calculator', label: 'OTS Calculator', icon: <Calculator size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'cases' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Portfolio', value: '₹4.2 Cr', icon: <TrendingUp className="text-blue-600" />, trend: '+12%' },
              { label: 'Active Cases', value: '1,284', icon: <Database className="text-purple-600" />, trend: '+5%' },
              { label: 'Legal Actions', value: '142', icon: <AlertCircle className="text-red-600" />, trend: '+2%' },
              { label: 'Recovery Rate', value: '68.4%', icon: <CheckCircle2 className="text-green-600" />, trend: '+3.2%' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gray-50 rounded-2xl">{stat.icon}</div>
                  <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg">{stat.trend}</span>
                </div>
                <p className="text-2xl font-black text-blue-900">{stat.value}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by customer, ID or bank..." 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <select 
                  className="px-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-blue-900 outline-none cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Legal">Legal</option>
                  <option value="Settled">Settled</option>
                  <option value="Closed">Closed</option>
                </select>
                <button 
                  onClick={handleExport}
                  className="p-3 bg-gray-50 text-blue-900 rounded-xl hover:bg-blue-100 transition-all" 
                  title="Export CSV"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Case ID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer / Bank</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount Due</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Update</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <AnimatePresence mode="popLayout">
                    {filteredCases.map((c, idx) => (
                      <motion.tr 
                        key={c.id} 
                        variants={item}
                        initial="hidden"
                        animate="show"
                        exit={{ opacity: 0, x: 20 }}
                        layout
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <span className="text-xs font-black text-blue-900">{c.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-bold text-gray-900">{c.customerName}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">{c.bankName} • {c.accountNumber}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-black text-blue-900">₹{c.amountDue.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${getStatusColor(c.status)}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                            <Clock size={14} /> {c.lastUpdate}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => setSelectedCase(c)}
                              className="p-3 md:p-2 text-blue-900 hover:bg-blue-50 rounded-lg transition-all" 
                              title="View Timeline"
                            >
                              <History size={18} />
                            </button>
                            <button className="p-3 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Call Customer"><Phone size={18} /></button>
                            <button className="p-3 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all hidden sm:block" title="Send SMS"><MessageSquare size={18} /></button>
                            <div className="relative group/menu">
                              <button className="p-3 md:p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-all"><MoreVertical size={18} /></button>
                              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 hidden group-hover/menu:block z-50">
                                <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Update Status</p>
                                {['In Progress', 'Legal', 'Settled', 'Closed'].map(status => (
                                  <button 
                                    key={status}
                                    onClick={() => handleUpdateStatus(c.id, status as any)}
                                    className="w-full text-left px-4 py-2 text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                                  >
                                    Mark as {status}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'legal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
              <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight mb-6">Legal Case Filings</h2>
              <div className="space-y-4">
                {[
                  { id: 'LGL-201', customer: 'Jane Smith', bank: 'ICICI', type: 'Section 138', status: 'Notice Sent', date: '2024-05-10' },
                  { id: 'LGL-205', customer: 'Michael Ross', bank: 'HDFC', type: 'Arbitration', status: 'Hearing Scheduled', date: '2024-05-22' },
                  { id: 'LGL-210', customer: 'Sarah Connor', bank: 'SBI', type: 'Civil Suit', status: 'Drafting', date: '2024-05-18' },
                ].map((lgl) => (
                  <div key={lgl.id} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm">
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-blue-900">{lgl.customer}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{lgl.bank} • {lgl.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 bg-white rounded-full text-[9px] font-black uppercase tracking-widest text-blue-900 border border-gray-200">{lgl.status}</span>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">{lgl.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-blue-900 text-white p-8 rounded-[3rem] shadow-2xl shadow-blue-900/20">
              <h3 className="text-lg font-black uppercase tracking-tight mb-4">Legal Software Sync</h3>
              <p className="text-xs text-blue-100/80 mb-6">Your cases are automatically synchronized with the National Legal Portal and internal legal software.</p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span>Last Sync</span>
                  <span className="text-green-400">Success (2m ago)</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span>Pending Filings</span>
                  <span>04 Cases</span>
                </div>
              </div>
              <button className="w-full py-4 bg-white text-blue-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-50 transition-all">
                Force Sync Now
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Recovery Performance (Monthly)</h3>
            <div className="h-64 flex items-end justify-between gap-4 px-4">
              {[45, 60, 35, 80, 55, 70, 90].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-blue-50 rounded-t-xl relative group">
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-blue-900 rounded-t-xl transition-all duration-1000 group-hover:bg-blue-800"
                      style={{ height: `${h}%` }}
                    ></div>
                  </div>
                  <span className="text-[9px] font-black text-gray-400 uppercase">W{i+1}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Agent Efficiency</h3>
            <div className="space-y-6">
              {[
                { name: 'Alice Johnson', recovery: '₹12.4L', rate: '82%' },
                { name: 'Bob Smith', recovery: '₹8.2L', rate: '64%' },
                { name: 'Charlie Davis', recovery: '₹5.1L', rate: '45%' },
              ].map((agent, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-blue-900 uppercase">{agent.name}</span>
                    <span className="text-[10px] font-black text-gray-400">{agent.recovery}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-900 rounded-full" style={{ width: agent.rate }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'calculator' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-blue-50 text-blue-900 rounded-2xl">
                <Calculator size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight">OTS Calculator</h2>
                <p className="text-gray-500 font-medium">Calculate One-Time Settlement amounts based on bank norms.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Principal Amount (₹)</label>
                  <input 
                    type="number" 
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-lg font-black text-blue-900 outline-none focus:ring-2 focus:ring-blue-900/10 transition-all"
                    value={otsPrincipal}
                    onChange={(e) => setOtsPrincipal(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Interest/Charges (₹)</label>
                  <input 
                    type="number" 
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-lg font-black text-blue-900 outline-none focus:ring-2 focus:ring-blue-900/10 transition-all"
                    value={otsInterest}
                    onChange={(e) => setOtsInterest(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Settlement % of Principal</label>
                  <span className="text-sm font-black text-blue-900">{otsPercentage}%</span>
                </div>
                <input 
                  type="range" 
                  min="30" 
                  max="100" 
                  step="5"
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-900"
                  value={otsPercentage}
                  onChange={(e) => setOtsPercentage(Number(e.target.value))}
                />
                <div className="flex justify-between text-[8px] font-black text-gray-400 uppercase">
                  <span>Distressed (30%)</span>
                  <span>Standard (70%)</span>
                  <span>Full (100%)</span>
                </div>
              </div>

              <button 
                onClick={calculateOTS}
                className="w-full py-5 bg-blue-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20"
              >
                Calculate Settlement
              </button>

              {otsResult && (
                <div className="mt-8 p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 animate-in zoom-in duration-300">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Settlement Amount</p>
                      <p className="text-3xl font-black text-blue-900">₹{otsResult.settlement.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Waiver</p>
                      <p className="text-3xl font-black text-green-600">₹{otsResult.waiver.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-blue-100 flex items-center gap-2 text-[10px] font-bold text-blue-700 italic">
                    <AlertCircle size={14} />
                    Note: This is an indicative calculation. Final approval required from Bank Authority.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Case Timeline Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-900 text-white rounded-2xl">
                  <History size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-blue-900 uppercase tracking-tight">Case Timeline</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase">{selectedCase.id} • {selectedCase.customerName}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCase(null)}
                className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <div className="relative space-y-8 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {(selectedCase.timeline || []).length > 0 ? (
                  selectedCase.timeline?.map((event, i) => (
                    <div key={event.id} className="relative pl-12 group">
                      <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${
                        event.type === 'Call' ? 'bg-blue-500 text-white' :
                        event.type === 'Visit' ? 'bg-purple-500 text-white' :
                        event.type === 'Status Change' ? 'bg-orange-500 text-white' :
                        event.type === 'Legal Action' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {event.type === 'Call' && <Phone size={12} />}
                        {event.type === 'Visit' && <MapPin size={12} />}
                        {event.type === 'Status Change' && <Clock size={12} />}
                        {event.type === 'Legal Action' && <ShieldCheck size={12} />}
                        {event.type === 'Note' && <FileText size={12} />}
                      </div>
                      <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100 group-hover:border-blue-100 group-hover:bg-blue-50/30 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">{event.type}</span>
                          <span className="text-[10px] font-bold text-gray-400">{event.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-700 font-medium mb-3">{event.details}</p>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden">
                            <img src={`https://picsum.photos/seed/${event.agentId}/20/20`} alt="" referrerPolicy="no-referrer" />
                          </div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">By {event.agentName}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <History size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-medium italic serif">No timeline events recorded for this case yet.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex gap-4">
              <button className="flex-1 py-4 bg-white border border-gray-200 text-blue-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                Add Note
              </button>
              <button className="flex-1 py-4 bg-blue-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20">
                Log Activity
              </button>
            </div>
          </div>
        </div>
      )}

      <TwoFactorModal 
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        onVerify={confirmExport}
        actionName="Export Recovery Data"
      />

      {/* Mobile Quick Action Bar */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
        <div className="bg-blue-900 rounded-[2.5rem] p-2 shadow-2xl flex items-center justify-between border border-blue-800/50 backdrop-blur-lg">
          <button className="flex flex-col items-center justify-center w-16 h-16 text-blue-300 hover:text-white transition-colors">
            <Plus size={24} />
            <span className="text-[8px] font-black uppercase tracking-widest mt-1">New</span>
          </button>
          <button className="flex flex-col items-center justify-center w-16 h-16 text-blue-300 hover:text-white transition-colors">
            <MapPin size={24} />
            <span className="text-[8px] font-black uppercase tracking-widest mt-1">Visit</span>
          </button>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-900 shadow-xl -mt-12 border-4 border-blue-900 active:scale-90 transition-transform">
            <Phone size={28} />
          </div>
          <button className="flex flex-col items-center justify-center w-16 h-16 text-blue-300 hover:text-white transition-colors">
            <Calculator size={24} />
            <span className="text-[8px] font-black uppercase tracking-widest mt-1">OTS</span>
          </button>
          <button className="flex flex-col items-center justify-center w-16 h-16 text-blue-300 hover:text-white transition-colors">
            <Upload size={24} />
            <span className="text-[8px] font-black uppercase tracking-widest mt-1">Sync</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecoveryCRM;
