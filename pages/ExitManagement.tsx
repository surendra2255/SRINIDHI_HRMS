
import React, { useState, useMemo } from 'react';
import { 
  LogOut, 
  FileText, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  Plus, 
  X,
  History,
  MessageSquare,
  ClipboardCheck,
  BadgeCheck,
  FileBadge,
  // Added missing Clock import to fix the error on line 185
  Clock
} from 'lucide-react';
import { User, ResignationRequest, Employee, ResignationStatus, Document } from '../types';

interface ExitManagementProps {
  user: User;
  resignationRequests: ResignationRequest[];
  setResignationRequests: React.Dispatch<React.SetStateAction<ResignationRequest[]>>;
  addNotification: (userId: string, title: string, message: string) => void;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

const ExitManagement: React.FC<ExitManagementProps> = ({ 
  user, 
  resignationRequests, 
  setResignationRequests, 
  addNotification, 
  employees,
  setEmployees
}) => {
  const isHR = user.role === 'HR';
  const [isApplying, setIsApplying] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    lastWorkingDate: ''
  });

  const myResignation = useMemo(() => 
    resignationRequests.find(req => req.employeeId === user.id), 
    [resignationRequests, user.id]
  );

  const allRequests = useMemo(() => resignationRequests, [resignationRequests]);

  const handleResign = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRequest: ResignationRequest = {
      id: `res-${Date.now()}`,
      employeeId: user.id,
      employeeName: user.name,
      reason: formData.reason,
      appliedDate: new Date().toISOString().split('T')[0],
      lastWorkingDate: formData.lastWorkingDate,
      status: 'Pending',
      clearanceCompleted: false
    };

    setResignationRequests(prev => [...prev, newRequest]);
    setIsApplying(false);
    setFormData({ reason: '', lastWorkingDate: '' });

    employees.filter(e => e.role === 'HR').forEach(hr => {
      addNotification(hr.id, "Resignation Alert", `${user.name} has submitted a resignation request.`);
    });
  };

  const handleAction = (requestId: string, action: ResignationStatus) => {
    setResignationRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const updatedReq = { ...req, status: action };
        addNotification(req.employeeId, `Resignation ${action}`, `Your resignation request has been ${action.toLowerCase()} by HR.`);
        return updatedReq;
      }
      return req;
    }));
  };

  const finalizeClearance = (requestId: string) => {
    setResignationRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const updatedReq = { ...req, clearanceCompleted: true };
        
        // AUTOMATIC RELIEVING LETTER GENERATION UPON WORK COMPLETION
        const now = new Date();
        const timestamp = now.toLocaleString();
        
        const newRelievingLetter: Document = {
          id: `rl-${Date.now()}`,
          name: `Relieving Letter - ${req.employeeName}`,
          type: 'Relieving Letter',
          uploadDate: now.toISOString().split('T')[0],
          status: 'Verified',
          verifiedBy: `HR Clearance Desk [${user.name}]`,
          statusHistory: [{ 
            status: 'Verified', 
            timestamp,
            verifiedBy: `Work Handover Verified by ${user.name}`
          }]
        };

        setEmployees(prevEmps => prevEmps.map(emp => 
          emp.id === req.employeeId 
            ? { ...emp, documents: [newRelievingLetter, ...(emp.documents || [])], status: 'Inactive' } 
            : emp
        ));
        
        addNotification(req.employeeId, "Relieving Letter Issued", "Final work handover confirmed. Your Relieving Letter is now reflected in your Registry.");
        
        return updatedReq;
      }
      return req;
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">Exit Management</h1>
          <p className="text-gray-500 font-medium">Coordinate personnel separation and final work handovers.</p>
        </div>
        {!isHR && !myResignation && (
          <button 
            onClick={() => setIsApplying(true)}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-900/10 active:scale-95"
          >
            <Plus size={18} /> Apply for Resignation
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {!isHR && myResignation && (
            <section className="bg-white p-8 rounded-[3rem] border border-red-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-red-500/5 pointer-events-none">
                <LogOut size={160} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert size={16} /> Resignation Audit Active
                  </h2>
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${
                    myResignation.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                    myResignation.status === 'Accepted' ? 'bg-green-50 text-green-700 border-green-100' :
                    'bg-red-50 text-red-700 border-red-100'
                  }`}>
                    {myResignation.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Personnel Label</p>
                      <p className="text-lg font-bold text-blue-900">{myResignation.employeeName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expected Last Working Date</p>
                      <p className="text-lg font-bold text-red-600 uppercase">{myResignation.lastWorkingDate}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clearance Status</p>
                    {myResignation.clearanceCompleted ? (
                      <div className="mt-2 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3">
                        <BadgeCheck className="text-green-600" size={24} />
                        <div>
                          <p className="text-xs font-black text-green-800 uppercase">Work Handover Completed</p>
                          <p className="text-[9px] text-green-600 uppercase font-bold">Relieving Letter Issued</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-3">
                        <Clock className="text-gray-400" size={24} />
                        <p className="text-xs font-black text-gray-500 uppercase">Pending Final Handover Confirmation</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {isHR && (
            <section className="space-y-4">
              <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest px-4 flex items-center gap-2">
                <History size={18} className="text-blue-900/30" /> Exit Pipeline
              </h2>
              {allRequests.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-16 text-center border border-dashed border-gray-200">
                  <FileText size={48} className="mx-auto text-gray-200 mb-4" />
                  <h3 className="text-lg font-bold text-blue-900">Pipeline is empty</h3>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">No active resignation requests found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allRequests.map(req => (
                    <div key={req.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-blue-900 text-white rounded-[1.5rem] flex items-center justify-center font-black text-lg shadow-lg">
                            {req.employeeName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-black text-blue-900 uppercase tracking-tight">{req.employeeName}</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Applied: {req.appliedDate} &bull; LWD: {req.lastWorkingDate}</p>
                            <div className="flex items-center gap-2 mt-3">
                              <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase border ${
                                req.status === 'Accepted' ? 'bg-green-50 text-green-700 border-green-100' :
                                req.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                'bg-red-50 text-red-700 border-red-100'
                              }`}>
                                {req.status}
                              </span>
                              {req.clearanceCompleted && (
                                <span className="px-3 py-1 bg-blue-900 text-white rounded-lg text-[8px] font-black uppercase flex items-center gap-1">
                                  <FileBadge size={10} /> Letter Issued
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {req.status === 'Pending' && (
                            <>
                              <button onClick={() => handleAction(req.id, 'Accepted')} className="px-4 py-2 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase hover:bg-green-600 transition-all">Accept</button>
                              <button onClick={() => handleAction(req.id, 'Rejected')} className="px-4 py-2 bg-white border border-red-100 text-red-600 rounded-xl text-[10px] font-black uppercase hover:bg-red-50 transition-all">Reject</button>
                            </>
                          )}
                          {req.status === 'Accepted' && !req.clearanceCompleted && (
                            <button 
                              onClick={() => finalizeClearance(req.id)}
                              className="flex items-center gap-2 px-6 py-2.5 bg-blue-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 shadow-xl shadow-blue-900/10 active:scale-95"
                            >
                              <ClipboardCheck size={14} /> Finalize Handover & Issue Letter
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
              )}
            </section>
          )}
        </div>

        <div className="space-y-8">
          <section className="bg-slate-900 text-white rounded-[3rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 text-white/5 pointer-events-none group-hover:text-red-500/10 transition-all duration-700">
              <ShieldAlert size={160} />
            </div>
            <div className="relative z-10">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-lg"><LogOut size={16}/></div>
                Exit Protocols
              </h2>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">01</div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">Acceptance starts the <span className="text-red-400 font-black">handover period</span>.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">02</div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">Relieving letters are generated <span className="text-blue-400 font-black">ONLY</span> after final work completion confirmation by HR.</p>
                </li>
              </ul>
              
              <div className="mt-10 p-6 bg-white/5 rounded-[2rem] border border-white/10">
                <div className="flex items-center gap-3 text-blue-400 mb-3">
                  <BadgeCheck size={18} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Document Registry</p>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-tight">
                  The Relieving Letter will be reflected in the "Documents" page as a verified PDF upon clearance.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {isApplying && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsApplying(false)}></div>
          <div className="relative bg-white rounded-[3rem] p-10 max-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-400">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-600 text-white rounded-2xl"><LogOut size={20}/></div>
                <h2 className="text-xl font-black text-blue-900 uppercase tracking-tighter">Submit Resignation</h2>
              </div>
              <button onClick={() => setIsApplying(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><X size={20}/></button>
            </div>

            <form onSubmit={handleResign} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Proposed Last Working Date</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-red-600 transition-colors" size={18} />
                  <input 
                    type="date" 
                    required
                    value={formData.lastWorkingDate}
                    onChange={e => setFormData({...formData, lastWorkingDate: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-red-900/5 focus:bg-white transition-all font-bold text-sm text-blue-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Transition Note / Reason</label>
                <textarea 
                  required
                  placeholder="State the primary reason and confirm status of current work assignments..."
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  className="w-full h-32 px-5 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-red-900/5 focus:bg-white transition-all font-bold text-sm text-blue-900 resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 active:scale-95 flex items-center justify-center gap-3"
              >
                Apply for Resignation <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExitManagement;
