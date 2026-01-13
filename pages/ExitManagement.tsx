
import React, { useState, useMemo } from 'react';
import { 
  LogOut, 
  FileText, 
  Calendar, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  User as UserIcon, 
  Clock, 
  ShieldAlert, 
  ArrowRight, 
  Plus, 
  X,
  UserCheck,
  History,
  MessageSquare
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
      status: 'Pending'
    };

    setResignationRequests(prev => [...prev, newRequest]);
    setIsApplying(false);
    setFormData({ reason: '', lastWorkingDate: '' });

    employees.filter(e => e.role === 'HR').forEach(hr => {
      addNotification(hr.id, "Resignation Alert", `${user.name} has submitted a resignation request.`);
    });

    if (user.id !== 'emp-alice') {
      addNotification('emp-alice', "Direct Report Resignation", `${user.name} has applied for resignation.`);
    }
  };

  const handleAction = (requestId: string, action: ResignationStatus) => {
    setResignationRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const updatedReq = { ...req, status: action };
        addNotification(req.employeeId, `Resignation ${action}`, `Your resignation request has been ${action.toLowerCase()} by HR.`);

        // AUTOMATIC RELIEVING LETTER GENERATION
        if (action === 'Accepted') {
          const now = new Date();
          const timestamp = now.toLocaleString();
          
          const newRelievingLetter: Document = {
            id: `rl-${Date.now()}`,
            name: `Relieving Letter - ${req.employeeName}`,
            type: 'Relieving Letter',
            uploadDate: now.toISOString().split('T')[0],
            status: 'Verified',
            verifiedBy: `HR Master [${user.name}]`,
            statusHistory: [{ 
              status: 'Verified', 
              timestamp,
              verifiedBy: `System Policy Auto-Trigger`
            }]
          };

          setEmployees(prevEmps => prevEmps.map(emp => 
            emp.id === req.employeeId 
              ? { ...emp, documents: [newRelievingLetter, ...(emp.documents || [])], status: 'Inactive' } 
              : emp
          ));
          
          addNotification(req.employeeId, "Exit Document Issued", "Your official Relieving Letter has been automatically generated and is available in your Registry.");
        }

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
          <p className="text-gray-500 font-medium">Handle personnel separation and resignation protocols.</p>
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
                    <ShieldAlert size={16} /> Resignation Protocol Active
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
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee Name</p>
                      <p className="text-lg font-bold text-blue-900">{myResignation.employeeName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Working Date</p>
                      <p className="text-lg font-bold text-red-600 uppercase">{myResignation.lastWorkingDate}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reason for Separation</p>
                    <div className="mt-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 italic text-xs text-gray-500">
                      "{myResignation.reason}"
                    </div>
                  </div>
                </div>
                
                {myResignation.status === 'Accepted' && (
                  <div className="mt-8 p-6 bg-green-50 border border-green-100 rounded-[2rem] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-500 text-white rounded-xl shadow-lg shadow-green-500/20"><CheckCircle size={20}/></div>
                      <p className="text-xs font-black text-green-800 uppercase tracking-tight">Relieving Letter Injected into Registry</p>
                    </div>
                    <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">Check Documents Tab</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {isHR && (
            <section className="space-y-4">
              <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest px-4 flex items-center gap-2">
                <History size={18} className="text-blue-900/30" /> Resignation Pipeline
              </h2>
              {allRequests.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-16 text-center border border-dashed border-gray-200">
                  <FileText size={48} className="mx-auto text-gray-200 mb-4" />
                  <h3 className="text-lg font-bold text-blue-900">No resignation requests found</h3>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">The separation registry is currently vacant.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allRequests.map(req => (
                    <div key={req.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-[1.5rem] flex items-center justify-center font-black text-lg shadow-inner">
                            {req.employeeName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-black text-blue-900 uppercase tracking-tight">{req.employeeName}</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Separation Request &bull; Applied {req.appliedDate}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase">
                                <Calendar size={12} /> Expected Last Day: {req.lastWorkingDate}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {req.status === 'Pending' && (
                            <>
                              <button 
                                onClick={() => handleAction(req.id, 'Accepted')}
                                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 shadow-lg shadow-green-500/10 active:scale-95"
                              >
                                <CheckCircle size={14} /> Accept
                              </button>
                              <button 
                                onClick={() => handleAction(req.id, 'Rejected')}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-100 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95"
                              >
                                <XCircle size={14} /> Reject
                              </button>
                            </>
                          )}
                          {req.status !== 'Pending' && (
                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border ${
                              req.status === 'Accepted' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                            }`}>
                              {req.status}
                            </span>
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

          {!isHR && !myResignation && (
            <div className="bg-white rounded-[2.5rem] p-16 text-center border border-dashed border-gray-200">
              <LogOut size={48} className="mx-auto text-gray-200 mb-4" />
              <h3 className="text-lg font-bold text-blue-900">Career Continuum</h3>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 max-w-xs mx-auto">
                No active separation requests. Your professional status with Srinidhi Associates remains Active.
              </p>
            </div>
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
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">A mandatory notice period of <span className="text-red-400 font-black">30 days</span> is required for all associates.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">02</div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">Asset clearance and digital access revocation occurs on the <span className="text-red-400 font-black">final day</span>.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">03</div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">Full & Final settlement is processed within <span className="text-red-400 font-black">45 days</span> of exit.</p>
                </li>
              </ul>
              
              <div className="mt-10 p-6 bg-white/5 rounded-[2rem] border border-white/10">
                <div className="flex items-center gap-3 text-red-500 mb-3">
                  <MessageSquare size={18} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Exit Interview</p>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-tight">
                  Upon acceptance, HR will schedule a formal exit interview to understand your experience.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm flex items-center gap-6">
             <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
               <ShieldAlert size={28} />
             </div>
             <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registry Status</p>
               <div className="flex items-baseline gap-2 mt-1">
                 <p className="text-xl font-black text-blue-900 uppercase">{user.role === 'HR' ? 'Admin Controller' : 'Permanent Associate'}</p>
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
                <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-900/20"><LogOut size={20}/></div>
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
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Official Statement / Reason</label>
                <textarea 
                  required
                  placeholder="State the primary reason for your departure..."
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  className="w-full h-32 px-5 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-red-900/5 focus:bg-white transition-all font-bold text-sm text-blue-900 resize-none"
                />
              </div>

              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3">
                <ShieldAlert size={18} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-red-900 font-bold uppercase leading-relaxed">
                  Your supervisor and the HR team will be notified immediately upon submission.
                </p>
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
