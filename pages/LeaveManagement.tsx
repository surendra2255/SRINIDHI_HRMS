
import React, { useState, useMemo } from 'react';
import { 
  Plane, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Plus, 
  X, 
  ShieldAlert, 
  FileText, 
  AlertTriangle, 
  Check,
  ChevronRight,
  Info,
  Layers,
  ArrowRight,
  History
} from 'lucide-react';
import { User as UserType, LeaveRequest, Employee, LeaveStatus } from '../types';

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
  
  // Mock HOD/Supervisor checks for demo purposes
  const isSupervisor = isHR || user.id === 'emp-alice'; // Senior Dev Alice acts as supervisor for others
  const isOperationsHOD = isHR || user.id === 'emp-bob'; // Bob acts as HOD Operations
  
  const [isApplying, setIsApplying] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Annual' as LeaveRequest['type'],
    startDate: '',
    endDate: '',
    reason: ''
  });

  const myRequests = useMemo(() => 
    leaveRequests.filter(req => req.employeeId === user.id), 
    [leaveRequests, user.id]
  );

  const pendingApprovals = useMemo(() => {
    return leaveRequests.filter(req => {
      if (req.status === 'Rejected' || req.status === 'Approved' || req.status === 'Policy Violation (HR)') return false;
      
      // Supervisor sees everything pending their approval
      if (isSupervisor && req.status === 'Pending Supervisor') return true;
      
      // HOD sees everything pending HOD approval
      if (isOperationsHOD && req.status === 'Pending HOD') return true;
      
      return false;
    });
  }, [leaveRequests, isSupervisor, isOperationsHOD]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmployee) return;

    const newRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: user.id,
      employeeName: user.name,
      department: currentEmployee.department,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      status: 'Pending Supervisor',
      appliedDate: new Date().toISOString().split('T')[0],
      supervisorApproved: false,
      hodApproved: false
    };

    setLeaveRequests(prev => [newRequest, ...prev]);
    setIsApplying(false);
    setFormData({ type: 'Annual', startDate: '', endDate: '', reason: '' });
    
    // Notify HR team
    employees.filter(e => e.role === 'HR').forEach(hr => {
      addNotification(hr.id, "New Leave Request", `${user.name} has applied for ${formData.type} leave.`);
    });
    
    // Notify Supervisor (Mock: Alice)
    if (user.id !== 'emp-alice') {
      addNotification('emp-alice', "Approval Required", `${user.name} applied for leave and requires your initial approval.`);
    }
  };

  const handleAction = (requestId: string, action: 'Approve' | 'Reject' | 'Policy Violation') => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        let newStatus = req.status;
        let supervisorApproved = req.supervisorApproved;
        let hodApproved = req.hodApproved;

        if (action === 'Policy Violation') {
          newStatus = 'Policy Violation (HR)';
          addNotification(req.employeeId, "Leave Rejected: Policy Violation", "HR has flagged your leave application as a violation of organizational policy.");
        } else if (action === 'Reject') {
          newStatus = 'Rejected';
          addNotification(req.employeeId, "Leave Application Rejected", "Your leave request has been declined by the approval committee.");
        } else if (action === 'Approve') {
          if (req.status === 'Pending Supervisor' && isSupervisor) {
            newStatus = 'Pending HOD';
            supervisorApproved = true;
            addNotification(req.employeeId, "Supervisor Approval Granted", "Your supervisor has approved your leave. It now awaits HOD Operations finalization.");
            // Notify HOD Operations (Mock: Bob)
            addNotification('emp-bob', "HOD Approval Required", `${req.employeeName}'s leave request has been approved by their supervisor and requires your final sign-off.`);
          } else if (req.status === 'Pending HOD' && isOperationsHOD) {
            newStatus = 'Approved';
            hodApproved = true;
            addNotification(req.employeeId, "Leave Approved", "Your leave application has been finalized and approved by the HOD Operations.");
          }
        }

        return { ...req, status: newStatus, supervisorApproved, hodApproved };
      }
      return req;
    }));
  };

  const getStatusColor = (status: LeaveStatus) => {
    switch (status) {
      case 'Approved': return 'bg-green-50 text-green-700 border-green-100';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-100';
      case 'Policy Violation (HR)': return 'bg-slate-900 text-white border-slate-800';
      case 'Pending HOD': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">Time Off & Absence</h1>
          <p className="text-gray-500 font-medium">Coordinate your professional availability and leave records.</p>
        </div>
        <button 
          onClick={() => setIsApplying(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/10 active:scale-95"
        >
          <Plus size={18} /> Apply for Leave
        </button>
      </header>

      {/* Approval Workflow Visualization */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 text-blue-900/5 pointer-events-none">
          <Layers size={140} />
        </div>
        <div className="relative z-10">
          <h2 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-8 flex items-center gap-2">
            <ShieldAlert size={16} className="text-blue-600" /> Multi-Stage Approval Registry
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-[2px] bg-gray-50 -translate-y-1/2 -z-10"></div>
            
            <div className="bg-white p-5 rounded-3xl border border-gray-50 shadow-sm flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-blue-50 text-blue-900 rounded-xl flex items-center justify-center mb-3">01</div>
              <p className="text-[10px] font-black uppercase text-blue-900">Direct Supervisor</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Initial Validation</p>
            </div>
            
            <div className="bg-white p-5 rounded-3xl border border-gray-50 shadow-sm flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-blue-50 text-blue-900 rounded-xl flex items-center justify-center mb-3">02</div>
              <p className="text-[10px] font-black uppercase text-blue-900">HOD Operations</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Operational Finalization</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-50 shadow-sm flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-3">HR</div>
              <p className="text-[10px] font-black uppercase text-blue-900">Policy Oversight</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Veto Authorization</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Requests List */}
        <div className="xl:col-span-2 space-y-8">
          {(isSupervisor || isOperationsHOD || isHR) && pendingApprovals.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest px-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-yellow-600" /> Pending Approval Registry
              </h2>
              <div className="space-y-4">
                {pendingApprovals.map(req => (
                  <div key={req.id} className="bg-white rounded-[2.5rem] p-8 border border-yellow-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-[1.5rem] flex items-center justify-center font-black text-lg shadow-inner uppercase">
                          {req.employeeName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-black text-blue-900 uppercase tracking-tight">{req.employeeName}</h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{req.department} &bull; {req.type} Leave</p>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase">
                              <Calendar size={12} /> {req.startDate} <ArrowRight size={10} /> {req.endDate}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {((req.status === 'Pending Supervisor' && isSupervisor) || 
                          (req.status === 'Pending HOD' && isOperationsHOD)) && (
                          <button 
                            onClick={() => handleAction(req.id, 'Approve')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 shadow-lg shadow-green-500/20 active:scale-95"
                          >
                            <Check size={14} /> Approve Request
                          </button>
                        )}
                        <button 
                          onClick={() => handleAction(req.id, 'Reject')}
                          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-100 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95"
                        >
                          <X size={14} /> Decline
                        </button>
                        {isHR && (
                          <button 
                            onClick={() => handleAction(req.id, 'Policy Violation')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                          >
                            <ShieldAlert size={14} /> Policy Reject
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 italic text-xs text-gray-500">
                      "{req.reason}"
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-4">
            <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest px-4 flex items-center gap-2">
              <History size={18} className="text-blue-900/30" /> My Leave History
            </h2>
            {myRequests.length === 0 ? (
              <div className="bg-white rounded-[2.5rem] p-16 text-center border border-dashed border-gray-200">
                <Plane size={48} className="mx-auto text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-blue-900">No leave records found</h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Your historical presence registry is currently clear.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {myRequests.map(req => (
                  <div key={req.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-blue-100">
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl ${getStatusColor(req.status)}`}>
                        <Plane size={24} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">{req.type} Leave</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">{req.startDate} — {req.endDate}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border ${getStatusColor(req.status)}`}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end text-right">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Applied On</p>
                      <p className="text-xs font-bold text-gray-500 uppercase mt-1">{req.appliedDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Policies & Quick Info */}
        <div className="space-y-8">
          <section className="bg-slate-900 text-white rounded-[3rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 text-white/5 pointer-events-none group-hover:text-blue-500/10 transition-all duration-700">
              <Info size={160} />
            </div>
            <div className="relative z-10">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg"><CheckCircle size={16}/></div>
                Leave Policy Guidelines
              </h2>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">01</div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">Applications must be submitted at least <span className="text-blue-400 font-black">7 days</span> in advance for annual leaves.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">02</div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">Medical leave requires a verified <span className="text-blue-400 font-black">Practitioner's Note</span> uploaded to the Registry.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">03</div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">HOD Operations approval is <span className="text-blue-400 font-black">mandatory</span> for all cross-departmental travel.</p>
                </li>
              </ul>
              
              <div className="mt-10 p-6 bg-white/5 rounded-[2rem] border border-white/10">
                <div className="flex items-center gap-3 text-yellow-500 mb-3">
                  <ShieldAlert size={18} />
                  <p className="text-[10px] font-black uppercase tracking-widest">HR Veto Protocol</p>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-tight">
                  HR reserves the right to regret any approval in case of policy violations or organizational priority conflict.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm flex items-center gap-6">
             <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
               <Calendar size={28} />
             </div>
             <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Leave Entitlement</p>
               <div className="flex items-baseline gap-2 mt-1">
                 <p className="text-2xl font-black text-blue-900">22</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Days Remaining</p>
               </div>
             </div>
          </section>
        </div>
      </div>

      {/* Leave Application Modal */}
      {isApplying && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1e3a8a]/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsApplying(false)}></div>
          <div className="relative bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-400">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-900 text-white rounded-2xl"><Plus size={20}/></div>
                <h2 className="text-xl font-black text-blue-900 uppercase tracking-tighter">Apply for Leave</h2>
              </div>
              <button onClick={() => setIsApplying(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><X size={20}/></button>
            </div>

            <form onSubmit={handleApply} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Leave Classification</label>
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
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-blue-900/5 focus:bg-white transition-all font-bold text-xs text-blue-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Operational Justification</label>
                <textarea 
                  required
                  placeholder="Provide brief context for leave request..."
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  className="w-full h-24 px-5 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-blue-900/5 focus:bg-white focus:border-blue-900/20 transition-all font-bold text-sm text-blue-900 resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-blue-900 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-3"
              >
                Submit for Validation <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
