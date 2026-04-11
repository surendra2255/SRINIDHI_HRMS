
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plane, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus, 
  X, 
  ShieldAlert, 
  Layers, 
  ArrowRight, 
  History,
  AlertCircle,
  CalendarDays,
  FileCheck,
  AlertTriangle,
  ArrowDownCircle,
  HeartPulse,
  Users,
  Info,
  ShieldCheck
} from 'lucide-react';
import { User as UserType, LeaveRequest, Employee, LeaveStatus, LeaveBalance } from '../types';
import { LEAVE_BALANCES } from '../constants';
import SignatureModal from '../components/SignatureModal';

interface LeaveManagementProps {
  user: UserType;
  leaveRequests: LeaveRequest[];
  setLeaveRequests: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  addNotification: (userId: string, title: string, message: string) => void;
  employees: Employee[];
}

const LeaveManagement: React.FC<LeaveManagementProps> = ({ 
  user, 
  leaveRequests, 
  setLeaveRequests, 
  addNotification, 
  employees 
}) => {
  const isHR = user.role === 'HR';
  const currentEmployee = employees.find(e => e.id === user.id);
  
  const currentYear = new Date().getFullYear();
  const minDate = `${currentYear}-01-01`;
  const maxDate = `${currentYear}-12-31`;

  const [isApplying, setIsApplying] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ id: string, action: 'Approved' | 'Rejected' } | null>(null);
  const [formData, setFormData] = useState({
    type: 'Annual' as LeaveRequest['type'],
    startDate: '',
    endDate: '',
    reason: '',
    days: 0
  });

  // Calculate days whenever dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      // Calculate duration - positive if logical, negative if 'To' is before 'From'
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      setFormData(prev => ({ ...prev, days: diffDays > 0 ? diffDays : 0 }));
    } else {
      setFormData(prev => ({ ...prev, days: 0 }));
    }
  }, [formData.startDate, formData.endDate]);

  const selectedBalance = useMemo(() => {
    return LEAVE_BALANCES.find(b => b.type === formData.type) || LEAVE_BALANCES[0];
  }, [formData.type]);

  const isExceedingBalance = formData.days > selectedBalance.available;
  const remainingAfter = selectedBalance.available - formData.days;

  const myRequests = useMemo(() => 
    leaveRequests.filter(req => req.employeeId === user.id), 
    [leaveRequests, user.id]
  );

  const pendingApprovals = useMemo(() => {
    if (!isHR) return [];
    return leaveRequests.filter(req => req.status === 'Pending');
  }, [leaveRequests, isHR]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmployee) return;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    // 1. Year Validation
    if (start.getFullYear() !== currentYear || end.getFullYear() !== currentYear) {
      alert(`Policy Restriction: All leave requests must be confined to the current calendar year (${currentYear}).`);
      return;
    }

    // 2. Chronological Validation
    if (end < start) {
      alert("Invalid Date Sequence: The 'To Date' must occur on or after the 'From Date'.");
      return;
    }

    if (formData.days <= 0) {
      alert("Validation Error: Please select a valid date range.");
      return;
    }

    const newRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: user.id,
      employeeName: user.name,
      department: currentEmployee.department,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      days: formData.days,
      reason: formData.reason,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0],
    };

    setLeaveRequests(prev => [newRequest, ...prev]);
    setIsApplying(false);
    setFormData({ type: 'Annual', startDate: '', endDate: '', reason: '', days: 0 });
    
    addNotification(user.id, "Leave Application Submitted", `Your ${newRequest.type} leave request for ${newRequest.days} days has been received.`);
    
    // Notify HR team
    employees.filter(e => e.role === 'HR').forEach(hr => {
      addNotification(hr.id, "Action Required: Leave Request", `${user.name} has submitted a leave application.`);
    });
  };

  const handleAction = (requestId: string, action: 'Approved' | 'Rejected') => {
    if (action === 'Approved') {
      setPendingAction({ id: requestId, action });
      setIsSignatureModalOpen(true);
    } else {
      confirmAction(requestId, action);
    }
  };

  const confirmAction = (requestId: string, action: 'Approved' | 'Rejected', signature?: string) => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        addNotification(req.employeeId, `Leave ${action}`, `Your request for ${req.startDate} has been ${action.toLowerCase()}.${signature ? ` Signed by ${user.name}.` : ''}`);
        return { ...req, status: action };
      }
      return req;
    }));
    if (signature) {
      // In a real app, we'd log the signature too
      console.log(`Leave ${requestId} approved with signature: ${signature}`);
    }
  };

  const getStatusStyles = (status: LeaveStatus) => {
    switch (status) {
      case 'Approved': return 'bg-green-50 text-green-700 border-green-100';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-100';
      case 'Pending': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    }
  };

  // Detailed policy info for leave types
  const leavePolicyDetails = [
    {
      type: 'Annual Leave',
      icon: <Plane size={20} />,
      purpose: 'Designated for rest, vacation, and personal time to ensure work-life balance.',
      rules: [
        'Requires minimum 7 days notice.',
        'Must be utilized within the current calendar year.',
        'Encashment options available per tenure.'
      ],
      color: 'blue'
    },
    {
      type: 'Sick Leave',
      icon: <HeartPulse size={20} />,
      purpose: 'Reserved for medical recovery, illness, or necessary medical appointments.',
      rules: [
        'Over 3 consecutive days requires a medical certificate.',
        'Can be availed with immediate notification.',
        'Accumulated days do not carry over indefinitely.'
      ],
      color: 'red'
    },
    {
      type: 'Personal Leave',
      icon: <Info size={20} />,
      purpose: 'For urgent personal matters, religious observances, or emergencies.',
      rules: [
        'Prior supervisor verbal approval recommended.',
        'Limited to short-duration absences.',
        'Unused days expire at year-end.'
      ],
      color: 'yellow'
    },
    {
      type: 'Maternity/Paternity',
      icon: <Users size={20} />,
      purpose: 'Supporting personnel during the addition of a new family member.',
      rules: [
        '90 days total entitlement for primary caregivers.',
        'Requires 30 days advance submission of intent.',
        'Supporting legal/medical certification mandatory.'
      ],
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">Time Off Registry</h1>
          <p className="text-gray-500 font-medium">Manage entitlements, view availability, and track absence requests.</p>
        </div>
        <button 
          onClick={() => setIsApplying(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/10 active:scale-95"
        >
          <Plus size={18} /> Apply for New Leave
        </button>
      </header>

      {/* Leave Balances Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {LEAVE_BALANCES.map((balance) => (
          <div key={balance.type} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm group hover:border-blue-200 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-900 rounded-xl group-hover:bg-blue-900 group-hover:text-white transition-colors">
                <CalendarDays size={20} />
              </div>
              <span className="text-[10px] font-black text-blue-900 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-widest">
                Entitlement
              </span>
            </div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{balance.type}</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-blue-900">{balance.available}</p>
              <p className="text-xs font-bold text-gray-400">Available</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-[10px] font-bold uppercase tracking-tight">
              <span className="text-gray-400">Total: {balance.total}</span>
              <span className="text-blue-900">Used: {balance.used}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Detailed Policy Section */}
      <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-600" /> Organizational Policy Registry
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Detailed breakdown of leave classifications & governing rules</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-lg text-[9px] font-black uppercase tracking-widest">Fiscal Year {currentYear}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          {leavePolicyDetails.map((policy) => (
            <div key={policy.type} className="p-8 space-y-6 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-${policy.color}-50 text-${policy.color}-600`}>
                  {policy.icon}
                </div>
                <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest">{policy.type}</h3>
              </div>
              
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Purpose</p>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">{policy.purpose}</p>
              </div>

              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Key Policies</p>
                <ul className="space-y-2">
                  {policy.rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2 text-[10px] text-gray-500 font-bold leading-tight uppercase tracking-tighter">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-200 mt-1 shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Admin Pending Approvals */}
          {isHR && pendingApprovals.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest px-4 flex items-center gap-2">
                <AlertCircle size={18} className="text-blue-600" /> Pending Approval Registry
              </h2>
              <div className="space-y-4">
                {pendingApprovals.map(req => (
                  <div key={req.id} className="bg-white rounded-[2.5rem] p-8 border border-blue-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-[1.5rem] flex items-center justify-center font-black text-lg shadow-inner uppercase">
                          {req.employeeName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-black text-blue-900 uppercase tracking-tight">{req.employeeName}</h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{req.department} &bull; {req.type} Leave</p>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-tight">
                              <Clock size={12} /> {req.days} Days Request
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase">
                              <Calendar size={12} /> {req.startDate} <ArrowRight size={10} /> {req.endDate}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleAction(req.id, 'Approved')}
                          className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, 'Rejected')}
                          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-red-100 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 active:scale-95 transition-all"
                        >
                          <XCircle size={14} /> Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* My Leave History */}
          <section className="space-y-4">
            <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest px-4 flex items-center gap-2">
              <History size={18} className="text-blue-900/30" /> Personal Leave History
            </h2>
            {myRequests.length === 0 ? (
              <div className="bg-white rounded-[2.5rem] p-16 text-center border border-dashed border-gray-200">
                <Plane size={48} className="mx-auto text-gray-100 mb-4" />
                <h3 className="text-lg font-bold text-blue-900">No active records</h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Your historical presence registry is currently vacant.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.map(req => (
                  <div key={req.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl ${getStatusStyles(req.status)}`}>
                        <Plane size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">{req.type} Leave</h3>
                          <span className="text-[10px] font-black text-gray-300">•</span>
                          <span className="text-[10px] font-black text-blue-900/40 uppercase">{req.days} Days</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">{req.startDate} — {req.endDate}</p>
                        <div className="mt-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border ${getStatusStyles(req.status)}`}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end text-right">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Registry ID</p>
                      <p className="text-xs font-bold text-gray-500 uppercase mt-1">{req.id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-900 text-white rounded-[3rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 text-white/5 pointer-events-none">
              <FileCheck size={160} />
            </div>
            <div className="relative z-10">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg"><Layers size={16}/></div>
                Policy Guidelines
              </h2>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">01</div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">Applications must be logged at least <span className="text-blue-400 font-black">7 days</span> in advance for annual time off.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">02</div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">Time off requests are restricted to the <span className="text-blue-400 font-black">current fiscal year</span>.</p>
                </li>
              </ul>
              
              <div className="mt-10 p-6 bg-white/5 rounded-[2rem] border border-white/10">
                <div className="flex items-center gap-3 text-blue-400 mb-3">
                  <ShieldAlert size={18} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Approval Protocol</p>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-tight">
                  Initial submission sets status to 'Pending'. Final validation is performed by HR Administration.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {isApplying && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsApplying(false)}></div>
          <div className="relative bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-400">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-900 text-white rounded-2xl shadow-lg shadow-blue-900/20"><Plus size={20}/></div>
                <h2 className="text-xl font-black text-blue-900 uppercase tracking-tighter">New Application</h2>
              </div>
              <button onClick={() => setIsApplying(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><X size={20}/></button>
            </div>

            <form onSubmit={handleApply} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Classification</label>
                <select 
                  required
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as any})}
                  className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-blue-900/5 focus:bg-white focus:border-blue-900/20 transition-all font-bold text-sm text-blue-900"
                >
                  <option value="Annual">Annual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Personal">Personal Leave</option>
                  <option value="Maternity/Paternity">Maternity/Paternity</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">From Date</label>
                  <input 
                    type="date" 
                    required
                    min={minDate}
                    max={maxDate}
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-blue-900/5 focus:bg-white transition-all font-bold text-xs text-blue-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">To Date</label>
                  <input 
                    type="date" 
                    required
                    min={formData.startDate || minDate}
                    max={maxDate}
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-blue-900/5 focus:bg-white transition-all font-bold text-xs text-blue-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Balance Check</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Available Now</p>
                    <p className="text-sm font-black text-blue-900">{selectedBalance.available} Days</p>
                  </div>
                  <div className={`px-5 py-4 border rounded-2xl transition-all ${isExceedingBalance ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Balance After</p>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-black ${isExceedingBalance ? 'text-red-600' : 'text-green-600'}`}>
                        {remainingAfter} Days
                      </p>
                      {isExceedingBalance && <ArrowDownCircle size={14} className="text-red-500 animate-bounce" />}
                    </div>
                  </div>
                </div>
              </div>

              {isExceedingBalance && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in shake duration-500">
                  <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-red-900 font-bold uppercase leading-relaxed">
                      Warning: Insufficient Balance
                    </p>
                    <p className="text-[9px] text-red-700/70 font-medium uppercase tracking-tighter">
                      You are requesting {formData.days} days, but only have {selectedBalance.available} days remaining. This may be processed as Unpaid Leave.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Context / Reason</label>
                <textarea 
                  required
                  placeholder="Provide essential details for leave registry..."
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  className="w-full h-24 px-5 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-blue-900/5 focus:bg-white focus:border-blue-900/20 transition-all font-bold text-sm text-blue-900 resize-none"
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-900 font-bold uppercase leading-relaxed">
                  System Policy: You are applying for leave in calendar year {currentYear}.
                </p>
              </div>

              <button 
                type="submit"
                disabled={formData.days <= 0}
                className={`w-full py-5 text-white rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed ${isExceedingBalance ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-900/20' : 'bg-blue-900 hover:bg-blue-800 shadow-blue-900/20'}`}
              >
                {isExceedingBalance ? 'Proceed with Overdraft' : 'Dispatch for Review'}
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      <SignatureModal 
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onConfirm={(sig) => pendingAction && confirmAction(pendingAction.id, pendingAction.action, sig)}
        title={`Approve Leave Request`}
      />
    </div>
  );
};

export default LeaveManagement;
