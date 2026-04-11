
import React, { useState } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Calendar, 
  User, 
  ChevronRight,
  Target,
  CheckCircle2,
  Clock,
  MoreVertical,
  ArrowUpRight
} from 'lucide-react';
import { PerformanceReview, Employee, User as UserType } from '../types';

interface AppraisalsProps {
  user: UserType;
  appraisals: PerformanceReview[];
  employees: Employee[];
  logAction: (module: string, action: string, details: string) => void;
}

const Appraisals: React.FC<AppraisalsProps> = ({ user, appraisals, employees, logAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredAppraisals = appraisals.filter(a => {
    const matchesSearch = a.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.period.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter serif">Performance Appraisals</h1>
          <p className="text-gray-500 font-medium">Manage employee KPIs and quarterly performance reviews.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-xl text-sm font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20">
            <Plus size={18} /> New Appraisal
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Reviews', value: appraisals.length, icon: <TrendingUp className="text-blue-600" /> },
          { label: 'Avg Rating', value: '4.2/5', icon: <Star className="text-yellow-500" /> },
          { label: 'Pending Feedback', value: '12', icon: <Clock className="text-orange-600" /> },
          { label: 'KPIs Met', value: '86%', icon: <Target className="text-green-600" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gray-50 rounded-2xl">{stat.icon}</div>
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
              placeholder="Search by employee name or period..." 
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
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Acknowledged">Acknowledged</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Period</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rating</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Updated</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAppraisals.length > 0 ? filteredAppraisals.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-900 font-black text-xs">
                        {review.employeeName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{review.employeeName}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Reviewer: {review.reviewerName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-blue-900 uppercase tracking-widest">{review.period}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className={`text-sm font-black ${getRatingColor(review.overallRating)}`}>{review.overallRating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${
                      review.status === 'Acknowledged' ? 'bg-green-100 text-green-700 border-green-200' :
                      review.status === 'Submitted' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-500 font-medium">{review.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-blue-900 hover:bg-blue-50 rounded-lg transition-all" title="View Details"><ArrowUpRight size={16} /></button>
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-all"><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                      <TrendingUp size={32} />
                    </div>
                    <p className="text-gray-400 font-medium italic serif">No appraisals found for the selected criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KPI Section (Sample) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-blue-900 uppercase tracking-tight mb-6">Department KPI Progress</h3>
          <div className="space-y-6">
            {[
              { name: 'Recovery Target Achievement', target: '₹50L', current: '₹42L', progress: 84 },
              { name: 'Customer Satisfaction Score', target: '4.5/5', current: '4.2/5', progress: 93 },
              { name: 'IT Ticket Resolution Time', target: '< 4hrs', current: '3.8hrs', progress: 100 },
              { name: 'Employee Retention Rate', target: '95%', current: '92%', progress: 96 },
            ].map((kpi, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-blue-900 uppercase">{kpi.name}</span>
                  <span className="text-[10px] font-black text-gray-400">{kpi.current} / {kpi.target}</span>
                </div>
                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-900 rounded-full" style={{ width: `${kpi.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-blue-900 text-white p-8 rounded-[3rem] shadow-2xl shadow-blue-900/20 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/10 rounded-2xl">
              <Target size={32} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Quarterly Review Cycle</h3>
          </div>
          <p className="text-blue-100/80 text-sm mb-8 leading-relaxed">
            The Q2 2024 performance review cycle is now active. Managers are requested to submit their evaluations by June 15th.
          </p>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-black">24</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-300">Days Left</p>
            </div>
            <div className="w-[1px] h-10 bg-white/20"></div>
            <div className="text-center">
              <p className="text-2xl font-black">68%</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-300">Submitted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appraisals;
